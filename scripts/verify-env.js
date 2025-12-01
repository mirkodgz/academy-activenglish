// Script para verificar que activenglish_PRISMA_DATABASE_URL esté disponible
// Este script se ejecuta antes de prisma migrate deploy
// En producción (Vercel), activenglish_PRISMA_DATABASE_URL ya está configurada
// En local, se mapea desde DATABASE_URL si existe

const fs = require('fs');
const path = require('path');

// Cargar .env.local si existe (en local)
if (!process.env.VERCEL) {
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
  
  // Mapear DATABASE_URL a activenglish_PRISMA_DATABASE_URL si no existe
  if (!process.env.activenglish_PRISMA_DATABASE_URL && process.env.DATABASE_URL) {
    process.env.activenglish_PRISMA_DATABASE_URL = process.env.DATABASE_URL;
  }
}

const dbUrl = process.env.activenglish_PRISMA_DATABASE_URL;

if (!dbUrl) {
  console.error('❌ ERROR: activenglish_PRISMA_DATABASE_URL no está definida');
  console.error('');
  if (process.env.VERCEL) {
    console.error('En Vercel, configura activenglish_PRISMA_DATABASE_URL:');
    console.error('1. Ve a Settings → Environment Variables');
    console.error('2. Agrega activenglish_PRISMA_DATABASE_URL con el valor de Prisma Accelerate');
    console.error('3. Asegúrate de marcar Production, Preview y Development');
    console.error('4. Haz un redeploy');
  } else {
    console.error('En local, configura DATABASE_URL en .env.local:');
    console.error('1. Crea o edita .env.local');
    console.error('2. Agrega DATABASE_URL con tu connection string');
    console.error('3. El script automáticamente la mapeará a activenglish_PRISMA_DATABASE_URL');
  }
  process.exit(1);
}

console.log('✅ activenglish_PRISMA_DATABASE_URL está configurada');
console.log('   Longitud:', dbUrl.length);
console.log('   Inicia con:', dbUrl.substring(0, 30) + '...');

