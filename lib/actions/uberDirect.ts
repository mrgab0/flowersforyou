"use server";

import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { 
  createUberDelivery, 
  getUberDeliveryStatus, 
  cancelUberDelivery, 
  getUberDeliveryQuote,
  testUberDirectConnection,
  UberDirectCredentials
} from "@/lib/uberDirect";
import { revalidatePath } from "next/cache";

/**
 * Despacha un repartidor de Uber Direct para una orden específica
 */
export async function dispatchUberCourierAction(orderId: string, specialInstructions?: string) {
  try {
    await dbConnect();
    const order = await Order.findOne({ orderId });
    if (!order) {
      return { success: false, error: "Pedido no encontrado." };
    }

    if (order.uberDeliveryId && order.uberStatus && !["delivered", "canceled"].includes(order.uberStatus)) {
      return { 
        success: false, 
        error: `Este pedido ya cuenta con un despacho activo de Uber (ID: ${order.uberDeliveryId}).` 
      };
    }

    const res = await createUberDelivery({
      orderId: order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      dropoffAddress: order.address,
      dropoffLat: order.destLat,
      dropoffLng: order.destLng,
      cardMessage: order.cardMessage,
      items: order.items?.map((it: any) => ({
        name: it.name,
        price: it.price,
        quantity: it.quantity || 1
      })),
      specialInstructions
    });

    if (!res.success || !res.data) {
      return { success: false, error: res.error || "No se pudo crear el despacho con Uber Direct." };
    }

    const { deliveryId, trackingUrl, status, fee, courier, dropoffEta } = res.data;

    // Actualizar pedido en MongoDB
    order.uberDeliveryId = deliveryId;
    order.uberTrackingUrl = trackingUrl;
    order.uberStatus = status;
    order.uberFee = fee;
    if (courier) order.uberCourier = courier;
    if (dropoffEta) order.uberDropoffEta = dropoffEta;
    order.status = "En camino";

    await order.save();

    revalidatePath(`/admin/ordenes/${order.orderId}`);
    revalidatePath("/admin/ordenes");
    revalidatePath("/rastreo");
    revalidatePath(`/checkout/confirmacion`);

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(order)),
      trackingUrl 
    };
  } catch (error: any) {
    console.error("Error en dispatchUberCourierAction:", error);
    return { success: false, error: error.message || "Error interno al procesar el despacho" };
  }
}

/**
 * Sincroniza y actualiza el estado del chofer y entrega de Uber Direct
 */
export async function syncUberDeliveryStatusAction(orderId: string) {
  try {
    await dbConnect();
    const order = await Order.findOne({ orderId });
    if (!order || !order.uberDeliveryId) {
      return { success: false, error: "No hay despacho de Uber activo para sincronizar." };
    }

    const res = await getUberDeliveryStatus(order.uberDeliveryId);
    if (!res.success || !res.data) {
      return { success: false, error: res.error || "No se pudo consultar el estado en Uber." };
    }

    const { status, trackingUrl, courier, dropoffEta } = res.data;

    order.uberStatus = status;
    if (trackingUrl) order.uberTrackingUrl = trackingUrl;
    if (courier) order.uberCourier = courier;
    if (dropoffEta) order.uberDropoffEta = dropoffEta;

    if (status === "delivered") {
      order.status = "Entregado";
    } else if (status === "canceled") {
      order.status = "Cancelado";
    }

    await order.save();

    revalidatePath(`/admin/ordenes/${order.orderId}`);
    revalidatePath("/rastreo");

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancela el despacho de Uber Direct
 */
export async function cancelUberDeliveryAction(orderId: string, reason?: string) {
  try {
    await dbConnect();
    const order = await Order.findOne({ orderId });
    if (!order || !order.uberDeliveryId) {
      return { success: false, error: "No hay entrega de Uber para cancelar." };
    }

    const res = await cancelUberDelivery(order.uberDeliveryId, reason);
    if (!res.success) {
      return { success: false, error: res.error || "Error al cancelar en Uber Direct." };
    }

    order.uberStatus = "canceled";
    await order.save();

    revalidatePath(`/admin/ordenes/${order.orderId}`);
    revalidatePath("/rastreo");

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cotiza un envío con Uber Direct
 */
export async function getUberDeliveryQuoteAction(dropoffAddress: string, dropoffPhone?: string) {
  return await getUberDeliveryQuote({ dropoffAddress, dropoffPhone });
}

/**
 * Prueba la conexión con Uber Direct
 */
export async function testUberDirectConnectionAction(overrideCreds?: UberDirectCredentials) {
  return await testUberDirectConnection(overrideCreds);
}
