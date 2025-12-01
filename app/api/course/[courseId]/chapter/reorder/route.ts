import prisma from "@/lib/prisma";
import { getAuth, isAdmin } from "@/lib/auth-mock";

import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await getAuth();
    const userIsAdmin = await isAdmin();
    const { courseId } = await params;

    // Solo ADMIN puede reordenar capítulos
    if (!userId || !userIsAdmin) {
      return new NextResponse("Unauthorized - Solo gli amministratori possono riordinare i capitoli", {
        status: 403,
      });
    }

    const { list } = await req.json();

    if (!list || !Array.isArray(list)) {
      return new NextResponse("Lista di capitoli non valida", { status: 400 });
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

    for (const item of list) {
      await prisma.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[COURSE_CHAPTER_REORDER]", error);

    return new NextResponse("Internal server error", { status: 500 });
  }
}
