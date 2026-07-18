import type { Metadata } from "next";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";
import { CartProvider } from "@/components/shop/Cart/CartContext";
import { PedidoFlotante } from "@/components/shop/PedidoFlotante";
import { ShoppingCartComponent } from "@/components/shop/Cart/ShoppingCart";

export const metadata: Metadata = {
  title: "Flowers For You | Magenta Flora Modern",
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
        <header className="p-4 bg-white shadow-sm">
            <div className="container mx-auto">
                <img src="/logo.jpg" alt="Logo" className="h-16" />
            </div>
        </header>
        <CartProvider>
          <PedidoFlotante />
          <ShoppingCartComponent />
          {children}
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}

