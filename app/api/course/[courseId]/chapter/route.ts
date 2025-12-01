import prisma from "@/lib/prisma";
import { getAuth, isTeacher } from "@/lib/auth-mock";

import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await getAuth();
    const userIsTeacher = await isTeacher();
    const { courseId } = await params;

    // Solo TEACHER puede crear capítulos
    if (!userId || !userIsTeacher) {
      return new NextResponse("Unauthorized - Solo i professori possono creare capitoli", {
        status: 403,
      });
    }

    const { title } = await req.json();

    if (!title) {
      return new NextResponse("Il titolo del capitolo è obbligatorio", { status: 400 });
    }

    // Verificar que el curso existe (TEACHER puede crear capítulos en cualquier curso)
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const chapterCount = await prisma.chapter.count({
      where: { courseId: courseId },
    });

    const chapter = await prisma.chapter.create({
      data: {
        title,
        courseId: courseId,
        position: chapterCount + 1,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSE_CHAPTER]", error);

    return new NextResponse("Internal server error", { status: 500 });
  }
}
