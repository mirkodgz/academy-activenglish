import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";

import prisma from "@/lib/prisma";

import { Header } from "./components";
import { ListCourses } from "./components/ListCourses";

export const dynamic = 'force-dynamic';

export default async function TeacherPage() {
  const user = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  // Verificar que el usuario es ADMIN
  if (!user || !userIsAdmin) {
    redirect("/");
  }

  // ADMIN puede ver TODOS los cursos (no solo los suyos)
  // Nota: El include de 'user' se agregará después de ejecutar la migración de Prisma
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    // TODO: Descomentar después de ejecutar: npx prisma migrate dev
    // include: {
    //   user: {
    //     select: {
    //       firstName: true,
    //       lastName: true,
    //       email: true,
    //     },
    //   },
    // },
  });

  return (
    <div>
      <Header />

      <ListCourses courses={courses} />
    </div>
  );
}
