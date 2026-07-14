"use server";

import dbConnect from "@/lib/db";
import { Product, slugify } from "@/lib/models/Product";
import { revalidatePath } from "next/cache";

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
      slug: slugify(name),
    }, { new: true });

    revalidatePath("/admin/productos");
    revalidatePath("/");

    return { success: true, id: updated?._id.toString() };
  } catch (error) {
    console.error("Error al editar:", error);
    return { success: false, error: "No se pudo actualizar el producto" };
  }
}

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
      slug: slugify(name),
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

export async function deleteProduct(id: string) {
  await dbConnect();
  await Product.findByIdAndDelete(id);
  revalidatePath("/admin/productos");
  revalidatePath("/");
}
