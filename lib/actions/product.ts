"use server";

import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  await dbConnect();

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as string;

  const newProduct = new Product({
    name,
    price,
    category,
    description,
    images: [image],
    stock: 10,
    slug: name.toLowerCase().replace(/ /g, '-'),
  });

  await newProduct.save();
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await dbConnect();
  await Product.findByIdAndDelete(id);
  revalidatePath("/admin/productos");
  revalidatePath("/");
}
