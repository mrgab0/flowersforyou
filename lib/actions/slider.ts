"use server";

import dbConnect from "@/lib/db";
import { Slider } from "@/lib/models/Slider";
import { revalidatePath } from "next/cache";

export async function createSlider(data: any) {
  try {
    await dbConnect();
    const newSlider = await Slider.create(data);
    revalidatePath("/admin/sliders");
    return { success: true, data: JSON.parse(JSON.stringify(newSlider)) };
  } catch (error) {
    console.error("Error creating slider:", error);
    return { success: false, error: "Failed to create slider" };
  }
}

export async function getSliders() {
  try {
    await dbConnect();
    const sliders = await Slider.find({ isActive: true }).populate('products').lean();
    return { success: true, data: JSON.parse(JSON.stringify(sliders)) };
  } catch (error) {
    return { success: true, data: [] };
  }
}

export async function getSliderById(id: string) {
  try {
    await dbConnect();
    const slider = await Slider.findById(id).lean();
    return { success: true, data: JSON.parse(JSON.stringify(slider)) };
  } catch (error) {
    return { success: false, error: "Failed to fetch slider" };
  }
}

export async function updateSlider(id: string, data: any) {
  try {
    await dbConnect();
    await Slider.findByIdAndUpdate(id, data);
    revalidatePath("/admin/sliders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update slider" };
  }
}

export async function deleteSlider(id: string) {
  try {
    await dbConnect();
    await Slider.findByIdAndDelete(id);
    revalidatePath("/admin/sliders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete slider" };
  }
}
