"use server";

import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";

export async function createOrder(orderData: any, existingOrderId?: string) {
  await dbConnect();

  if (existingOrderId) {
    // Intentamos encontrar la orden base (ej: quitar el -2, -3 para buscar la base)
    const baseOrderId = existingOrderId.split('-').slice(0, -1).join('-');
    const baseOrder = await Order.findOne({ orderId: new RegExp(`^${baseOrderId}`) }).sort({ createdAt: 1 });

    if (baseOrder) {
      // Calcular nuevo sufijo
      const currentSuffix = parseInt(existingOrderId.split('-').pop() || "1");
      const newSuffix = currentSuffix + 1;
      const newOrderId = `${baseOrderId}-${newSuffix}`;

      // Crear nueva versión de la orden
      const expandedOrder = new Order({
        ...baseOrder.toObject(),
        _id: undefined, // Crear nuevo documento
        orderId: newOrderId,
        items: [...baseOrder.items, ...orderData.items],
        total: baseOrder.total + orderData.total,
        paymentRef: orderData.paymentRef, // Actualizamos con la nueva referencia
        createdAt: new Date(),
      });

      await expandedOrder.save();
      return { success: true, orderId: newOrderId };
    }
  }

  // Si no hay orden existente, creamos la primera
  const baseId = "FFY-" + Math.floor(Math.random() * 100000);
  const newOrder = new Order({
    ...orderData,
    orderId: `${baseId}-1`,
    createdAt: new Date(),
  });

  await newOrder.save();
  return { success: true, orderId: newOrder.orderId };
}
