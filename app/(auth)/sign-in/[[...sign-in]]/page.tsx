"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
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
      } else {
        toast.success("Accesso effettuato con successo!");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("Si è verificato un errore durante l'accesso");
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
