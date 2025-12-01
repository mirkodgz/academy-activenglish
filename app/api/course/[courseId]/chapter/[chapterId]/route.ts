import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();
    const { courseId, chapterId } = await params;
    const values = await req.json();

    // Solo ADMIN puede editar capítulos
    if (!userId || !userIsAdmin) {
      return new NextResponse("Unauthorized - Solo gli amministratori possono modificare i capitoli", {
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
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();
    const { courseId, chapterId } = await params;

    // Solo ADMIN puede eliminar capítulos
    if (!userId || !userIsAdmin) {
      return new NextResponse("Unauthorized - Solo gli amministratori possono eliminare i capitoli", {
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
