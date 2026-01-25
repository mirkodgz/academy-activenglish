import prisma from "@/lib/prisma";
import { isStudent } from "@/lib/auth";

export const getIsPurchasedCourse = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    // Verificar si el usuario tiene Purchase del curso
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId,
        courseId,
      },
      include: {
        course: true,
      },
    });

    // Si es estudiante, necesita Purchase (no verificamos isPublished porque
    // si un admin asignó el curso, el estudiante debe poder acceder aunque no esté publicado)
    const userIsStudent = await isStudent();
    if (userIsStudent) {
      return !!purchase; // Solo verificamos que tenga Purchase, no si está publicado
    }

    // Para otros roles (ADMIN), verificar si tienen compra
    return !!purchase;
  } catch (error) {
    console.log("[GET IS PURCHASED COURSE]", error);
    return false;
  }
};
