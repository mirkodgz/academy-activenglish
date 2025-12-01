import prisma from "@/lib/prisma";
import { isStudent } from "@/lib/auth";

export const getPurchaseCourseById = async (
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
