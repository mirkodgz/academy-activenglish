"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserPlus, BookOpen } from "lucide-react";

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
import { TitleBlock } from "../../../[courseId]/components";

const formSchema = z.object({
  email: z.string().email("Email non valido"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ADMIN", "STUDENT"], {
    required_error: "Seleziona un ruolo",
  }),
  courseId: z.string().optional(),
}).refine((data) => {
  // Si es estudiante, el curso es obligatorio
  if (data.role === "STUDENT" && !data.courseId) {
    return false;
  }
  return true;
}, {
  message: "Il corso è obbligatorio per gli studenti",
  path: ["courseId"],
});

type FormValues = z.infer<typeof formSchema>;

interface Course {
  id: string;
  title: string;
  slug: string;
}

export function CreateUserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "STUDENT",
      courseId: "",
    },
  });

  const selectedRole = form.watch("role");

  // Cargar cursos al montar el componente
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await axios.get("/api/courses");
        setCourses(response.data.courses || []);
      } catch {
        toast.error("Errore durante il caricamento dei corsi");
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      console.log("[CREATE_USER_FORM] Enviando datos:", {
        email: values.email,
        role: values.role,
        courseId: values.courseId,
        hasCourseId: !!values.courseId,
      });

      const response = await axios.post("/api/users/create", values);

      if (response.status === 201) {
        toast.success("Utente creato con successo");
        form.reset({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          role: "STUDENT",
          courseId: "",
        });
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("[CREATE_USER_FORM] Error:", error);
      
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string; details?: string } } }).response?.data?.error
        : undefined;
      
      const errorDetails = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { details?: string } } }).response?.data?.details
        : undefined;
      
      console.error("[CREATE_USER_FORM] Error message:", errorMessage);
      console.error("[CREATE_USER_FORM] Error details:", errorDetails);
      
      toast.error(errorMessage || "Errore durante la creazione dell'utente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-md bg-card">
      <TitleBlock title="Crea nuovo utente" icon={UserPlus} />
      <p className="text-sm text-muted-foreground mb-6">
        Crea un nuovo utente con ruolo Admin o Studente
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="utente@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimo 6 caratteri"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    La password deve essere di almeno 6 caratteri
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cognome</FormLabel>
                  <FormControl>
                    <Input placeholder="Cognome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ruolo *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Si cambia a ADMIN, limpiar el curso seleccionado
                      if (value === "ADMIN") {
                        form.setValue("courseId", "");
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un ruolo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STUDENT">Studente</SelectItem>
                      <SelectItem value="ADMIN">Amministratore</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleziona il ruolo dell&apos;utente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de curso - Solo visible para estudiantes */}
            {selectedRole === "STUDENT" && (
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Corso Assegnato *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingCourses}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingCourses ? "Caricamento corsi..." : "Seleziona un corso"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Il corso a cui avrà accesso questo studente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creazione..." : "Crea utente"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

