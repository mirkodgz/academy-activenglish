import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";

// GET - Listar todos los usuarios (solo admin)
export async function GET() {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede ver usuarios
    if (!userId || !userIsAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato - Solo gli amministratori possono visualizzare gli utenti" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET_USERS]", error);
    return NextResponse.json(
      { error: "Errore durante il recupero degli utenti" },
      { status: 500 }
    );
  }
}

