import {
  Award,
  BookOpen,
  ChartArea,
  GraduationCap,
  House,
  ReceiptText,
  SquareTerminal,
} from "lucide-react";

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
  // {
  //   title: "I miei corsi",
  //   url: "/my-courses",
  //   icon: BookOpen,
  // },
  // {
  //   title: "Ordini",
  //   url: "/orders",
  //   icon: ReceiptText,
  // },
  // {
  //   title: "Certificati",
  //   url: "/certificates",
  //   icon: Award,
  // },
];

export const routesTeacher = [
  {
    title: "Corsi",
    url: "/teacher",
    icon: GraduationCap,
  },
  {
    title: "Analitiche",
    url: "/teacher/analytics",
    icon: ChartArea,
  },
];
