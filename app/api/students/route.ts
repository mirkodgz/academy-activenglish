import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";

// GET - Obtener estudiantes que compraron un curso específico
export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede ver estudiantes
    if (!userId || !userIsAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato - Solo gli amministratori possono visualizzare gli studenti" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId è obbligatorio" },
        { status: 400 }
      );
    }

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Corso non trovato" },
        { status: 404 }
      );
    }

    // Obtener todas las compras de este curso
    const purchases = await prisma.purchase.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true, // Agregar role para debugging
            password: true, // Para saber si ya tiene contraseña
          },
        },
      },
    });

    console.log(`[GET_STUDENTS] Purchases encontradas para curso ${courseId}:`, purchases.length);
    console.log(`[GET_STUDENTS] Purchases:`, purchases.map(p => ({
      userId: p.userId,
      email: p.user.email,
      role: p.user.role,
    })));

    // Filtrar solo estudiantes (no admins)
    const students = purchases
      .filter((purchase) => purchase.user.role === "STUDENT")
      .map((purchase) => ({
        id: purchase.user.id,
        email: purchase.user.email,
        firstName: purchase.user.firstName,
        lastName: purchase.user.lastName,
        hasPassword: !!purchase.user.password,
        purchasedAt: purchase.createdAt,
      }));

    console.log(`[GET_STUDENTS] Estudiantes filtrados:`, students.length);

    return NextResponse.json({
      courseId: course.id,
      courseTitle: course.title,
      studentCount: students.length,
      students,
    });
  } catch (error) {
    console.error("[GET_STUDENTS]", error);
    return NextResponse.json(
      { error: "Errore durante il recupero degli studenti" },
      { status: 500 }
    );
  }
}

