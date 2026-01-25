import prisma from "@/lib/prisma";
import { isStudent } from "@/lib/auth";

export const getPurchaseCourseById = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    // Si el usuario es estudiante, verificar que tenga Purchase del curso
    const userIsStudent = await isStudent();
    if (userIsStudent) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        include: {
          course: true,
        },
      });
      // El estudiante tiene acceso si tiene Purchase (no verificamos isPublished porque
      // si un admin asignó el curso, el estudiante debe poder acceder aunque no esté publicado)
      return !!purchase; // Solo verificamos que tenga Purchase, no si está publicado
    }

    // Para otros roles, verificar si tienen compra
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: true,
      },
    });

    return !!purchase;
  } catch (error) {
    console.log("[GET_PURCHASE_COURSE_BY_ID]", error);
    return false;
  }
};
