/**import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    redirect("/"); // Redirige a home si no es admin
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="font-bold text-xl">Panel de Administración</h1>
        </div>
      </nav>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}



 // app/admin/layout.tsx
    import { auth } from "@/lib/auth";
    import { redirect } from "next/navigation";
   
    export const runtime = 'nodejs';
   
    export default async function AdminLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      const session = await auth();
   
      // --- AÑADE ESTOS LOGS PARA VER QUÉ PASA EN LA TERMINAL ---
      console.log("Sesión en layout admin:", session?.user?.email);
      console.log("Emails permitidos:", process.env.ADMIN_EMAILS);
      // ---------------------------------------------------------
   
      const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
   
      if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
        console.log("ACCESO DENEGADO - Redirigiendo a home");
        redirect("/");
      }
   
      return (
        // ... (resto del código igual) **/

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="font-bold text-xl">Panel de Administración</h1>
        </div>
      </nav>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
