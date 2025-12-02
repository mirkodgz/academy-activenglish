import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

// PATCH - Actualizar perfil del usuario autenticado
export async function PATCH(req: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { email, password, firstName, lastName } = await req.json();

    // Obtener el usuario actual
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: {
      email?: string;
      password?: string;
      firstName?: string | null;
      lastName?: string | null;
    } = {};

    // Si se proporciona email, verificar que no esté en uso por otro usuario
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Un utente con questo email esiste già" },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // Si se proporciona password, hashearla
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "La password deve essere di almeno 6 caratteri" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar otros campos
    if (firstName !== undefined) {
      updateData.firstName = firstName || null;
    }

    if (lastName !== undefined) {
      updateData.lastName = lastName || null;
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Profilo aggiornato con successo",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[UPDATE_PROFILE]", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del profilo" },
      { status: 500 }
    );
  }
}

