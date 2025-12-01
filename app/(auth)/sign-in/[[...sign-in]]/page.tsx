"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function SignInForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("🚀 [LOGIN] Iniciando proceso de login...");
    console.log("📧 [LOGIN] Email:", email);
    console.log("🌐 [LOGIN] URL actual:", window.location.href);
    console.log("🍪 [LOGIN] Cookies antes de signIn:", document.cookie);

    try {
      console.log("⏳ [LOGIN] Llamando a signIn...");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("📊 [LOGIN] Resultado de signIn:", {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url,
      });

      if (result?.error) {
        console.error("❌ [LOGIN] Error en signIn:", result.error);
        toast.error("Credenziali non valide");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("✅ [LOGIN] signIn exitoso!");
        toast.success("Accesso effettuato con successo!");
        
        // Verificar cookies inmediatamente después de signIn
        console.log("🍪 [LOGIN] Cookies después de signIn:", document.cookie);
        const hasNextAuthCookie = document.cookie.includes("next-auth");
        console.log("🍪 [LOGIN] ¿Cookie next-auth presente?", hasNextAuthCookie);
        
        // Obtener callbackUrl de los parámetros de búsqueda
        let callbackUrl = searchParams.get("callbackUrl");
        
        console.log("🔍 [LOGIN] callbackUrl original:", callbackUrl);
        
        // Decodificar URL si está codificada (ej: %2F -> /)
        if (callbackUrl) {
          try {
            callbackUrl = decodeURIComponent(callbackUrl);
            console.log("🔍 callbackUrl decodificado:", callbackUrl);
          } catch (error) {
            console.warn("⚠️ Error decodificando callbackUrl:", error);
            // Si falla el decode, usar el valor original
          }
        }
        
        // Si no hay callbackUrl o está vacío, usar "/"
        if (!callbackUrl || callbackUrl === "" || callbackUrl === "null" || callbackUrl === "undefined") {
          callbackUrl = "/";
        }
        
        // Normalizar callbackUrl: extraer pathname si es una URL completa
        try {
          // Si es una URL completa (empieza con http:// o https://)
          if (callbackUrl.startsWith("http://") || callbackUrl.startsWith("https://")) {
            const url = new URL(callbackUrl);
            callbackUrl = url.pathname + url.search;
          }
          // Si es una URL relativa pero contiene el dominio
          else if (callbackUrl.includes(window.location.origin)) {
            const url = new URL(callbackUrl);
            callbackUrl = url.pathname + url.search;
          }
        } catch (error) {
          // Si falla el parseo, usar "/" como fallback
          console.warn("⚠️ Error parsing callbackUrl:", error);
          callbackUrl = "/";
        }
        
        // Validar que callbackUrl no sea una ruta de autenticación
        if (callbackUrl.startsWith("/sign-in") || callbackUrl.startsWith("/sign-up")) {
          callbackUrl = "/";
        }
        
        // Asegurar que callbackUrl empiece con "/"
        if (!callbackUrl.startsWith("/")) {
          callbackUrl = "/" + callbackUrl;
        }
        
        console.log("✅ [LOGIN] Redirigiendo a:", callbackUrl);
        
        // IMPORTANTE: Cuando usamos redirect: false, NextAuth establece la sesión
        // pero el token JWT puede tardar un momento en estar disponible en las cookies.
        // El middleware verifica el token en las cookies, por lo que necesitamos
        // esperar un poco antes de redirigir para asegurar que el token esté disponible.
        
        // Función helper para verificar cookies
        const checkCookies = () => {
          const cookies = document.cookie;
          const hasNextAuthCookie = cookies.includes("next-auth");
          const cookieNames = cookies.split(";").map(c => c.split("=")[0].trim());
          console.log("🍪 [LOGIN] Estado de cookies:", {
            todas: cookies,
            tieneNextAuth: hasNextAuthCookie,
            nombres: cookieNames,
          });
          return hasNextAuthCookie;
        };
        
        // Verificar cookies inmediatamente
        checkCookies();
        
        // Forzar actualización de la sesión primero
        console.log("⏳ [LOGIN] Obteniendo sesión (intento 1)...");
        try {
          const session1 = await getSession();
          console.log("📊 [LOGIN] Sesión obtenida (intento 1):", {
            tieneSesion: !!session1,
            userId: session1?.user?.id,
            email: session1?.user?.email,
            role: session1?.user?.role,
          });
          checkCookies();
        } catch (error) {
          console.warn("⚠️ [LOGIN] Error al obtener sesión (intento 1):", error);
        }
        
        // IMPORTANTE: En producción, las cookies pueden tardar más en establecerse
        // Aumentamos el delay a 1000ms para dar tiempo suficiente
        // También verificamos que la sesión esté disponible antes de redirigir
        console.log("⏳ [LOGIN] Esperando 1000ms antes de verificar sesión...");
        setTimeout(async () => {
          try {
            console.log("⏳ [LOGIN] Verificando sesión (intento 2)...");
            checkCookies();
            
            // Verificar que la sesión esté disponible
            const session = await getSession();
            console.log("📊 [LOGIN] Sesión obtenida (intento 2):", {
              tieneSesion: !!session,
              userId: session?.user?.id,
              email: session?.user?.email,
              role: session?.user?.role,
            });
            
            if (!session) {
              console.warn("⚠️ [LOGIN] Sesión no disponible aún, esperando más tiempo...");
              checkCookies();
              // Esperar otros 500ms si la sesión no está disponible
              setTimeout(() => {
                console.log("🔄 [LOGIN] Ejecutando redirección (sin sesión verificada) a:", callbackUrl);
                console.log("🍪 [LOGIN] Cookies finales antes de redirigir:", document.cookie);
                console.log("🌐 [LOGIN] Redirigiendo desde:", window.location.href);
                console.log("🌐 [LOGIN] Redirigiendo a:", callbackUrl);
                window.location.href = callbackUrl;
              }, 500);
              return;
            }
            
            console.log("✅ [LOGIN] Sesión verificada, redirigiendo a:", callbackUrl);
            checkCookies();
            console.log("🌐 [LOGIN] Redirigiendo desde:", window.location.href);
            console.log("🌐 [LOGIN] Redirigiendo a:", callbackUrl);
            // Usar window.location.href para forzar recarga completa
            // Esto es más confiable que router.push() porque:
            // 1. Fuerza una recarga completa de la página
            // 2. El middleware puede ver el token JWT en las cookies
            // 3. No depende del estado del router de Next.js
            window.location.href = callbackUrl;
          } catch (error) {
            console.error("❌ [LOGIN] Error al verificar sesión:", error);
            checkCookies();
            // Fallback: redirigir de todas formas después de un delay adicional
            setTimeout(() => {
              console.log("🔄 [LOGIN] Ejecutando redirección (fallback) a:", callbackUrl);
              console.log("🍪 [LOGIN] Cookies en fallback:", document.cookie);
              window.location.href = callbackUrl;
            }, 500);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error durante l'accesso:", error);
      toast.error("Si è verificato un errore durante l'accesso");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-md mx-auto">
      {/* Logo y título */}
      <div className="flex flex-col items-center gap-4 mb-2">
        <div className="relative w-20 h-20">
          <Image
            src="/logoactiveenglish.png"
            alt="Active English Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-center">
          <h1 className="font-bold text-4xl text-[#0b3d4d] mb-2">
            Benvenuto
          </h1>
          <p className="text-lg text-gray-600">
            Accedi per continuare al tuo account
          </p>
        </div>
      </div>

      {/* Formulario de login */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-[#0b3d4d]/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0b3d4d] font-semibold">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isLoading}
                className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0b3d4d] font-semibold">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="remember"
                  name="remember"
                  className="rounded" 
                />
                <span className="text-gray-600">Ricordami</span>
              </label>
              <a
                href="#"
                className="text-[#0b3d4d] font-semibold hover:text-[#0a3542] hover:underline"
              >
                Password dimenticata?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0b3d4d] hover:bg-[#0a3542] text-white font-semibold py-6 text-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                "Accedi"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Non hai un account?{" "}
          <a 
            href="/sign-up" 
            className="font-semibold text-[#0b3d4d] hover:text-[#0a3542] transition-colors underline-offset-4 hover:underline"
          >
            Registrati qui
          </a>
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="h-px w-12 bg-gray-300"></div>
          <span>Active English</span>
          <div className="h-px w-12 bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-6 p-6 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4 mb-2">
          <div className="relative w-20 h-20">
            <Image
              src="/logoactiveenglish.png"
              alt="Active English Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-4xl text-[#0b3d4d] mb-2">
              Benvenuto
            </h1>
            <p className="text-lg text-gray-600">
              Accedi per continuare al tuo account
            </p>
          </div>
        </div>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg border border-[#0b3d4d]/10 p-8">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#0b3d4d]" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
