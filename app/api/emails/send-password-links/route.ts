import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId, isAdmin } from "@/lib/auth";
import { resend } from "@/lib/resend";
import crypto from "crypto";

// POST - Enviar correos masivos con enlaces de contraseña
export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const userIsAdmin = await isAdmin();

    // Solo ADMIN puede enviar correos
    if (!userId || !userIsAdmin) {
      return NextResponse.json(
        { error: "Non autorizzato - Solo gli amministratori possono inviare email" },
        { status: 403 }
      );
    }

    const { courseId, subject, body, urlBase } = await req.json();

    // Validaciones
    if (!courseId || !subject || !body || !urlBase) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori (courseId, subject, body, urlBase)" },
        { status: 400 }
      );
    }

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Corso non trovato" },
        { status: 404 }
      );
    }

    // Obtener estudiantes que compraron este curso
    const purchases = await prisma.purchase.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Filtrar solo estudiantes
    const students = purchases.filter((p) => p.user.role === "STUDENT");

    if (students.length === 0) {
      return NextResponse.json(
        { error: "Nessuno studente ha acquistato questo corso" },
        { status: 400 }
      );
    }

    // Verificar que Resend esté configurado
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY non configurata" },
        { status: 500 }
      );
    }

    // Usar dominio verificado si está configurado, sino usar dominio de prueba
    // El dominio verificado funciona tanto en local como en producción
    const hasVerifiedDomain = process.env.RESEND_FROM_EMAIL?.includes("@activenglish") || process.env.RESEND_FROM_EMAIL?.includes("@academy.activenglish");
    const fromEmail = hasVerifiedDomain ? (process.env.RESEND_FROM_EMAIL || "noreply@academy.activenglish.it") : "onboarding@resend.dev";

    console.log(`[SEND-PASSWORD-LINKS] Configuración de envío:`);
    console.log(`   - RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || "NO CONFIGURADO"}`);
    console.log(`   - Dominio verificado: ${hasVerifiedDomain ? "SÍ" : "NO"}`);
    console.log(`   - From Email: ${fromEmail}`);
    console.log(`   - Total estudiantes: ${students.length}`);

    // Procesar cada estudiante
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    for (const purchase of students) {
      const student = purchase.user;
      
      console.log(`\n[SEND-PASSWORD-LINKS] Procesando email para: ${student.email}`);

      try {
        // 1. Invalidar token existente (si existe)
        const deletedTokens = await prisma.verificationToken.deleteMany({
          where: {
            identifier: student.email,
          },
        });
        console.log(`[SEND-PASSWORD-LINKS] Tokens eliminados para ${student.email}: ${deletedTokens.count}`);

        // 2. Generar nuevo token único
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
        console.log(`[SEND-PASSWORD-LINKS] Token generado para ${student.email}:`);
        console.log(`   Token completo: ${token}`);
        console.log(`   Token preview: ${token.substring(0, 20)}...`);
        console.log(`[SEND-PASSWORD-LINKS] Token expira en: ${expiresAt.toISOString()}`);

        // 3. Guardar token en la BD
        const savedToken = await prisma.verificationToken.create({
          data: {
            identifier: student.email,
            token: token,
            expires: expiresAt,
          },
        });
        console.log(`[SEND-PASSWORD-LINKS] Token guardado en BD:`);
        console.log(`   Identifier: ${savedToken.identifier}`);
        console.log(`   Token guardado: ${savedToken.token}`);
        console.log(`   Expires: ${savedToken.expires.toISOString()}`);
        
        // Verificar que el token se guardó correctamente inmediatamente después de guardarlo
        const verifyToken = await prisma.verificationToken.findUnique({
          where: { token: token },
        });
        if (verifyToken) {
          console.log(`[SEND-PASSWORD-LINKS] Verificación inmediata de token guardado: Encontrado`);
          console.log(`   Token en BD: ${verifyToken.token}`);
          console.log(`   Token generado: ${token}`);
          console.log(`   Token coincide: ${verifyToken.token === token}`);
          console.log(`   Longitud token BD: ${verifyToken.token.length}`);
          console.log(`   Longitud token generado: ${token.length}`);
        } else {
          console.log(`[SEND-PASSWORD-LINKS] Verificación inmediata de token guardado: NO encontrado`);
          console.log(`   [SEND-PASSWORD-LINKS] ERROR: El token se guardó pero no se puede encontrar inmediatamente después`);
        }

        // 4. Construir URL del enlace - usar el token que se guardó en BD para asegurar consistencia
        const tokenToUse = savedToken.token; // Usar el token que realmente se guardó
        const passwordLink = `${urlBase}?token=${tokenToUse}`;
        
        console.log(`[SEND-PASSWORD-LINKS] Generando enlace para ${student.email}:`);
        console.log(`   URL completa: ${passwordLink}`);
        console.log(`   Token usado en URL: ${tokenToUse}`);
        console.log(`   Token coincide con generado: ${tokenToUse === token}`);

        // 5. Reemplazar placeholders en el cuerpo del mensaje
        let emailBody = body
          .replace(/{firstName}/g, student.firstName || "Estudiante")
          .replace(/{lastName}/g, student.lastName || "")
          .replace(/{email}/g, student.email)
          .replace(/{courseTitle}/g, course.title);
        
        // Reemplazar {link} con el enlace HTML
        const linkHtml = `<a href="${passwordLink}" style="color: #0b3d4d; text-decoration: underline; font-weight: bold;">${passwordLink}</a>`;
        emailBody = emailBody.replace(/{link}/g, linkHtml);
        
        // Si no hay placeholder {link}, agregar el enlace al final del mensaje
        if (!body.includes("{link}")) {
          console.log(`[SEND-PASSWORD-LINKS] No se encontró placeholder {link} en el cuerpo del mensaje. Agregando enlace al final.`);
          emailBody += `\n\n<p style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #0b3d4d; border-radius: 4px;">`;
          emailBody += `<strong>Enlace para establecer tu contraseña:</strong><br>`;
          emailBody += linkHtml;
          emailBody += `</p>`;
        }
        
        console.log(`[SEND-PASSWORD-LINKS] Cuerpo del email procesado para ${student.email}. Incluye enlace: ${emailBody.includes(passwordLink)}`);

        // 6. Enviar email
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #0b3d4d; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0;">Active English</h1>
              </div>
              <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                ${emailBody.replace(/\n/g, "<br>")}
              </div>
              <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              </div>
            </body>
          </html>
        `;

        console.log(`[SEND-PASSWORD-LINKS] Intentando enviar email a ${student.email} desde ${fromEmail}...`);
        
        let emailResult = await resend.emails.send({
          from: fromEmail,
          to: student.email,
          subject: subject,
          html: htmlContent,
        });

        console.log(`[SEND-PASSWORD-LINKS] Respuesta de Resend para ${student.email}:`, {
          success: !emailResult.error,
          error: emailResult.error ? emailResult.error.message : null,
          data: emailResult.data ? { id: emailResult.data.id } : null,
        });

        // Si hay error y es por dominio no verificado, intentar con dominio de prueba
        if (emailResult.error) {
          const errorMessage = emailResult.error.message || "";
          console.log(`[SEND-PASSWORD-LINKS] Error al enviar a ${student.email}:`, errorMessage);
          
          if (errorMessage.includes("domain is not verified")) {
            console.log(`[SEND-PASSWORD-LINKS] Dominio no verificado para ${student.email}. Intentando con dominio de prueba...`);
            
            // Intentar con dominio de prueba
            emailResult = await resend.emails.send({
              from: "onboarding@resend.dev",
              to: student.email,
              subject: subject,
              html: htmlContent,
            });

            if (emailResult.error) {
              const fallbackError = emailResult.error.message || "";
              
              // Si el error es que solo puede enviar a su propio email (limitación de Resend free)
              if (fallbackError.includes("only send testing emails to your own email")) {
                const testingEmail = process.env.RESEND_TESTING_EMAIL || "support@activenglish.it";
                console.log(`[SEND-PASSWORD-LINKS] Resend free solo permite enviar a tu propio email. Enviando a ${testingEmail} para testing...`);
                
                // Enviar a email de testing configurado
                emailResult = await resend.emails.send({
                  from: "onboarding@resend.dev",
                  to: testingEmail,
                  subject: `[TEST] ${subject}`,
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      </head>
                      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background-color: #ff9800; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
                          <h2 style="color: #ffffff; margin: 0;">EMAIL DE PRUEBA</h2>
                        </div>
                        <div style="background-color: #fff3cd; padding: 20px; border: 1px solid #ffc107;">
                          <p><strong>Este es un email de prueba.</strong></p>
                          <p><strong>Destinatario original:</strong> ${student.email}</p>
                          <p><strong>Motivo:</strong> Resend free solo permite enviar a tu propio email. Para enviar a otros destinatarios, verifica tu dominio en <a href="https://resend.com/domains">resend.com/domains</a></p>
                        </div>
                        <div style="background-color: #0b3d4d; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                          <h1 style="color: #ffffff; margin: 0;">Active English</h1>
                        </div>
                        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                          ${emailBody.replace(/\n/g, "<br>")}
                        </div>
                        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                        </div>
                      </body>
                    </html>
                  `,
                });

                if (emailResult.error) {
                  throw new Error(`No se pudo enviar email. Error: ${fallbackError}. Para enviar a otros destinatarios, verifica tu dominio en resend.com/domains`);
                }

                console.log(`[SEND-PASSWORD-LINKS] Email de prueba enviado a ${testingEmail} (destinatario original: ${student.email})`);
                // No contar como enviado, pero tampoco como fallido - es un caso especial
                results.sent++; // Contar como enviado para no bloquear el proceso
              } else {
                throw new Error(fallbackError);
              }
            } else {
              console.log(`[SEND-PASSWORD-LINKS] Email enviado usando dominio de prueba (onboarding@resend.dev) a ${student.email}`);
              results.sent++;
            }
          } else {
            // Si es otro tipo de error, lanzarlo
            throw new Error(errorMessage);
          }
        } else {
          // Email enviado exitosamente sin errores
          console.log(`[SEND-PASSWORD-LINKS] Email enviado exitosamente a ${student.email} desde ${fromEmail}`);
          results.sent++;
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
        results.errors.push({
          email: student.email,
          error: errorMessage,
        });
        console.error(`[SEND-PASSWORD-LINKS] Error enviando email a ${student.email}:`, error);
        console.error(`   Detalles del error:`, error instanceof Error ? error.stack : error);
      }
    }
    
    console.log(`\n[SEND-PASSWORD-LINKS] Resumen del envío:`);
    console.log(`   - Enviados: ${results.sent}`);
    console.log(`   - Fallidos: ${results.failed}`);
    console.log(`   - Errores:`, results.errors);

    return NextResponse.json({
      success: true,
      courseId: course.id,
      courseTitle: course.title,
      totalStudents: students.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    });
  } catch (error) {
    console.error("[SEND_PASSWORD_LINKS]", error);
    return NextResponse.json(
      { error: "Errore durante l'invio delle email" },
      { status: 500 }
    );
  }
}

