import { Resend } from 'resend';

// Verificar que la API key esté configurada
if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY no configurada. El servicio de email no funcionará.");
  // En producción, podrías lanzar un error o manejarlo de otra forma
  // throw new Error("RESEND_API_KEY is not configured");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

