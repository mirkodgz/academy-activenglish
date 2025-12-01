"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Credenziali non valide");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success("Accesso effettuato con successo!");
        
        // Obtener callbackUrl de los parámetros de búsqueda
        let callbackUrl = searchParams.get("callbackUrl");
        
        console.log("🔍 callbackUrl original:", callbackUrl);
        
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
        
        console.log("✅ Redirigiendo a:", callbackUrl);
        
        // Esperar un momento para que la sesión se establezca completamente
        // Luego actualizar la sesión y redirigir
        setTimeout(async () => {
          try {
            // Forzar actualización de la sesión
            await getSession();
            
            // Usar router.push para navegación del lado del cliente
            // Si falla, usar window.location como fallback
            router.push(callbackUrl);
            
            // Fallback: si después de 1 segundo no se ha redirigido, forzar con window.location
            setTimeout(() => {
              if (window.location.pathname === "/sign-in") {
                console.warn("⚠️ Router.push no funcionó, usando window.location como fallback");
                window.location.href = callbackUrl;
              }
            }, 1000);
          } catch (error) {
            console.error("Error al redirigir:", error);
            // Fallback: usar window.location si hay error
            window.location.href = callbackUrl;
          }
        }, 200);
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
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
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
