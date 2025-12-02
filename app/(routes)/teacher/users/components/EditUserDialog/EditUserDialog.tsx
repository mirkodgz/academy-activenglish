"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  email: z.string().email("Email non valido"),
  password: z
    .string()
    .min(6, "La password deve essere di almeno 6 caratteri")
    .optional()
    .or(z.literal("")),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ADMIN", "STUDENT"], {
    required_error: "Seleziona un ruolo",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: "ADMIN" | "STUDENT";
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email,
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
    },
  });

  // Resetear el formulario cuando cambia el usuario
  useEffect(() => {
    if (open && user) {
      form.reset({
        email: user.email,
        password: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role,
      });
    }
  }, [open, user, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      // Si la contraseña está vacía, no la enviamos
      const updateData = { ...values };
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }

      const response = await axios.patch(`/api/users/${user.id}`, updateData);

      if (response.status === 200) {
        toast.success("Utente aggiornato con successo 🎉");
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || "Errore durante l'aggiornamento dell'utente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold text-[#0b3d4d]">
            Modifica utente
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Modifica i dati dell&apos;utente. Lascia la password vuota per non modificarla.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Sezione: Informazioni di base */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Informazioni di base
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium mb-2">Nome</FormLabel>
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
                      <FormLabel className="text-sm font-medium mb-2">Cognome</FormLabel>
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

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium mb-2">
                        Ruolo <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seleziona un ruolo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STUDENT">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              Studente
                            </div>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Amministratore
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-gray-500 mt-1">
                        Gli amministratori possono gestire corsi e utenti
                      </FormDescription>
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
                        Email <span className="text-red-500">*</span>
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
                      <FormLabel className="text-sm font-medium mb-2">Password</FormLabel>
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

            <DialogFooter className="pt-6 border-t gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="min-w-[100px]"
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[140px] bg-[#0b3d4d] hover:bg-[#0b3d4d]/90"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Salvataggio...
                  </span>
                ) : (
                  "Salva modifiche"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

