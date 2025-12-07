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
      // El estudiante tiene acceso solo si tiene Purchase y el curso está publicado
      return purchase ? (purchase.course.isPublished || false) : false;
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
