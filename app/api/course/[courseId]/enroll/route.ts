import prisma from "@/lib/prisma";
import { getAuth } from "@/lib/auth-mock";

import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { userId } = await getAuth(); // Mock para desarrollo
  const { courseId } = await params;

  // Validación removida para desarrollo frontend
  // TODO: Restaurar validación cuando se implemente autenticación real

  try {
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingPurchase) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    await prisma.purchase.create({
      data: {
        userId: userId || "mock-user-id-123",
        courseId,
        price: 0,
      },
    });

    return new NextResponse("Erolled", { status: 200 });
  } catch (error) {
    console.error("[COURSE_ENROLL]", error);

    return new NextResponse("Internal server error", { status: 500 });
  }
}
