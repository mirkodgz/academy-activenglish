import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();
    const { courseId } = await params;
    const values = await req.json();

    // Solo ADMIN puede editar cursos
    if (!userId || !userIsAdmin) {
      return new NextResponse("Unauthorized - Solo gli amministratori possono modificare i corsi", {
        status: 403,
      });
    }

    // TEACHER puede editar cualquier curso (no solo los suyos)
    const course = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE]", error);

    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede eliminar cursos
    if (!userId || !userIsAdmin) {
      return new NextResponse("Unauthorized - Solo gli amministratori possono eliminare i corsi", {
        status: 403,
      });
    }

    const { courseId } = await params;

    // TEACHER puede eliminar cualquier curso (no solo los suyos)
    const course = await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE]", error);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
