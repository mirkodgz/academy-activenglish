"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { ChapterTitleFormProps } from "./ChapterTitleForm.types";
import { formSchema } from "./ChapterTitleForm.form";
import { EditorDescription } from "@/components/Shared";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ChapterTitleForm(props: ChapterTitleFormProps) {
  const { courseId, chapter } = props;

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: chapter.title || "",
      description: chapter.description || "",
      isFree: chapter.isFree || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/course/${courseId}/chapter/${chapter.id}`, {
        title: values.title,
        description: values.description,
        isFree: values.isFree,
      });

      toast("Capitolo modificato 🔥");

      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Qualcosa è andato storto.");
    }
  };

  return (
    <div className="p-6 rounded-md bg-white mt-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome del capitolo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Introduzione alla programmazione"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione del capitolo</FormLabel>
                <FormControl>
                  <EditorDescription {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Capitolo pubblico</FormLabel>
                  <FormDescription>
                    Se vuoi che questo capitolo sia visibile per tutti gli
                    utenti.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div />

          <Button type="submit" className="mt-4">
            Salva
          </Button>
        </form>
      </Form>
    </div>
  );
}
