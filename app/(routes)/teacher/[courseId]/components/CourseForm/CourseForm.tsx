"use client";

import axios from "axios";
import { toast } from "sonner";
import { Cog } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"; // Comentado - no se usa por ahora
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { TitleBlock } from "../TitleBlock";
import { CourseFormProps } from "./CourseForm.types";
import { formSchema } from "./CourseForm.form";

export function CourseForm(props: CourseFormProps) {
  const { course } = props;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
      defaultValues: {
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        category: course.category || "webinar", // Por ahora solo webinar
        level: course.level || undefined, // Nivel opcional - Por ahora no usamos niveles
      },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Establecer categoría como "webinar" automáticamente
      const valuesWithCategory = {
        ...values,
        category: "webinar",
      };
      axios.patch(`/api/course/${course.id}`, valuesWithCategory);

      toast("Corso aggiornato correttamente 🎉");
    } catch {
      toast.error("Ops, qualcosa è andato storto 😭");
    }
  };

  return (
    <div className="p-6 bg-card rounded-md">
      <TitleBlock title="Configurazione del corso" icon={Cog} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo del corso</FormLabel>
                  <FormControl>
                    <Input placeholder="Corso di ReactJS" {...field} />
                  </FormControl>
                  <FormDescription>
                    Questo è ciò che l&apos;utente vedrà come titolo del corso.
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
                  <FormLabel>Url del corso</FormLabel>
                  <FormControl>
                    <Input placeholder="corso-react-js" {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    È unica e non può essere modificata
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoría - Por ahora solo webinar */}
            <FormField
              control={form.control}
              name="category"
              render={() => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input 
                      value="webinar" 
                      disabled 
                      className="bg-muted cursor-not-allowed"
                    />
                  </FormControl>
                  <FormDescription>
                    Por ahora todos los cursos son de tipo webinar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Nivel comentado - Por ahora no usamos niveles */}
            {/* <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Livello del corso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona il livello" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Principiante">Principiante</SelectItem>
                      <SelectItem value="Intermedio">Intermedio</SelectItem>
                      <SelectItem value="Avanzado">Avanzato</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Inserisci la descrizione del corso"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrizione completa del corso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Salva informazioni di base</Button>
        </form>
      </Form>
    </div>
  );
}
