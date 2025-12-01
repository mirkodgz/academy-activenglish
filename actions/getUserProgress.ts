import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-mock";

export const getUserProgress = async () => {
  try {
    const user = await getCurrentUser(); // Mock para desarrollo

    // Validación removida para desarrollo frontend
    // TODO: Restaurar validación cuando se implemente autenticación real

    const progress = await prisma.userProgress.findMany({
      where: {
        userId: user?.id || "mock-user-id-123",
      },
    });

    return progress;
  } catch (error) {
    console.log("[GET_USER_PROGRESS]", error);

    return [];
  }
};
