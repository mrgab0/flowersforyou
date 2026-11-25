"use server";

import dbConnect from "@/lib/db";
import { Product, slugify } from "@/lib/models/Product";
import { Order } from "@/lib/models/Order";
import { Addon } from "@/lib/models/Addon";
import { revalidatePath } from "next/cache";

// --- PRODUCT ACTIONS ---

export async function fetchAddonsList() {
  await dbConnect();
  try {
    const addons = await Addon.find({ isDeleted: { $ne: true }, isActive: true }).lean();
    return JSON.parse(JSON.stringify(addons));
  } catch (e) {
    return [];
  }
}

export async function createProduct(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const category = formData.get("category") as string;
    const description = (formData.get("description") as string) || "";
    const images = formData.getAll("images") as string[];
    const stock = parseInt(formData.get("stock") as string) || 0;
    const sku = (formData.get("sku") as string) || "";
    
    // Variantes y Floristería
    const flowerCount = parseInt(formData.get("flowerCount") as string) || 0;
    const bouquetType = (formData.get("bouquetType") as string) || "";
    const badge = (formData.get("badge") as string) || "";
    const addons = formData.getAll("addons") as string[];
    const variants = formData.getAll("variants") as string[];
    const availableColors = formData.getAll("availableColors") as string[];

    // Stem tiers JSON
    let stemTiers: any[] = [];
    const stemTiersJson = formData.get("stemTiersJson") as string;
    if (stemTiersJson) {
      try {
        stemTiers = JSON.parse(stemTiersJson);
      } catch (_) {}
    }

    const featureLabels = formData.getAll("featureLabels") as string[];
    const featureValues = formData.getAll("featureValues") as string[];
    const features = featureLabels
      .map((label, index) => ({ label, value: featureValues[index] }))
      .filter((f) => f.label && f.value);

    const newProduct = new Product({
      name,
      price,
      category,
      description,
      images: images.filter((img) => img && img.trim() !== ""),
      stock,
      sku,
      flowerCount,
      bouquetType,
      badge,
      addons,
      variants,
      availableColors,
      stemTiers,
      features,
      isActive: true,
      isDeleted: false,
      slug: slugify(name),
    });

    const saved = await newProduct.save();
    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, id: saved._id.toString() };
  } catch (error) {
    console.error("Error al crear:", error);
    return { success: false, error: error instanceof Error ? error.message : "No se pudo guardar el producto" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const category = formData.get("category") as string;
    const description = (formData.get("description") as string) || "";
    const images = formData.getAll("images") as string[];
    const stock = parseInt(formData.get("stock") as string) || 0;
    const sku = (formData.get("sku") as string) || "";
    
    const flowerCount = parseInt(formData.get("flowerCount") as string) || 0;
    const bouquetType = (formData.get("bouquetType") as string) || "";
    const badge = (formData.get("badge") as string) || "";
    const addons = formData.getAll("addons") as string[];
    const variants = formData.getAll("variants") as string[];
    const availableColors = formData.getAll("availableColors") as string[];

    let stemTiers: any[] = [];
    const stemTiersJson = formData.get("stemTiersJson") as string;
    if (stemTiersJson) {
      try {
        stemTiers = JSON.parse(stemTiersJson);
      } catch (_) {}
    }

    const featureLabels = formData.getAll("featureLabels") as string[];
    const featureValues = formData.getAll("featureValues") as string[];
    const features = featureLabels
      .map((label, index) => ({ label, value: featureValues[index] }))
      .filter((f) => f.label && f.value);

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        category,
        description,
        images: images.filter((img) => img && img.trim() !== ""),
        stock,
        sku,
        flowerCount,
        bouquetType,
        badge,
        addons,
        variants,
        availableColors,
        stemTiers,
        features,
        slug: slugify(name),
      },
      { new: true }
    );

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, id: updated?._id.toString() };
  } catch (error) {
    console.error("Error al editar:", error);
    return { success: false, error: error instanceof Error ? error.message : "No se pudo actualizar el producto" };
  }
}

export async function deleteProduct(id: string) {
  await dbConnect();
  // Soft delete para permitir recuperación en la papelera
  await Product.findByIdAndUpdate(id, {
    isDeleted: true,
    deletedAt: new Date(),
  });
  revalidatePath("/admin/productos");
  revalidatePath("/admin/papelera");
  revalidatePath("/");
}

// --- CARGA MASIVA DE PRODUCTOS ---

export async function createBulkProducts(
  productsData: Array<{
    name: string;
    price: number;
    category: string;
    description?: string;
    images: string[];
    stock?: number;
    sku?: string;
    badge?: string;
    flowerCount?: number;
    bouquetType?: string;
    addons?: string[];
  }>,
  publishImmediately: boolean = false
) {
  try {
    await dbConnect();

    if (!productsData || productsData.length === 0) {
      return { success: false, error: "No se proporcionaron datos de productos." };
    }

    const docsToInsert = productsData.map((prod, index) => {
      const baseName = prod.name || `Arreglo Floral ${index + 1}`;
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const uniqueSlug = `${slugify(baseName)}-${uniqueSuffix}`;

      return {
        name: baseName,
        slug: uniqueSlug,
        sku: prod.sku || `ffy-${uniqueSuffix}`,
        description: prod.description || "Hermoso arreglo floral preparado con flores frescas seleccionadas.",
        price: prod.price || 45.0,
        images: (prod.images && prod.images.length > 0) ? prod.images : ["/logo.jpg"],
        stock: prod.stock !== undefined ? prod.stock : 10,
        category: prod.category || "General",
        flowerCount: prod.flowerCount || 0,
        bouquetType: prod.bouquetType || "",
        badge: prod.badge || "",
        addons: prod.addons || [],
        isActive: publishImmediately,
        isDeleted: false,
        createdAt: new Date(),
      };
    });

    const inserted = await Product.insertMany(docsToInsert);
    revalidatePath("/admin/productos");
    revalidatePath("/");

    return {
      success: true,
      count: inserted.length,
      productIds: inserted.map((d) => d._id.toString()),
    };
  } catch (error: any) {
    console.error("Error en createBulkProducts:", error);
    return { success: false, error: error.message || "Error al crear productos en lote." };
  }
}

export async function updateBulkBatch(
  productIds: string[],
  updates: {
    category?: string;
    flowerCount?: number;
    bouquetType?: string;
    price?: number;
    stock?: number;
    badge?: string;
    description?: string;
    addons?: string[];
  }
) {
  try {
    await dbConnect();
    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se seleccionaron productos para actualizar." };
    }

    const updatePayload: any = {};
    if (updates.category) updatePayload.category = updates.category;
    if (updates.flowerCount !== undefined) updatePayload.flowerCount = updates.flowerCount;
    if (updates.bouquetType !== undefined) updatePayload.bouquetType = updates.bouquetType;
    if (updates.price !== undefined && updates.price >= 0) updatePayload.price = updates.price;
    if (updates.stock !== undefined && updates.stock >= 0) updatePayload.stock = updates.stock;
    if (updates.badge !== undefined) updatePayload.badge = updates.badge;
    if (updates.description) updatePayload.description = updates.description;
    if (updates.addons && Array.isArray(updates.addons)) updatePayload.addons = updates.addons;

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updatePayload }
    );

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error en updateBulkBatch:", error);
    return { success: false, error: error.message || "Error al actualizar lote de productos." };
  }
}

export async function publishBulkBatch(productIds: string[]) {
  try {
    await dbConnect();
    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se seleccionaron productos para publicar." };
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { isActive: true, isDeleted: false } }
    );

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error en publishBulkBatch:", error);
    return { success: false, error: error.message || "Error al publicar lote de productos." };
  }
}
