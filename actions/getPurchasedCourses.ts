import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-mock";
import { Chapter, Course } from "@prisma/client";

export const getPurchasedCourses = async (): Promise<
  (Course & { chapters: Chapter[] })[] | null
> => {
  const user = await getCurrentUser(); // Mock para desarrollo

  // Validación removida para desarrollo frontend
  // TODO: Restaurar validación cuando se implemente autenticación real

  try {
    const purchasedCourses = await prisma.course.findMany({
      where: {
        purchases: {
          some: {
            userId: user?.id || "mock-user-id-123",
          },
        },
        isPublished: true,
      },
      include: {
        chapters: {
          where: {
            isPublished: true,
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
