import Link from 'next/link';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import { CookieConsent } from "@/components/CookieConsent";
import { PedidoFlotante } from "@/components/shop/PedidoFlotante";
import { ShoppingCartComponent } from "@/components/shop/Cart/ShoppingCart";
 
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  let messages;
  try {
    messages = await getMessages({locale});
  } catch (error) {
    notFound();
  }
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
        <header className="p-4 bg-white shadow-sm">
            <div className="container mx-auto">
                <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                    <img src="/logo.jpg" alt="Logo" className="h-16 cursor-pointer" />
                </Link>
            </div>
        </header>
        <PedidoFlotante />
        <ShoppingCartComponent />
        {children}
        <CookieConsent />
    </NextIntlClientProvider>
  );
}
