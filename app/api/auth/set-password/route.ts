import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST - Establecer contraseña usando token
export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Validaciones
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e password sono obbligatori" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La password deve essere di almeno 6 caratteri" },
        { status: 400 }
      );
    }

    // Buscar el token en la BD
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token: token,
      },
    });

    // Validar token
    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token non valido o scaduto" },
        { status: 400 }
      );
    }

    // Verificar que no haya expirado
    if (verificationToken.expires < new Date()) {
      // Eliminar token expirado
      await prisma.verificationToken.delete({
        where: {
          token: token,
        },
      });
      return NextResponse.json(
        { error: "Token scaduto. Richiedi un nuovo link." },
        { status: 400 }
      );
    }

    // Buscar el usuario por email (identifier)
    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Eliminar el token usado (solo se puede usar una vez)
    await prisma.verificationToken.delete({
      where: {
        token: token,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password impostata con successo",
    });
  } catch (error) {
    console.error("[SET_PASSWORD]", error);
    return NextResponse.json(
      { error: "Errore durante l'impostazione della password" },
      { status: 500 }
    );
  }
}

// GET - Validar token (para verificar si es válido antes de mostrar el formulario)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token non fornito" },
        { status: 400 }
      );
    }

    console.log(`🔍 Validando token:`);
    console.log(`   Token recibido: ${token}`);
    console.log(`   Token preview: ${token.substring(0, 20)}...`);
    
    // Buscar el token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token: token,
      },
    });

    console.log(`📋 Token encontrado en BD: ${verificationToken ? "SÍ" : "NO"}`);
    
    if (!verificationToken) {
      // Buscar todos los tokens para debuggear
      const allTokens = await prisma.verificationToken.findMany({
        take: 10,
        orderBy: { expires: "desc" },
      });
      console.log(`📊 Últimos 10 tokens en BD:`);
      allTokens.forEach((t, index) => {
        console.log(`   ${index + 1}. Email: ${t.identifier}, Token: ${t.token}, Expira: ${t.expires.toISOString()}`);
        console.log(`      Token completo: ${t.token}`);
        console.log(`      Token recibido: ${token}`);
        console.log(`      Coinciden: ${t.token === token}`);
      });
      
      // Intentar buscar el token de forma más flexible (por si hay espacios o caracteres especiales)
      const trimmedToken = token.trim();
      const tokenWithoutSpaces = token.replace(/\s/g, '');
      console.log(`🔍 Buscando variaciones del token:`);
      console.log(`   Token original: "${token}"`);
      console.log(`   Token trimmed: "${trimmedToken}"`);
      console.log(`   Token sin espacios: "${tokenWithoutSpaces}"`);
      
      // Intentar buscar con el token trimmed
      if (trimmedToken !== token) {
        const trimmedVerificationToken = await prisma.verificationToken.findUnique({
          where: { token: trimmedToken },
        });
        if (trimmedVerificationToken) {
          console.log(`✅ Token encontrado con trimmed!`);
          return NextResponse.json({
            valid: true,
            email: trimmedVerificationToken.identifier,
          });
        }
      }
      
      // Buscar tokens para el mismo email
      const tokensForEmail = await prisma.verificationToken.findMany({
        where: {
          identifier: {
            contains: "@",
          },
        },
        orderBy: { expires: "desc" },
        take: 5,
      });
      console.log(`📧 Últimos tokens por email:`, tokensForEmail.map(t => ({
        email: t.identifier,
        token: t.token,
        expires: t.expires.toISOString(),
      })));
      
      return NextResponse.json(
        { valid: false, error: "Token non valido" },
        { status: 200 }
      );
    }
    
    console.log(`✅ Token encontrado:`);
    console.log(`   Email: ${verificationToken.identifier}`);
    console.log(`   Token en BD: ${verificationToken.token}`);
    console.log(`   Token coincide: ${verificationToken.token === token}`);
    console.log(`   Expira: ${verificationToken.expires.toISOString()}`);

    // Verificar expiración
    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Token scaduto" },
        { status: 200 }
      );
    }

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return NextResponse.json({
      valid: true,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
    });
  } catch (error) {
    console.error("[VALIDATE_TOKEN]", error);
    return NextResponse.json(
      { valid: false, error: "Errore durante la validazione del token" },
      { status: 500 }
    );
  }
}

