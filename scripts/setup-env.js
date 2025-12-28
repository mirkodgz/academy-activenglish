// Script para mapear DATABASE_URL a activenglish_PRISMA_DATABASE_URL en local
// En producción (Vercel), activenglish_PRISMA_DATABASE_URL ya está disponible
// En local, mapeamos DATABASE_URL a activenglish_PRISMA_DATABASE_URL para que Prisma funcione

const fs = require('fs');
const path = require('path');

// Cargar .env.local si existe
const loadEnvFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, 'utf8');
    envContent.split('\n').forEach(line => {
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
};

const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

loadEnvFile(envLocalPath);
loadEnvFile(envPath);

// Mapear DATABASE_URL a activenglish_PRISMA_DATABASE_URL si no existe
// Funciona tanto en local como en Vercel
if (!process.env.activenglish_PRISMA_DATABASE_URL && process.env.DATABASE_URL) {
  process.env.activenglish_PRISMA_DATABASE_URL = process.env.DATABASE_URL;
  if (process.env.VERCEL) {
    console.log('✅ Mapeado DATABASE_URL → activenglish_PRISMA_DATABASE_URL (Vercel)');
  } else {
    console.log('✅ Mapeado DATABASE_URL → activenglish_PRISMA_DATABASE_URL (local)');
  }
}

