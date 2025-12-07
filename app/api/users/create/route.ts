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

    // Si se proporciona un curso, verificar que existe ANTES de crear el usuario
    let coursePrice = 0;
    if (validCourseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, price: true },
      });

      if (!course) {
        console.error(`[CREATE_USER] Curso no encontrado: ${courseId}`);
        return NextResponse.json(
          { error: `Corso non trovato con ID: ${courseId}` },
          { status: 404 }
        );
      }
      
      // Calcular el precio del curso
      coursePrice = course.price 
        ? parseFloat(course.price.replace(",", ".")) 
        : 0;
      
      console.log(`[CREATE_USER] Curso encontrado: ${course.id}, Precio: ${coursePrice}`);
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
      console.log(`[CREATE_USER] Creando Purchase para estudiante ${user.id} con curso ${validCourseId}, precio: ${coursePrice}`);
      
      try {
        // Verificar si ya existe una compra para este usuario y curso
        const existingPurchase = await prisma.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: validCourseId,
            },
          },
        });

        if (existingPurchase) {
          console.log(`[CREATE_USER] Purchase ya existe para este usuario y curso. ID: ${existingPurchase.id}`);
        } else {
          // Crear la compra
          const purchase = await prisma.purchase.create({
            data: {
              userId: user.id,
              courseId: validCourseId,
              price: coursePrice,
            },
          });
          console.log(`[CREATE_USER] Purchase creado exitosamente. ID: ${purchase.id}`);
        }
      } catch (purchaseError: unknown) {
        console.error(`[CREATE_USER] Error al crear Purchase:`, purchaseError);
        const error = purchaseError as { code?: string; message?: string };
        
        // Si el error es por Purchase duplicado (P2002), está bien (ya existe)
        if (error?.code === 'P2002') {
          console.log(`[CREATE_USER] Purchase duplicado detectado, continuando...`);
        } else {
          // Si es otro tipo de error, loguearlo pero no fallar la creación del usuario
          console.error(`[CREATE_USER] Error no crítico al crear Purchase:`, error?.message || String(purchaseError));
          // No lanzamos el error para que el usuario se cree aunque falle el Purchase
          // El admin puede crear el Purchase manualmente después si es necesario
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
    console.error("[CREATE_USER] Error completo:", error);
    console.error("[CREATE_USER] Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    
    // Proporcionar mensaje de error más específico
    let errorMessage = "Errore durante la creazione dell'utente";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("[CREATE_USER] Error message:", errorMessage);
      
      // Si es un error de Prisma, proporcionar más detalles
      if (error.message.includes("Unique constraint")) {
        errorMessage = "Un utente con questo email esiste già";
      } else if (error.message.includes("Foreign key constraint")) {
        errorMessage = "Errore: Il corso selezionato non esiste o non è valido";
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}

