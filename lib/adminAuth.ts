"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "ffy_admin_session";

// Contraseña por defecto o la configurada en la variable de entorno
const getAdminPassword = () => process.env.ADMIN_PASSWORD || "flores2026";

export async function loginAdminAction(formData: FormData) {
  const password = formData.get("password") as string;

  if (!password) {
    return { success: false, error: "Ingresa la contraseña del panel." };
  }

  const expectedPassword = getAdminPassword();

  if (password.trim() === expectedPassword.trim()) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, "authenticated_session_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días de sesión activa
      path: "/",
    });

    redirect("/admin");
  }

  return { success: false, error: "Contraseña incorrecta. Inténtalo de nuevo." };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    return !!sessionCookie?.value;
  } catch (error) {
    return false;
  }
}
