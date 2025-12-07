import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";

// GET - Listar todos los cursos publicados (solo admin)
export async function GET() {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede ver cursos
    if (!userId || !userIsAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato - Solo gli amministratori possono visualizzare i corsi" },
        { status: 403 }
      );
    }

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return NextResponse.json(
      { error: "Errore durante il recupero dei corsi" },
      { status: 500 }
    );
  }
}

