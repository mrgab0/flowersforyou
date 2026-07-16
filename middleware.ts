/**import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth-config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Si no estamos intentando entrar a /admin, permitimos el paso
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Si intentamos entrar a /admin pero no hay sesión
  if (!req.auth) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  // Si hay sesión, permitimos el acceso
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
**/
/**
  import { NextResponse } from "next/server";
     import { auth } from "@/lib/auth"; // OJO: Si auth() falla aquí, es el problema.
    
     export default auth((req) => {
       console.log("Middleware - Path:", req.nextUrl.pathname);
       console.log("Middleware - ¿Hay sesión?:", !!req.auth);
    
       // No redirijas nada, solo pasa
       return NextResponse.next();
    });
   
    export const config = {
      matcher: ["/admin/:path*"],
    }; **/

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Middleware vacío para evitar carga de librerías Node.js en Edge
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
