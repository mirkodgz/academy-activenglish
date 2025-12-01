// Script para mapear DATABASE_URL a activenglish_PRISMA_DATABASE_URL en local
// En producción (Vercel), activenglish_PRISMA_DATABASE_URL ya está disponible
// En local, mapeamos DATABASE_URL a activenglish_PRISMA_DATABASE_URL para que Prisma funcione

const fs = require('fs');
const path = require('path');

// Cargar .env.local si existe
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocal = fs.readFileSync(envLocalPath, 'utf8');
  envLocal.split('\n').forEach(line => {
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

// Mapear DATABASE_URL a activenglish_PRISMA_DATABASE_URL si no existe (solo en local)
if (!process.env.VERCEL && !process.env.activenglish_PRISMA_DATABASE_URL && process.env.DATABASE_URL) {
  process.env.activenglish_PRISMA_DATABASE_URL = process.env.DATABASE_URL;
  console.log('✅ Mapeado DATABASE_URL → activenglish_PRISMA_DATABASE_URL (local)');
}

