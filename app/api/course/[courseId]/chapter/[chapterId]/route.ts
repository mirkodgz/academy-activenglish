import prisma from "@/lib/prisma";
import { getAuth, isTeacher } from "@/lib/auth-mock";

import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { userId } = await getAuth();
    const userIsTeacher = await isTeacher();
    const { courseId, chapterId } = await params;
    const values = await req.json();

    // Solo TEACHER puede editar capítulos
    if (!userId || !userIsTeacher) {
      return new NextResponse("Unauthorized - Solo i professori possono modificare i capitoli", {
        status: 403,
      });
    }

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const chapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSE_CHAPTER_UPDATE]", error);

    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { userId } = await getAuth();
    const userIsTeacher = await isTeacher();
    const { courseId, chapterId } = await params;

    // Solo TEACHER puede eliminar capítulos
    if (!userId || !userIsTeacher) {
      return new NextResponse("Unauthorized - Solo i professori possono eliminare i capitoli", {
        status: 403,
      });
    }

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const chapter = await prisma.chapter.delete({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSE_CHAPTER_DELETE]", error);

    return new NextResponse("Internal server error", { status: 500 });
  }
}
