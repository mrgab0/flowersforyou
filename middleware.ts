import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es'],
 
  // Used when no locale matches
  defaultLocale: 'es'
});

export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}
 
export const config = {
  // Match only internationalized pathnames, skipping api, static files, and internal next paths
  matcher: [
    '/',
    '/(es|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
