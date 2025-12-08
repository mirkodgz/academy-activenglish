"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  // Validar token al cargar la página
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        setIsValid(false);
        setError("Token non fornito");
        return;
      }

      try {
        const response = await axios.get(`/api/auth/set-password?token=${token}`);
        
        if (response.data.valid) {
          setIsValid(true);
          setUserEmail(response.data.email);
        } else {
          setIsValid(false);
          setError(response.data.error || "Token non valido");
        }
      } catch {
        setIsValid(false);
        setError("Errore durante la validazione del token");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!password || !confirmPassword) {
      setError("Compila tutti i campi");
      return;
    }

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/set-password", {
        token,
        password,
      });

      if (response.status === 200) {
        toast.success("Password impostata con successo! Ora puoi accedere.", {
          duration: 3000,
        });
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(errorMessage || "Errore durante l'impostazione della password");
      toast.error(errorMessage || "Errore durante l'impostazione della password");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras valida el token
  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="flex flex-col items-center gap-6 pb-[15px]">
          <Image
            src="/logoactiveenglish.png"
            alt="Active English Logo"
            width={240}
            height={240}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b3d4d] mx-auto mb-4" />
            <p className="text-lg text-gray-600">Validando token...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si el token no es válido
  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="flex flex-col items-center gap-6 pb-[15px]">
          <Image
            src="/logoactiveenglish.png"
            alt="Active English Logo"
            width={240}
            height={240}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0b3d4d] mb-2">
              Token non valido
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {error || "Il link di reset password non è valido o è scaduto."}
            </p>
            <Button
              onClick={() => router.push("/sign-in")}
              className="bg-[#0b3d4d] hover:bg-[#0a3542]"
            >
              Vai al login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar formulario si el token es válido
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="flex flex-col items-center gap-6 pb-[15px]">
        <Image
          src="/logoactiveenglish.png"
          alt="Active English Logo"
          width={240}
          height={240}
          className="object-contain"
          priority
        />
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#0b3d4d] mb-2">
            Imposta la tua password
          </h1>
          {userEmail && (
            <p className="text-sm text-gray-600 mb-2">
              Account: {userEmail}
            </p>
          )}
          <p className="text-lg text-gray-600">
            Crea una nuova password per accedere alla piattaforma
          </p>
        </div>
      </div>

      <div className="w-full max-w-md -mt-4">
        <div className="bg-white rounded-xl shadow-lg border border-[#0b3d4d]/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0b3d4d] font-semibold">
                Nuova Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimo 6 caratteri"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="pl-10 border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#0b3d4d] font-semibold">
                Conferma Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Ripeti la password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="pl-10 border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0b3d4d] hover:bg-[#0a3542] text-white font-semibold py-6 text-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Impostazione in corso...
                </>
              ) : (
                "Imposta Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="flex flex-col items-center gap-6 pb-[15px]">
          <Image
            src="/logoactiveenglish.png"
            alt="Active English Logo"
            width={240}
            height={240}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b3d4d] mx-auto mb-4" />
            <p className="text-lg text-gray-600">Caricamento...</p>
          </div>
        </div>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}

