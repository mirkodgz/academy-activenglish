import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getUserId();
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId,
        },
      },
    });

    if (existingPurchase) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    await prisma.purchase.create({
      data: {
        userId: userId,
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
