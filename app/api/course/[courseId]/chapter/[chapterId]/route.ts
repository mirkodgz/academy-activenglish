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

    console.log("[COURSE_CHAPTER_UPDATE] Updating chapter with values:", JSON.stringify(values, null, 2));
    console.log("[COURSE_CHAPTER_UPDATE] Resources in values:", values.resources);
    console.log("[COURSE_CHAPTER_UPDATE] Resources type:", typeof values.resources);
    console.log("[COURSE_CHAPTER_UPDATE] Resources isArray:", Array.isArray(values.resources));

    // Preparar los datos para Prisma
    // Asegurarse de que resources se envíe como JSON válido
    const updateData: Record<string, unknown> = { ...values };
    if (values.resources !== undefined) {
      // Si resources es un array, Prisma lo manejará automáticamente como JSON
      // Pero asegurémonos de que esté en el formato correcto
      updateData.resources = values.resources;
      console.log("[COURSE_CHAPTER_UPDATE] Setting resources in updateData:", updateData.resources);
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

    console.log("[COURSE_CHAPTER_UPDATE] Chapter updated successfully:", JSON.stringify(chapter, null, 2));
    console.log("[COURSE_CHAPTER_UPDATE] Resources after update:", chapter.resources);
    console.log("[COURSE_CHAPTER_UPDATE] Resources type after update:", typeof chapter.resources);
    console.log("[COURSE_CHAPTER_UPDATE] Resources isArray after update:", Array.isArray(chapter.resources));

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
