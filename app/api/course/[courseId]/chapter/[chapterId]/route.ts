import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();
    const { courseId, chapterId } = await params;

    // Solo ADMIN puede ver capítulos
    if (!userId || !userIsAdmin) {
      return new NextResponse("Unauthorized - Solo gli amministratori possono visualizzare i moduli", {
        status: 403,
      });
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        documentUrl: true,
        imageUrl: true,
        resources: true,
        position: true,
        isPublished: true,
        isFree: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSE_CHAPTER_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

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
      return new NextResponse("Unauthorized - Solo gli amministratori possono modificare i moduli", {
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

    // Preparar los datos para Prisma (similar a cómo se hace en /api/course/[courseId])
    const updateData: Record<string, unknown> = { ...values };
    
    // Si resources está presente, asegurarse de que sea un array válido
    if (values.resources !== undefined) {
      // Prisma maneja arrays automáticamente como JSON
      updateData.resources = Array.isArray(values.resources) ? values.resources : [];
    }

    const chapter = await prisma.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        documentUrl: true,
        imageUrl: true,
        resources: true, // Incluir explícitamente resources
        position: true,
        isPublished: true,
        isFree: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
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
      return new NextResponse("Unauthorized - Solo gli amministratori possono eliminare i moduli", {
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
