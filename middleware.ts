import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es'],
 
  // Used when no locale matches
  defaultLocale: 'es'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si alguien entra a /es/admin o /en/admin, redirigir limpiamente a /admin
  if (pathname.startsWith('/es/admin') || pathname.startsWith('/en/admin')) {
    const cleanAdminPath = pathname.replace(/^\/(es|en)/, '');
    const url = request.nextUrl.clone();
    url.pathname = cleanAdminPath;
    return NextResponse.redirect(url);
  }

  // Protección anti-bot: Redirección inmediata en Edge de rutas de contacto para evitar consumo de CPU
  if (pathname === '/contacto' || pathname === '/es/contacto' || pathname === '/en/contacto') {
    const targetLocale = pathname.startsWith('/en') ? '/en' : '/';
    const url = request.nextUrl.clone();
    url.pathname = targetLocale;
    return NextResponse.redirect(url);
  }

  // Si es una ruta de administración, API o estáticos, omitir internacionalización
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}
 
export const config = {
  // Match only internationalized pathnames, skipping admin, api, static files, and internal next paths
  matcher: [
    '/',
    '/(es|en)/:path*',
    '/((?!api|admin|_next|_vercel|.*\\..*).*)'
  ]
};
