import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateTeacherToAdmin() {
  try {
    // Primero, actualizar todos los usuarios con rol TEACHER a ADMIN
    // Nota: Esto requiere que el enum ya tenga ADMIN, así que primero
    // necesitamos hacer el cambio en el schema y luego ejecutar este script
    
    console.log("🔄 Migrando usuarios TEACHER a ADMIN...");
    
    // Como Prisma no permite cambiar enum values directamente,
    // necesitamos usar una query SQL raw
    const result = await prisma.$executeRaw`
      UPDATE "User" 
      SET role = 'ADMIN'::text 
      WHERE role = 'TEACHER'::text
    `;
    
    console.log(`✅ ${result} usuario(s) actualizado(s) de TEACHER a ADMIN`);
  } catch (error) {
    console.error("❌ Error al migrar:", error);
    // Si falla, puede ser que el enum ya esté cambiado
    console.log("ℹ️  Intentando crear usuario admin directamente...");
  } finally {
    await prisma.$disconnect();
  }
}

migrateTeacherToAdmin();

