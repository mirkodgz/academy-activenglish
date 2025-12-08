"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Send, Loader2, Users, BookOpen } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { TitleBlock } from "../../[courseId]/components";

const formSchema = z.object({
  courseId: z.string().min(1, "Seleziona un corso"),
  subject: z.string().min(1, "L'oggetto è obbligatorio"),
  body: z.string().min(1, "Il corpo del messaggio è obbligatorio"),
  urlBase: z.string().url("URL non valida").min(1, "L'URL base è obbligatoria"),
});

type FormValues = z.infer<typeof formSchema>;

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface StudentInfo {
  courseId: string;
  courseTitle: string;
  studentCount: number;
  students: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  }>;
}

export function SendEmailForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const router = useRouter();

  // URL base automática - priorizar variable de entorno (ngrok) o usar origin actual
  const getBaseUrl = () => {
    // Prioridad 1: Variable de entorno (útil para ngrok o producción)
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return `${process.env.NEXT_PUBLIC_APP_URL}/set-password`;
    }
    // Prioridad 2: Origin del navegador (desarrollo local sin ngrok)
    if (typeof window !== "undefined") {
      return `${window.location.origin}/set-password`;
    }
    // Fallback para SSR
    return "";
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      subject: "",
      body: "",
      urlBase: getBaseUrl(),
    },
  });

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

  // Cargar estudiantes cuando se selecciona un curso
  const selectedCourseId = form.watch("courseId");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourseId) {
        setStudentInfo(null);
        return;
      }

      try {
        setIsLoadingStudents(true);
        const response = await axios.get(`/api/students?courseId=${selectedCourseId}`);
        setStudentInfo(response.data);
      } catch {
        toast.error("Errore durante il caricamento degli studenti");
        setStudentInfo(null);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedCourseId]);

  const onSubmit = async (values: FormValues) => {
    if (!studentInfo || studentInfo.studentCount === 0) {
      toast.error("Nessuno studente trovato per questo corso");
      return;
    }

    // Confirmar antes de enviar
    const confirmed = window.confirm(
      `Sei sicuro di voler inviare ${studentInfo.studentCount} email agli studenti del corso "${studentInfo.courseTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/emails/send-password-links", values);

      if (response.status === 200) {
        const { sent, failed, errors } = response.data;
        
        if (sent > 0) {
          toast.success(`${sent} email inviate con successo!`);
        }
        
        if (failed > 0) {
          toast.warning(`${failed} email non inviate. Controlla i log per i dettagli.`);
          if (errors && errors.length > 0) {
            console.error("Errori di invio:", errors);
          }
        }

        // Resetear formulario
        form.reset({
          courseId: "",
          subject: "",
          body: "",
          urlBase: getBaseUrl(),
        });
        setStudentInfo(null);
        router.refresh();
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast.error(errorMessage || "Errore durante l'invio delle email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-md bg-card">
      <TitleBlock title="Invia Email di Benvenuto" icon={Mail} />
      <p className="text-sm text-muted-foreground mb-6">
        Invia email con link per creare/cambiare password agli studenti che hanno acquistato un corso specifico
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Selector de curso */}
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Seleziona Corso *
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
                {studentInfo && (
                  <FormDescription className="flex items-center gap-2 text-blue-600">
                    <Users className="w-4 h-4" />
                    {studentInfo.studentCount} {studentInfo.studentCount === 1 ? "studente" : "studenti"} che hanno acquistato questo corso
                  </FormDescription>
                )}
                {isLoadingStudents && (
                  <FormDescription className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Caricamento studenti...
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Información de estudiantes */}
          {studentInfo && studentInfo.studentCount === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
              Nessuno studente ha acquistato questo corso. Seleziona un altro corso.
            </div>
          )}

          {/* Asunto */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asunto del Correo *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Es: Benvenuto a JUMP START 1"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cuerpo del mensaje */}
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Corpo del Messaggio *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Hola {firstName},\n\nGracias por comprar el curso {courseTitle}.\n\nPara acceder a la plataforma, haz clic aquí: {link}\n\nSaludos,\nEl equipo de Active English`}
                    {...field}
                    disabled={isLoading}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </FormControl>
                <FormDescription>
                  Placeholders disponibles: {"{firstName}"}, {"{lastName}"}, {"{email}"}, {"{courseTitle}"}, {"{link}"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* URL base - Visible pero no editable */}
          <FormField
            control={form.control}
            name="urlBase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Base del Enlace *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={getBaseUrl()}
                    disabled={true}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </FormControl>
                <FormDescription>
                  El token se agregará automáticamente a esta URL. Ejemplo: {getBaseUrl()}?token=ABC123
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botón de envío */}
          <div className="pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading || !studentInfo || studentInfo.studentCount === 0}
              className="w-full md:w-auto min-w-[200px] bg-[#0b3d4d] hover:bg-[#0b3d4d]/90"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Invio in corso...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Invia Email {studentInfo ? `(${studentInfo.studentCount})` : ""}
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

