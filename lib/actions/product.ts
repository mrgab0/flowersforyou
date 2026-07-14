"use server";

import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Order } from "@/lib/models/Order";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// --- PRODUCT ACTIONS ---

export async function createProduct(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as string;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const sku = formData.get("sku") as string || "";

    const newProduct = new Product({
      name,
      price,
      category,
      description,
      images: [image],
      stock,
      sku,
      slug: name.toLowerCase().replace(/ /g, '-'),
    });

    const saved = await newProduct.save();
    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, id: saved._id.toString() };
  } catch (error) {
    console.error("Error al crear:", error);
    return { success: false, error: "No se pudo guardar el producto" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as string;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const sku = formData.get("sku") as string || "";

    const updated = await Product.findByIdAndUpdate(id, {
      name,
      price,
      category,
      description,
      images: [image],
      stock,
      sku,
      slug: name.toLowerCase().replace(/ /g, '-'),
    }, { new: true });

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, id: updated?._id.toString() };
  } catch (error) {
    console.error("Error al editar:", error);
    return { success: false, error: "No se pudo actualizar el producto" };
  }
}

export async function deleteProduct(id: string) {
  await dbConnect();
  await Product.findByIdAndDelete(id);
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

// --- ORDER ACTIONS ---

export async function createOrder(orderData: any, existingOrderId?: string) {
  await dbConnect();

  let savedOrder;

  if (existingOrderId) {
    const originalOrder = await Order.findOne({ orderId: existingOrderId });
    
    if (originalOrder) {
        const parts = existingOrderId.split('-');
        const baseId = `${parts[0]}-${parts[1]}`;
        const currentVersion = parseInt(parts[2]) || 1;
        const newVersion = currentVersion + 1;
        const newOrderId = `${baseId}-${newVersion}`;

        savedOrder = await Order.create({
            ...orderData,
            orderId: newOrderId,
            items: [...originalOrder.items, ...orderData.items],
            total: originalOrder.total + orderData.total,
            createdAt: new Date(),
        });
    }
  }

  if (!savedOrder) {
    savedOrder = new Order({
        ...orderData,
        orderId: "FFY-" + Math.floor(Math.random() * 100000) + "-1",
        createdAt: new Date(),
    });
    await savedOrder.save();
  }

  // Notificación por Email con Logs de Depuración
  try {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    console.log("DEBUG - Intentando enviar email a:", adminEmails);
    
    const response = await resend.emails.send({
      from: 'hernandezmiriamcalifornia@gmail.com',
      to: adminEmails,
      subject: `Nuevo Pedido: ${savedOrder.orderId}`,
      html: `
        <h1>Nuevo Pedido Recibido</h1>
        <p><strong>Cliente:</strong> ${savedOrder.customerName}</p>
        <p><strong>Teléfono:</strong> ${savedOrder.customerPhone}</p>
        <p><strong>Total:</strong> $${savedOrder.total.toFixed(2)}</p>
        <p><strong>Método de Pago:</strong> ${savedOrder.paymentMethod}</p>
        <p><strong>Referencia:</strong> ${savedOrder.paymentRef}</p>
        <a href="https://wa.me/${savedOrder.customerPhone.replace(/\D/g, '')}">Contactar Cliente por WhatsApp</a>
      `,
    });
    
    console.log("DEBUG - Respuesta de Resend:", JSON.stringify(response));
  } catch (error) {
    console.error("DEBUG - ERROR COMPLETO enviando email:", error);
  }

  return { success: true, orderId: savedOrder.orderId };
}
