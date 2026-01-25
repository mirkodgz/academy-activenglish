import prisma from "@/lib/prisma";
import { getCurrentUser, isStudent } from "@/lib/auth";
import { Chapter, Course } from "@prisma/client";

export const getPurchasedCourses = async (): Promise<
  (Course & { chapters: Chapter[] })[] | null
> => {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    const userIsStudent = await isStudent();

    // Si es estudiante, mostrar SOLO los cursos que ha comprado (Purchase)
    // Nota: No filtramos por isPublished porque si un admin asignó un curso,
    // el estudiante debe poder verlo aunque no esté publicado públicamente
    if (userIsStudent) {
      const purchasedCourses = await prisma.course.findMany({
        where: {
          purchases: {
            some: {
              userId: user.id,
            },
          },
          // Removido isPublished: true para que los cursos asignados por admin sean visibles
        },
        include: {
          chapters: {
            where: {
              isPublished: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return purchasedCourses;
    }

    // Para otros roles (ADMIN), mostrar solo los cursos comprados
    // Nota: No filtramos por isPublished para consistencia
    const purchasedCourses = await prisma.course.findMany({
      where: {
        purchases: {
          some: {
            userId: user.id,
          },
        },
        // Removido isPublished: true para que los cursos asignados sean visibles
      },
      include: {
        chapters: {
          where: {
            isPublished: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return purchasedCourses;
  } catch (error) {
    console.log("[GET_PURCHASED_COURSES]", error);

    return [];
  }
};
