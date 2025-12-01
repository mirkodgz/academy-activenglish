import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Logs solo en producción para debugging (puedes verlos en Vercel logs)
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    console.log("🔒 [MIDDLEWARE] Procesando petición:", {
      pathname,
      method: request.method,
      url: request.url,
      hasCookies: !!request.cookies.toString(),
      cookieNames: request.cookies.getAll().map(c => c.name),
    });
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (isProduction) {
    console.log("🔒 [MIDDLEWARE] Token obtenido:", {
      tieneToken: !!token,
      tokenId: token?.id,
      tokenEmail: token?.email,
      pathname,
    });
  }

  // Rutas públicas (no requieren autenticación)
  const publicRoutes = ["/sign-in", "/sign-up", "/api/auth"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Si está en una ruta pública, permitir acceso
  if (isPublicRoute) {
    if (isProduction) {
      console.log("🔒 [MIDDLEWARE] Ruta pública, permitiendo acceso:", pathname);
    }
    return NextResponse.next();
  }

  // Si no hay token y no está en ruta pública, redirigir al login
  if (!token) {
    if (isProduction) {
      console.log("🔒 [MIDDLEWARE] Sin token, redirigiendo a sign-in:", {
        pathname,
        callbackUrl: pathname,
      });
    }
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isProduction) {
    console.log("🔒 [MIDDLEWARE] Token válido, permitiendo acceso:", pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
