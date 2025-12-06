#!/usr/bin/env node
/**
 * Script para verificar la configuración de UploadThing
 */

const requiredEnvVars = [
  'UPLOADTHING_SECRET',
  'UPLOADTHING_APP_ID',
];

console.log('🔍 Verificando configuración de UploadThing...\n');

let allConfigured = true;

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ ${varName} no está configurada`);
    allConfigured = false;
  } else {
    // Mostrar solo los primeros caracteres por seguridad
    const preview = value.length > 10 ? `${value.substring(0, 10)}...` : value;
    console.log(`✅ ${varName} está configurada: ${preview}`);
  }
});

if (allConfigured) {
  console.log('\n✅ Todas las variables de entorno de UploadThing están configuradas correctamente');
  process.exit(0);
} else {
  console.log('\n❌ Faltan variables de entorno de UploadThing');
  console.log('\n📝 Para configurar:');
  console.log('1. Ve a https://uploadthing.com');
  console.log('2. Crea una cuenta y obtén tus credenciales');
  console.log('3. Agrega las variables en .env.local:');
  console.log('   UPLOADTHING_SECRET=sk_live_...');
  console.log('   UPLOADTHING_APP_ID=...');
  process.exit(1);
}


