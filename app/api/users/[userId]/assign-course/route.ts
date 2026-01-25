import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";

// POST - Asignar un curso a un usuario existente (crear Purchase)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede asignar cursos
    if (!userId || !userIsAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato - Solo gli amministratori possono assegnare corsi" },
        { status: 403 }
      );
    }

    const { userId: targetUserId } = await params;
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Il corso è obbligatorio" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Corso non trovato" },
        { status: 404 }
      );
    }

    // Verificar si ya existe un Purchase para este usuario y curso
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId: courseId,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { 
          error: "L'utente ha già accesso a questo corso",
          purchase: existingPurchase,
        },
        { status: 400 }
      );
    }

    // Calcular el precio del curso
    const coursePrice = course.price 
      ? parseFloat(course.price.replace(",", ".")) 
      : 0;

    // Crear el Purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: targetUserId,
        courseId: courseId,
        price: coursePrice,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Corso assegnato con successo",
      purchase: {
        id: purchase.id,
        course: purchase.course,
        user: purchase.user,
        price: purchase.price,
        createdAt: purchase.createdAt,
      },
    });
  } catch (error) {
    console.error("[ASSIGN_COURSE]", error);
    
    // Si es un error de constraint único, el Purchase ya existe
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: "L'utente ha già accesso a questo corso" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Errore durante l'assegnazione del corso" },
      { status: 500 }
    );
  }
}
