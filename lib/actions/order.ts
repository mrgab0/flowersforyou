"use server";

import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { revalidatePath } from "next/cache";

export async function createOrder(orderData: any, existingOrderId?: string) {
  await dbConnect();

  if (existingOrderId) {
    const originalOrder = await Order.findOne({ orderId: existingOrderId });
    
    if (originalOrder) {
      const parts = existingOrderId.split('-');
      const baseId = `${parts[0]}-${parts[1]}`;
      const currentVersion = parseInt(parts[2]) || 1;
      const newVersion = currentVersion + 1;
      const newOrderId = `${baseId}-${newVersion}`;

      const expandedOrder = new Order({
        ...orderData,
        orderId: newOrderId,
        items: [...originalOrder.items, ...orderData.items],
        total: (originalOrder.total || 0) + (orderData.total || 0),
        status: "En diseño",
        createdAt: new Date(),
      });
      
      await expandedOrder.save();
      return { success: true, orderId: expandedOrder.orderId };
    }
  }

  // Lógica de nuevo pedido Flowers For You (prefijo FFY-)
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const newOrder = new Order({
    ...orderData,
    orderId: `FFY-${randomSuffix}-1`,
    status: orderData.status || "En diseño",
    createdAt: new Date(),
  });

  await newOrder.save();
  return { success: true, orderId: newOrder.orderId };
}

export async function getOrderById(orderIdOrPhone: string) {
  try {
    await dbConnect();
    const query = orderIdOrPhone.trim();

    const order = await Order.findOne({
      $or: [
        { orderId: query },
        { customerPhone: { $regex: query, $options: "i" } },
        { customerName: { $regex: query, $options: "i" } }
      ]
    }).lean();

    if (!order) {
      return { success: false, error: "Pedido no encontrado." };
    }

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    console.error("Error al buscar pedido:", error);
    return { success: false, error: "Error al buscar el pedido." };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await dbConnect();
    const updated = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );
    if (!updated) {
      return { success: false, error: "Pedido no encontrado." };
    }
    revalidatePath("/admin/ordenes");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error("Error actualizando estado del pedido:", error);
    return { success: false, error: "Error al actualizar el estado del pedido." };
  }
}

export async function updateOrderAction(orderId: string, updateData: any) {
  try {
    await dbConnect();
    const updated = await Order.findOneAndUpdate(
      { orderId },
      { $set: updateData },
      { new: true }
    );
    if (!updated) {
      return { success: false, error: "Pedido no encontrado para actualizar." };
    }
    revalidatePath("/admin/ordenes");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error("Error actualizando orden:", error);
    return { success: false, error: "Error al actualizar la orden." };
  }
}

export async function getAllOrdersAction() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch (error) {
    console.error("Error obteniendo lista de órdenes:", error);
    return { success: false, error: "No se pudieron obtener las órdenes." };
  }
}
