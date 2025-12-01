import prisma from "@/lib/prisma";
import { getAuth, isTeacher } from "@/lib/auth-mock";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await getAuth();
    const userIsTeacher = await isTeacher();

    // Solo TEACHER puede crear cursos
    if (!userId || !userIsTeacher) {
      return new NextResponse("Unauthorized - Solo i professori possono creare corsi", {
        status: 403,
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
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE]", error);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
