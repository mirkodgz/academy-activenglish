import { PrismaClient } from "@prisma/client";

// Mapear variables de entorno en runtime para compatibilidad
// Prisma schema busca activenglish_PRISMA_DATABASE_URL
// Pero en Vercel puede estar como DATABASE_URL o activenglish_PRISMA_DATABASE_URL
if (!process.env.activenglish_PRISMA_DATABASE_URL) {
  // Intentar mapear desde DATABASE_URL si existe
  if (process.env.DATABASE_URL) {
    process.env.activenglish_PRISMA_DATABASE_URL = process.env.DATABASE_URL;
  }
  // También intentar desde otras variantes comunes
  else if (process.env.activenglish_POSTGRES_URL) {
    process.env.activenglish_PRISMA_DATABASE_URL = process.env.activenglish_POSTGRES_URL;
  }
  else if (process.env.activeenglish_DATABASE_URL) {
    process.env.activenglish_PRISMA_DATABASE_URL = process.env.activeenglish_DATABASE_URL;
  }
}

// Validar que la variable esté disponible antes de crear PrismaClient
if (!process.env.activenglish_PRISMA_DATABASE_URL) {
  throw new Error(
    '❌ Error: activenglish_PRISMA_DATABASE_URL no está configurada.\n' +
    '   Configura una de estas variables en Vercel:\n' +
    '   - DATABASE_URL\n' +
    '   - activenglish_PRISMA_DATABASE_URL\n' +
    '   - activenglish_POSTGRES_URL'
  );
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
export { prisma };
