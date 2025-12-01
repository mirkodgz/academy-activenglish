// Script para verificar que activenglish_PRISMA_DATABASE_URL esté disponible
// Este script se ejecuta antes de prisma migrate deploy

if (!process.env.activenglish_PRISMA_DATABASE_URL) {
  console.error('❌ ERROR: activenglish_PRISMA_DATABASE_URL no está definida');
  console.error('');
  console.error('Por favor, configura activenglish_PRISMA_DATABASE_URL en Vercel:');
  console.error('1. Ve a Settings → Environment Variables');
  console.error('2. Agrega activenglish_PRISMA_DATABASE_URL con el valor de Prisma Accelerate');
  console.error('3. Asegúrate de marcar Production, Preview y Development');
  console.error('4. Haz un redeploy');
  process.exit(1);
}

console.log('✅ activenglish_PRISMA_DATABASE_URL está configurada');
console.log('   Longitud:', process.env.activenglish_PRISMA_DATABASE_URL.length);
console.log('   Inicia con:', process.env.activenglish_PRISMA_DATABASE_URL.substring(0, 30) + '...');

