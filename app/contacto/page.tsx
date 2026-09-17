import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contacto | Flowers For You LLC",
  description: "Ponte en contacto con nuestro equipo de boutique floral para consultas o asesoría personalizada.",
};

export default function ContactoPage() {
  redirect("/");
}
