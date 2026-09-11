import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

/**
 * Webhook Receptor oficial para eventos en tiempo real de Uber Direct
 * Eventos: delivery.status_changed, courier.update, etc.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const deliveryId = body.delivery_id || body.meta?.resource_id || body.data?.id;
    const status = body.status || body.data?.status;
    const courier = body.courier || body.data?.courier;
    const dropoffEta = body.dropoff_eta || body.data?.dropoff_eta;
    const trackingUrl = body.tracking_url || body.data?.tracking_url;

    if (!deliveryId) {
      return NextResponse.json({ received: true, ignored: "No deliveryId found" }, { status: 200 });
    }

    await dbConnect();
    const order = await Order.findOne({ uberDeliveryId: deliveryId });

    if (!order) {
      console.warn(`Webhook Uber Direct: Orden no encontrada para deliveryId ${deliveryId}`);
      return NextResponse.json({ received: true, notFound: true }, { status: 200 });
    }

    // Actualizar estado de Uber
    if (status) {
      order.uberStatus = status;

      if (status === "pickup") {
        order.status = "En camino";
      } else if (status === "pickup_complete" || status === "dropoff") {
        order.status = "En camino";
      } else if (status === "delivered") {
        order.status = "Entregado";
      } else if (status === "canceled") {
        order.status = "Cancelado";
      }
    }

    if (trackingUrl) order.uberTrackingUrl = trackingUrl;
    if (dropoffEta) order.uberDropoffEta = new Date(dropoffEta);
    if (courier) {
      order.uberCourier = {
        name: courier.name || order.uberCourier?.name || "",
        phone: courier.phone_number || order.uberCourier?.phone || "",
        vehicle: `${courier.vehicle_type || ''} ${courier.make || ''} ${courier.model || ''}`.trim() || order.uberCourier?.vehicle || "",
        img: courier.img_href || order.uberCourier?.img || "",
        location: courier.location ? {
          lat: courier.location.lat,
          lng: courier.location.lng
        } : order.uberCourier?.location
      };
    }

    await order.save();

    revalidatePath(`/admin/ordenes/${order.orderId}`);
    revalidatePath("/admin/ordenes");
    revalidatePath("/rastreo");

    return NextResponse.json({ success: true, updatedOrderId: order.orderId });
  } catch (error: any) {
    console.error("Error procesando Webhook de Uber Direct:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
