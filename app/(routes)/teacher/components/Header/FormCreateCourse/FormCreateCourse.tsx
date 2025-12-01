"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { formSchema } from "./FormCreateCourse.form";

export function FormCreateCourse() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
      slug: "",
    },
  });

  // Auto-generar slug desde el nombre del curso
  const courseName = form.watch("courseName");
  
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^a-z0-9]+/g, "-") // Reemplazar espacios y caracteres especiales con guiones
      .replace(/^-+|-+$/g, ""); // Remover guiones al inicio y final
  };

  // Actualizar slug automáticamente cuando cambia el nombre
  const handleCourseNameChange = (value: string) => {
    form.setValue("courseName", value);
    if (value && !form.getValues("slug")) {
      form.setValue("slug", generateSlug(value));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/course", {
        courseName: values.courseName,
        slug: values.slug || generateSlug(values.courseName),
      });
      
      toast.success("Corso creato correttamente 🎉");
      form.reset();
      
      // Pequeño delay para que se vea el toast
      setTimeout(() => {
        router.push(`/teacher/${res.data.id}`);
      }, 500);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data || "Si è verificato un errore";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <FormField
          control={form.control}
          name="courseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#0b3d4d] font-semibold">
                Nome del corso
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Es: Corso completo di ReactJS"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleCourseNameChange(e.target.value);
                  }}
                  className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10"
                />
              </FormControl>
              <FormDescription className="text-gray-500">
                Il nome completo del corso che vedranno gli studenti
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#0b3d4d] font-semibold">
                URL del corso (Slug)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="corso-completo-reactjs"
                  {...field}
                  className="border-[#0b3d4d]/20 focus:border-[#0b3d4d] focus:ring-[#0b3d4d]/10 font-mono text-sm"
                />
              </FormControl>
              <FormDescription className="text-gray-500">
                L'URL univoco del corso (si genera automaticamente dal nome).
                Usa solo lettere minuscole, numeri e trattini.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#0b3d4d] hover:bg-[#0a3542] text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Crea corso
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
