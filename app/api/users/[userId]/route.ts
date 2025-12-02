import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// PATCH - Editar usuario (solo admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede editar usuarios
    if (!userId || !userIsAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato - Solo gli amministratori possono modificare gli utenti" },
        { status: 403 }
      );
    }

    const { userId: targetUserId } = await params;
    const { email, password, firstName, lastName, role } = await req.json();

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
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
      role?: UserRole;
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

    // Validar y actualizar rol
    if (role) {
      if (role !== "ADMIN" && role !== "STUDENT") {
        return NextResponse.json(
          { error: "Il ruolo deve essere ADMIN o STUDENT" },
          { status: 400 }
        );
      }
      updateData.role = role as UserRole;
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
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
      message: "Utente aggiornato con successo",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[UPDATE_USER]", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento dell'utente" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario (solo admin)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede eliminar usuarios
    if (!userId || !userIsAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato - Solo gli amministratori possono eliminare gli utenti" },
        { status: 403 }
      );
    }

    const { userId: targetUserId } = await params;

    // No permitir que un admin se elimine a sí mismo
    if (targetUserId === userId) {
      return NextResponse.json(
        { error: "Non puoi eliminare il tuo stesso account" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Eliminar el usuario (las relaciones se eliminan en cascada según el schema)
    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({
      message: "Utente eliminato con successo",
    });
  } catch (error) {
    console.error("[DELETE_USER]", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione dell'utente" },
      { status: 500 }
    );
  }
}

