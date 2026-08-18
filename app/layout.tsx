import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/shop/Cart/CartContext";
import { NextIntlClientProvider } from 'next-intl';
import esMessages from '@/messages/es.json';
import { ThemeProvider } from "@/components/ThemeProvider";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Flowers For You LLC",
  description: "Boutique floral de lujo con envíos a domicilio",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#be185d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="trustpilot-one-time-domain-verification-id" content="e993157a-ecc6-48b6-985d-bca8eebb5fb2" />
        
        {/* Script Oficial Permanente de Integración e Invitaciones de Trustpilot */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
              a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
              f.parentNode.insertBefore(a,f)})(window,document,'script', 'https://invitejs.trustpilot.com/tp.min.js', 'tp');
              tp('register', 'Mj2BoVbFWujG5sRE');
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider locale="es" messages={esMessages}>
            <CartProvider>
              {children}
              <AnalyticsTracker />
              <Analytics />
              <InstallPrompt />
            </CartProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
