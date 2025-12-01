import {
  Award,
  BookOpen,
  ChartArea,
  GraduationCap,
  House,
  ReceiptText,
  SquareTerminal,
  User,
} from "lucide-react";

// Rutas públicas (disponibles para todos)
export const routes = [
  {
    title: "Home",
    url: "/",
    icon: House,
  },
  {
    title: "Corsi",
    url: "/courses",
    icon: SquareTerminal,
  },
];

// Rutas para estudiantes
export const routesStudent = [
  {
    title: "I miei corsi",
    url: "/my-courses",
    icon: BookOpen,
  },
  {
    title: "Ordini",
    url: "/orders",
    icon: ReceiptText,
  },
  {
    title: "Certificati",
    url: "/certificates",
    icon: Award,
  },
  {
    title: "Profilo",
    url: "/profile",
    icon: User,
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
    title: "Ordini",
    url: "/orders",
    icon: ReceiptText,
  },
  {
    title: "Certificati",
    url: "/certificates",
    icon: Award,
  },
  {
    title: "Profilo",
    url: "/profile",
    icon: User,
  },
];
