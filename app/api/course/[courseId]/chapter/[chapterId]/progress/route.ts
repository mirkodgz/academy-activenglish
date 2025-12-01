import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth-mock";

import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { userId } = await getAuth(); // Mock para desarrollo
  const { courseId, chapterId } = await params;
  const { isCompleted } = await req.json();

  try {
    // Validación removida para desarrollo frontend
    // TODO: Restaurar validación cuando se implemente autenticación real

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        courseId: true,
      },
    });

    if (!chapter || chapter.courseId !== courseId) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: userId || "mock-user-id-123",
          chapterId: chapterId,
        },
      },
      update: {
        isCompleted: isCompleted,
      },
      create: {
        userId: userId || "mock-user-id-123",
        chapterId: chapterId,
        isCompleted: isCompleted,
      },
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[COURSE_PROGRESS_UPDATE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
