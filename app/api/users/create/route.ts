import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede crear usuarios
    if (!userId || !userIsAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato - Solo gli amministratori possono creare utenti" },
        { status: 403 }
      );
    }

    const { email, password, firstName, lastName, role } = await req.json();

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatori" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La password deve essere di almeno 6 caratteri" },
        { status: 400 }
      );
    }

    // Validar que el rol sea válido
    if (role && role !== "ADMIN" && role !== "STUDENT") {
      return NextResponse.json(
        { error: "Il ruolo deve essere ADMIN o STUDENT" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utente con questo email esiste già" },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario con el rol especificado (o STUDENT por defecto)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: (role as UserRole) || "STUDENT",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Utente creato con successo", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CREATE_USER]", error);
    return NextResponse.json(
      { error: "Errore durante la creazione dell'utente" },
      { status: 500 }
    );
  }
}

