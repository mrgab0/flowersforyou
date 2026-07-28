"use server";

import dbConnect from "@/lib/db";
import { Addon } from "@/lib/models/Addon";
import { revalidatePath } from "next/cache";

export async function getAddons() {
  await dbConnect();
  try {
    const addons = await Addon.find({ isActive: { $ne: false } }).sort({ order: 1, createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(addons)) };
  } catch (error) {
    console.error("Error obteniendo adicionales:", error);
    return { success: false, error: "Failed to fetch addons" };
  }
}

export async function getAllAddonsAdmin() {
  await dbConnect();
  try {
    const addons = await Addon.find({}).sort({ category: 1, order: 1, createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(addons)) };
  } catch (error) {
    console.error("Error obteniendo adicionales admin:", error);
    return { success: false, error: "Failed to fetch admin addons" };
  }
}

export async function getAddonById(id: string) {
  await dbConnect();
  try {
    const addon = await Addon.findById(id).lean();
    if (!addon) return { success: false, error: "Adicional no encontrado" };
    return { success: true, data: JSON.parse(JSON.stringify(addon)) };
  } catch (error) {
    return { success: false, error: "Error al cargar adicional" };
  }
}

export async function createAddon(formData: FormData) {
  await dbConnect();
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const category = formData.get("category") as string || "Otros";
    const type = formData.get("type") as string || "checkbox";
    const image = formData.get("image") as string || "";
    const description = formData.get("description") as string || "";
    const optionsRaw = formData.get("options") as string || "";
    const options = optionsRaw.split(",").map(o => o.trim()).filter(Boolean);

    const newAddon = await Addon.create({
      name,
      price,
      category,
      type,
      image,
      description,
      options,
      isActive: true,
    });

    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/productos");
    return { success: true, id: newAddon._id.toString() };
  } catch (error) {
    console.error("Error al crear adicional:", error);
    return { success: false, error: "No se pudo crear el adicional" };
  }
}

export async function updateAddon(id: string, formData: FormData) {
  await dbConnect();
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const category = formData.get("category") as string || "Otros";
    const type = formData.get("type") as string || "checkbox";
    const image = formData.get("image") as string || "";
    const description = formData.get("description") as string || "";
    const optionsRaw = formData.get("options") as string || "";
    const options = optionsRaw.split(",").map(o => o.trim()).filter(Boolean);

    await Addon.findByIdAndUpdate(id, {
      name,
      price,
      category,
      type,
      image,
      description,
      options,
    });

    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    console.error("Error al editar adicional:", error);
    return { success: false, error: "No se pudo actualizar el adicional" };
  }
}

export async function toggleAddonStatus(id: string, isActive: boolean) {
  await dbConnect();
  try {
    await Addon.findByIdAndUpdate(id, { isActive });
    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    console.error("Error al pausar/activar adicional:", error);
    return { success: false, error: "No se pudo cambiar el estado del adicional" };
  }
}

export async function deleteAddon(id: string) {
  await dbConnect();
  try {
    await Addon.findByIdAndDelete(id);
    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar el adicional" };
  }
}
