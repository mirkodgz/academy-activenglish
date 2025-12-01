import prisma from "@/lib/prisma";
import { isStudent } from "@/lib/auth";

export const getIsPurchasedCourse = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    // Si el usuario es estudiante, permitir acceso a todos los cursos publicados
    const userIsStudent = await isStudent();
    if (userIsStudent) {
      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });
      // Si el curso está publicado, el estudiante tiene acceso
      return course?.isPublished || false;
    }

    // Para otros roles, verificar si tienen compra
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    return !!purchase;
  } catch (error) {
    console.log("[GET IS PURCHASED COURSE]", error);
    return false;
  }
};
