"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function SignUpPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  
  // Forzar tema claro en registro
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Le password non corrispondono");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La password deve essere di almeno 6 caratteri");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: "STUDENT", // Todos los registros son estudiantes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Errore durante la registrazione");
        return;
      }

      toast.success("Registrazione completata! Ora puoi accedere.");
      router.push("/sign-in");
    } catch {
      toast.error("Si è verificato un errore durante la registrazione");
    } finally {
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
            Crea un account 🎓
          </h1>
          <p className="text-lg text-gray-600">
            Inizia il tuo percorso di apprendimento
          </p>
        </div>
      </div>

      {/* Formulario de registro */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-[#0b3d4d]/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#0b3d4d] font-semibold">
                  Nome
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Mario"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  disabled={isLoading}
                  className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#0b3d4d] font-semibold">
                  Cognome
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Rossi"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  disabled={isLoading}
                  className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0b3d4d] font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                minLength={6}
                className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[#0b3d4d] font-semibold"
              >
                Conferma Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
                minLength={6}
                className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0b3d4d] hover:bg-[#0a3542] text-white font-semibold py-6 text-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrazione in corso...
                </>
              ) : (
                "Registrati"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Hai già un account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#0b3d4d] hover:text-[#0a3542] transition-colors underline-offset-4 hover:underline"
          >
            Accedi qui
          </Link>
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

