"use server";

import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";

export async function createOrder(orderData: any, existingOrderId?: string) {
  await dbConnect();

  if (existingOrderId) {
    // Buscamos la orden original por su ID exacto
    const originalOrder = await Order.findOne({ orderId: existingOrderId });
    
    if (originalOrder) {
        // Extraemos la parte base (FFY-12345) y el sufijo (-1)
        const parts = existingOrderId.split('-');
        const baseId = `${parts[0]}-${parts[1]}`;
        const currentVersion = parseInt(parts[2]) || 1;
        const newVersion = currentVersion + 1;
        const newOrderId = `${baseId}-${newVersion}`;

        // Creamos una nueva orden con la información acumulada
        const expandedOrder = new Order({
            ...orderData,
            orderId: newOrderId,
            items: [...originalOrder.items, ...orderData.items],
            total: originalOrder.total + orderData.total,
            createdAt: new Date(),
        });
        
        await expandedOrder.save();
        return { success: true, orderId: expandedOrder.orderId };
    }
  }

  // LÓGICA DE NUEVO PEDIDO
  const newOrder = new Order({
    ...orderData,
    orderId: "FFY-" + Math.floor(Math.random() * 100000) + "-1",
    createdAt: new Date(),
  });

  await newOrder.save();
  return { success: true, orderId: newOrder.orderId };
}
