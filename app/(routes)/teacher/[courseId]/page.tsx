import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";

import prisma from "@/lib/prisma";

import {
  ChaptersBlock,
  CourseForm,
  CourseImage,
  // CoursePrice, // Comentado - no se usa por ahora
  HeaderCourse,
} from "./components";

export const dynamic = 'force-dynamic';

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  const userIsAdmin = await isAdmin();

  // Verificar que el usuario es ADMIN
  if (!user || !userIsAdmin) {
    redirect("/");
  }

  // ADMIN puede editar cualquier curso (no solo los suyos)
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!course) {
    return <p>Questo corso non esiste</p>;
  }

  return (
    <div className="m-6">
      <HeaderCourse idCourse={course.id} isPublished={course.isPublished} />

      <CourseForm course={course} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <CourseImage idCourse={course.id} imageCourse={course.imageUrl} />

        {/* Precio comentado - Por ahora no mostramos precios */}
        {/* <CoursePrice idCourse={course.id} priceCourse={course.price} /> */}
      </div>

      <ChaptersBlock idCourse={course.id} chapters={course.chapters} />
    </div>
  );
}
