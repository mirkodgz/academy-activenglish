import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede crear cursos
    if (!userId || !userIsAdmin) {
      return new NextResponse("Unauthorized - Solo gli amministratori possono creare corsi", {
        status: 403,
      });
    }

    // Verificar que el usuario existe en la BD
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("Usuario no encontrado", {
        status: 404,
      });
    }

    const { courseName, slug } = await req.json();

    if (!courseName || !slug) {
      return new NextResponse("Nome del corso e slug sono obbligatori", { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        userId: userId,
        title: courseName,
        slug,
        category: "webinar", // Por ahora todos los cursos son webinar
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE]", error);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
