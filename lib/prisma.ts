import { PrismaClient } from "@prisma/client";

// Mapear DATABASE_URL a activenglish_PRISMA_DATABASE_URL en runtime si no existe
// Esto es necesario porque Prisma schema usa activenglish_PRISMA_DATABASE_URL
// pero en Vercel puede estar configurada como DATABASE_URL
if (!process.env.activenglish_PRISMA_DATABASE_URL && process.env.DATABASE_URL) {
  process.env.activenglish_PRISMA_DATABASE_URL = process.env.DATABASE_URL;
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
export { prisma };
