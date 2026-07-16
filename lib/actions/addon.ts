"use server";

import dbConnect from "@/lib/db";
import { Addon } from "@/lib/models/Addon";
import { revalidatePath } from "next/cache";

export async function getAddons() {
  await dbConnect();
  try {
    const addons = await Addon.find({ isActive: true }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(addons)) };
  } catch (error) {
    return { success: false, error: "Failed to fetch addons" };
  }
}

export async function createAddon(formData: FormData) {
  await dbConnect();
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    await Addon.create({ name, price });
    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create addon" };
  }
}

export async function deleteAddon(id: string) {
  await dbConnect();
  try {
    await Addon.findByIdAndDelete(id);
    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete addon" };
  }
}
