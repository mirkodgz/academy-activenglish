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

    const { email, password, firstName, lastName, role, courseId } = await req.json();
    
    // Debug logging
    console.log(`[CREATE_USER] Datos recibidos:`, {
      email,
      role,
      courseId,
      courseIdType: typeof courseId,
      courseIdLength: courseId?.length,
      hasPassword: !!password,
    });

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

    // Si es estudiante, validar que se haya proporcionado un curso
    // courseId puede ser string vacío "", así que verificamos también eso
    const finalRole = (role as UserRole) || "STUDENT";
    const validCourseId = courseId && courseId.trim() !== "";
    
    if (finalRole === "STUDENT" && !validCourseId) {
      return NextResponse.json(
        { error: "Il corso è obbligatorio per gli studenti" },
        { status: 400 }
      );
    }

    // Si se proporciona un curso, verificar que existe
    if (validCourseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Corso non trovato" },
          { status: 404 }
        );
      }
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
        role: finalRole,
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

    // Si es estudiante y se proporcionó un curso, crear la compra (Purchase)
    if (finalRole === "STUDENT" && validCourseId) {
      console.log(`[CREATE_USER] Creando Purchase para estudiante ${user.id} con curso ${validCourseId}`);
      
      // Obtener el precio del curso (o 0 si no tiene precio)
      const course = await prisma.course.findUnique({
        where: { id: validCourseId },
        select: { price: true },
      });

      if (!course) {
        console.error(`[CREATE_USER] Error: Curso ${validCourseId} no encontrado al crear Purchase`);
        return NextResponse.json(
          { error: `Corso ${validCourseId} non trovato` },
          { status: 404 }
        );
      }

      const coursePrice = course?.price 
        ? parseFloat(course.price.replace(",", ".")) 
        : 0;

      try {
        // Crear la compra
        const purchase = await prisma.purchase.create({
          data: {
            userId: user.id,
            courseId: validCourseId,
            price: coursePrice,
          },
        });
        console.log(`[CREATE_USER] Purchase creado exitosamente:`, purchase.id);
      } catch (purchaseError: unknown) {
        console.error(`[CREATE_USER] Error al crear Purchase:`, purchaseError);
        // Si el error es por Purchase duplicado, está bien (ya existe)
        const error = purchaseError as { code?: string };
        if (error?.code !== 'P2002') {
          // Si no es error de duplicado, lanzar error
          throw purchaseError;
        } else {
          console.log(`[CREATE_USER] Purchase ya existe, continuando...`);
        }
      }
    } else {
      console.log(`[CREATE_USER] No se crea Purchase - Role: ${finalRole}, CourseId válido: ${validCourseId}`);
    }

    return NextResponse.json(
      { 
        message: "Utente creato con successo", 
        user,
        purchaseCreated: role === "STUDENT" && courseId ? true : false,
      },
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

