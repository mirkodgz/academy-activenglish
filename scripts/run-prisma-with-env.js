// Script para ejecutar Prisma con las variables de entorno correctas
// Carga .env.local y mapea DATABASE_URL a activenglish_PRISMA_DATABASE_URL

const { spawn } = require('child_process');
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
}

// Ejecutar el comando de Prisma con las variables de entorno
const args = process.argv.slice(2);
const command = args[0] || 'migrate';
const subcommand = args[1] || 'deploy';

const prismaCmd = spawn('npx', ['prisma', command, subcommand, ...args.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

prismaCmd.on('close', (code) => {
  process.exit(code || 0);
});

