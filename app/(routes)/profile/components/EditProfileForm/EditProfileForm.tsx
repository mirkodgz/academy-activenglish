"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email("Email non valido"),
  password: z
    .string()
    .min(6, "La password deve essere di almeno 6 caratteri")
    .optional()
    .or(z.literal("")),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditProfileFormProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  onSuccess?: () => void;
}

export function EditProfileForm({ user, onSuccess }: EditProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email,
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const updateData: Partial<FormValues> = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      };

      // Solo incluir la contraseña si se ha modificado
      if (values.password && values.password.length > 0) {
        updateData.password = values.password;
      }

      const response = await axios.patch("/api/profile", updateData);

      if (response.status === 200) {
        toast.success("Profilo aggiornato con successo 🎉");
        router.refresh(); // Refrescar la página para mostrar los datos actualizados
        onSuccess?.(); // Cerrar el modo de edición
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || "Errore durante l'aggiornamento del profilo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Sezione: Informazioni di base */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Informazioni di base
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium mb-2">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nome
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome" 
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium mb-2">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Cognome
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Cognome" 
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sezione: Credenziali */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Credenziali
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium mb-2">
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email <span className="text-red-500">*</span>
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="utente@example.com"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium mb-2">
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Password
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Nuova password (opzionale)"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500 mt-1">
                        Lascia vuoto per mantenere la password attuale
                      </FormDescription>
                      <FormMessage className="mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

          <div className="pt-6 border-t">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full md:w-auto min-w-[140px] bg-[#0b3d4d] hover:bg-[#0b3d4d]/90"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Salvataggio...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salva modifiche
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

