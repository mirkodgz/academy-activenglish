const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const path = require('path');

// Cargar .env.local si existe
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocal = fs.readFileSync(envLocalPath, 'utf8');
  envLocal.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remover comillas si existen
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

// Mapear DATABASE_URL a activenglish_PRISMA_DATABASE_URL si no existe
if (!process.env.activenglish_PRISMA_DATABASE_URL && process.env.DATABASE_URL) {
  process.env.activenglish_PRISMA_DATABASE_URL = process.env.DATABASE_URL;
}

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    const adminEmail = "testadmin@admin.com";
    const adminPassword = "123456";
    
    console.log("🔍 Verificando si el usuario ya existe...");
    
    // Verificar si el admin ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("⚠️  El usuario ya existe:", adminEmail);
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Nombre:", existingAdmin.firstName, existingAdmin.lastName);
      console.log("🔐 Rol:", existingAdmin.role);
      
      // Actualizar el rol a ADMIN si no lo es
      if (existingAdmin.role !== "ADMIN") {
        console.log("\n🔄 Actualizando rol a ADMIN...");
        const updated = await prisma.user.update({
          where: { email: adminEmail },
          data: { role: "ADMIN" },
        });
        console.log("✅ Rol actualizado a ADMIN");
        console.log("📧 Email:", updated.email);
        console.log("🔐 Rol:", updated.role);
      }
      
      // Actualizar la contraseña si es necesario
      console.log("\n🔄 Actualizando contraseña...");
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword },
      });
      console.log("✅ Contraseña actualizada");
      
      return;
    }

    console.log("🔐 Hasheando contraseña...");
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log("👤 Creando usuario administrador...");
    // Crear el usuario administrador
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Test",
        lastName: "Admin",
        role: "ADMIN",
      },
    });

    console.log("\n✅ Usuario administrador creado exitosamente!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", adminPassword);
    console.log("👤 Nombre:", admin.firstName, admin.lastName);
    console.log("🔐 Rol:", admin.role);
    console.log("🆔 ID:", admin.id);
    console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión!");
  } catch (error) {
    console.error("❌ Error al crear el usuario administrador:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();

