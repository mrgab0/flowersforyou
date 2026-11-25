"use server";

import dbConnect from "@/lib/db";
import { Addon, IAddon } from "@/lib/models/Addon";
import { normalizeAddon } from "@/lib/utils/addonCategories";
import { revalidatePath } from "next/cache";

export async function getAddons() {
  await dbConnect();
  try {
    const addons = await Addon.find({
      isActive: true,
      isDeleted: { $ne: true }
    }).sort({ order: 1, createdAt: -1 }).lean();

    const normalized = addons.map((a: any) => normalizeAddon(JSON.parse(JSON.stringify(a))));
    return { success: true, data: normalized };
  } catch (error) {
    return { success: false, error: "Error al obtener adicionales" };
  }
}

export async function getAllAddonsAdmin() {
  await dbConnect();
  try {
    const addons = await Addon.find({
      isDeleted: { $ne: true }
    }).sort({ order: 1, createdAt: -1 }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(addons)) };
  } catch (error) {
    return { success: false, error: "Error al obtener adicionales admin" };
  }
}

export async function createAddon(formData: FormData) {
  await dbConnect();
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const category = (formData.get("category") as string) || "Otros";
    const type = (formData.get("type") as any) || "checkbox";
    const description = (formData.get("description") as string) || "";
    const image = (formData.get("image") as string) || "";
    const optionsRaw = (formData.get("options") as string) || "";
    const options = optionsRaw
      ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
      : [];

    await Addon.create({
      name,
      price,
      category,
      type,
      description,
      image,
      options,
      isActive: true,
      isDeleted: false,
    });

    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error) {
    console.error("Error al crear addon:", error);
    return { success: false, error: "Error al crear adicional" };
  }
}

export async function updateAddon(id: string, formData: FormData) {
  await dbConnect();
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const category = (formData.get("category") as string) || "Otros";
    const type = (formData.get("type") as any) || "checkbox";
    const description = (formData.get("description") as string) || "";
    const image = (formData.get("image") as string) || "";
    const optionsRaw = (formData.get("options") as string) || "";
    const options = optionsRaw
      ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
      : [];

    await Addon.findByIdAndUpdate(id, {
      name,
      price,
      category,
      type,
      description,
      image,
      options,
    });

    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar addon:", error);
    return { success: false, error: "Error al actualizar adicional" };
  }
}

export async function deleteAddon(id: string) {
  await dbConnect();
  try {
    // Soft delete para permitir restauración desde la papelera
    await Addon.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    revalidatePath("/admin/adicionales");
    revalidatePath("/admin/papelera");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar adicional" };
  }
}

// --- ACCIONES DE CARGA MASIVA DE ADICIONALES ---

export async function createBulkAddons(
  addonsData: Array<{
    name: string;
    price: number;
    category: string;
    description?: string;
    image?: string;
    type?: "checkbox" | "text" | "select";
    options?: string[];
  }>,
  publishImmediately: boolean = false
) {
  try {
    await dbConnect();
    if (!addonsData || addonsData.length === 0) {
      return { success: false, error: "No se proporcionaron datos de adicionales." };
    }

    const docsToInsert = addonsData.map((it, idx) => ({
      name: it.name || `Adicional ${idx + 1}`,
      price: it.price || 0,
      category: it.category || "Otros",
      description: it.description || "",
      image: it.image || "",
      type: it.type || "checkbox",
      options: it.options || [],
      isActive: publishImmediately,
      isDeleted: false,
      order: idx,
      createdAt: new Date(),
    }));

    const inserted = await Addon.insertMany(docsToInsert);
    revalidatePath("/admin/adicionales");
    return {
      success: true,
      count: inserted.length,
      addonIds: inserted.map((d) => d._id.toString()),
    };
  } catch (error: any) {
    console.error("Error en createBulkAddons:", error);
    return { success: false, error: error.message || "Error al crear lote de adicionales." };
  }
}

export async function updateBulkAddonBatch(
  addonIds: string[],
  updates: {
    category?: string;
    price?: number;
    type?: "checkbox" | "text" | "select";
    description?: string;
  }
) {
  try {
    await dbConnect();
    if (!addonIds || addonIds.length === 0) {
      return { success: false, error: "No se seleccionaron adicionales para editar." };
    }

    const updatePayload: any = {};
    if (updates.category) updatePayload.category = updates.category;
    if (updates.price !== undefined && updates.price >= 0) updatePayload.price = updates.price;
    if (updates.type) updatePayload.type = updates.type;
    if (updates.description !== undefined) updatePayload.description = updates.description;

    await Addon.updateMany(
      { _id: { $in: addonIds } },
      { $set: updatePayload }
    );

    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error: any) {
    console.error("Error en updateBulkAddonBatch:", error);
    return { success: false, error: error.message || "Error al actualizar lote de adicionales." };
  }
}

export async function publishBulkAddonBatch(addonIds: string[]) {
  try {
    await dbConnect();
    if (!addonIds || addonIds.length === 0) {
      return { success: false, error: "No se seleccionaron adicionales para publicar." };
    }

    await Addon.updateMany(
      { _id: { $in: addonIds } },
      { $set: { isActive: true, isDeleted: false } }
    );

    revalidatePath("/admin/adicionales");
    return { success: true };
  } catch (error: any) {
    console.error("Error en publishBulkAddonBatch:", error);
    return { success: false, error: error.message || "Error al publicar adicionales." };
  }
}
