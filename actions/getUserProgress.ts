import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const getUserProgress = async () => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return [];
    }

    const progress = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
      },
    });

    return progress;
  } catch (error) {
    console.log("[GET_USER_PROGRESS]", error);

    return [];
  }
};
