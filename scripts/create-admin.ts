import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = "admin@activeenglish.com";
    const adminPassword = "admin123"; // Cambia esto por una contraseña segura
    
    // Verificar si el admin ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("❌ El usuario administrador ya existe:", adminEmail);
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Crear el usuario administrador
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "Active English",
        role: "ADMIN",
      },
    });

    console.log("✅ Usuario administrador creado exitosamente!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("👤 Nombre:", admin.firstName, admin.lastName);
    console.log("🔐 Rol:", admin.role);
    console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión!");
  } catch (error) {
    console.error("❌ Error al crear el usuario administrador:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

