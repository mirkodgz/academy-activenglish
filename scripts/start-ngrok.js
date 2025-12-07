#!/usr/bin/env node

/**
 * Script helper para iniciar ngrok y mostrar la URL
 * Uso: node scripts/start-ngrok.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando ngrok...\n');

// Ejecutar ngrok
const ngrokProcess = exec('ngrok http 3000 --log stdout', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error ejecutando ngrok:', error);
    return;
  }
});

// Capturar la salida de ngrok para extraer la URL
let ngrokOutput = '';

ngrokProcess.stdout.on('data', (data) => {
  const output = data.toString();
  ngrokOutput += output;
  process.stdout.write(output);

  // Buscar la URL de ngrok en la salida
  const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok(-free)?\.app/);
  if (urlMatch) {
    const ngrokUrl = urlMatch[0];
    console.log('\n✅ ngrok iniciado correctamente!');
    console.log(`📋 URL pública: ${ngrokUrl}`);
    console.log(`\n💡 Actualiza tu .env.local con:`);
    console.log(`   NEXT_PUBLIC_APP_URL=${ngrokUrl}`);
    console.log(`\n⚠️  Reinicia el servidor Next.js después de actualizar .env.local\n`);
  }
});

ngrokProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

ngrokProcess.on('close', (code) => {
  console.log(`\nngrok terminó con código ${code}`);
});

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo ngrok...');
  ngrokProcess.kill();
  process.exit(0);
});

