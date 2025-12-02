import {
  Award,
  BookOpen,
  ChartArea,
  GraduationCap,
  House,
  User,
  Users,
} from "lucide-react";

// Rutas públicas (disponibles para todos)
export const routes = [
  {
    title: "Home",
    url: "/",
    icon: House,
  },
  // Comentado porque "I miei corsi" muestra lo mismo para estudiantes
  // {
  //   title: "Corsi",
  //   url: "/courses",
  //   icon: SquareTerminal,
  // },
  {
    title: "Profilo",
    url: "/profile",
    icon: User,
  },
];

// Rutas para estudiantes
export const routesStudent = [
  {
    title: "I miei corsi",
    url: "/my-courses",
    icon: BookOpen,
  },
  // Comentado - no se usa por ahora ya que el sistema es libre
  // {
  //   title: "Ordini",
  //   url: "/orders",
  //   icon: ReceiptText,
  // },
  {
    title: "Certificati",
    url: "/certificates",
    icon: Award,
  },
];

// Rutas para administradores
export const routesTeacher = [
  {
    title: "I miei corsi",
    url: "/teacher",
    icon: GraduationCap,
  },
  {
    title: "Analitiche",
    url: "/teacher/analytics",
    icon: ChartArea,
  },
  {
    title: "Gestione Utenti",
    url: "/teacher/users",
    icon: Users,
  },
  {
    title: "Certificati",
    url: "/certificates",
    icon: Award,
  },
];
