// Script para ejecutar Prisma con las variables de entorno correctas
// Carga .env.local y mapea DATABASE_URL a activenglish_PRISMA_DATABASE_URL

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cargar .env.local si existe
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

// Verificar que la variable de entorno esté disponible
if (!process.env.activenglish_PRISMA_DATABASE_URL) {
  console.error('❌ Error: activenglish_PRISMA_DATABASE_URL no está configurada');
  console.error('   Asegúrate de configurar DATABASE_URL o activenglish_PRISMA_DATABASE_URL en Vercel');
  process.exit(1);
}

// Ejecutar el comando de Prisma con las variables de entorno
const args = process.argv.slice(2);
const command = args[0] || 'migrate';
const subcommand = args[1] || 'deploy';

console.log(`🚀 Ejecutando: prisma ${command} ${subcommand}`);
console.log(`📦 Variable de entorno: activenglish_PRISMA_DATABASE_URL está configurada`);

const prismaCmd = spawn('npx', ['prisma', command, subcommand, ...args.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

prismaCmd.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Migraciones ejecutadas correctamente');
  } else {
    console.error(`❌ Error al ejecutar migraciones (código: ${code})`);
  }
  process.exit(code || 0);
});

