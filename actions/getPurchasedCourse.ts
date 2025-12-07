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

    // Si es estudiante, necesita Purchase y el curso debe estar publicado
    const userIsStudent = await isStudent();
    if (userIsStudent) {
      return purchase ? (purchase.course.isPublished || false) : false;
    }

    // Para otros roles (ADMIN), verificar si tienen compra
    return !!purchase;
  } catch (error) {
    console.log("[GET IS PURCHASED COURSE]", error);
    return false;
  }
};
