import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/shop/Cart/CartContext";

export const metadata: Metadata = {
  title: "Flowers For You LLC",
  description: "Boutique floral de lujo con envíos a domicilio",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.jpg" />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

