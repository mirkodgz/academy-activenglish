import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";

// UploadThing busca automáticamente estas variables de entorno en este orden:
// 1. UPLOADTHING_TOKEN (token combinado)
// 2. UPLOADTHING_SECRET + UPLOADTHING_APP_ID (separados)
// Si no encuentra ninguna, lanzará un error
const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // Verificar que las variables de entorno estén configuradas
      // UploadThing puede usar UPLOADTHING_TOKEN o UPLOADTHING_SECRET + UPLOADTHING_APP_ID
      const hasToken = !!process.env.UPLOADTHING_TOKEN;
      const hasSecretAndAppId = !!process.env.UPLOADTHING_SECRET && !!process.env.UPLOADTHING_APP_ID;
      
      if (!hasToken && !hasSecretAndAppId) {
        throw new Error("Uploadthing no está configurado. Necesitas UPLOADTHING_TOKEN o UPLOADTHING_SECRET + UPLOADTHING_APP_ID");
      }
      return {};
    })
    .onUploadComplete(({ file }) => {
      console.log("File uploaded successfully:", file.url);
      return { url: file.url };
    }),
  chapterVideo: f({
    video: { maxFileCount: 1, maxFileSize: "512GB" },
  }).onUploadComplete(({ file }) => {
    return { url: file.url };
  }),
  chapterDocument: f({
    // UploadThing acepta: pdf, image, video, audio, text, blob
    // blob acepta cualquier tipo de archivo (Word, Excel, etc.)
    pdf: { maxFileCount: 10, maxFileSize: "16MB" },
    blob: { maxFileCount: 10, maxFileSize: "16MB" },
  })
    .input(
      z.object({
        courseId: z.string(),
        chapterId: z.string(),
      })
    )
    .middleware(async ({ input }) => {
      console.log("🔐 [SERVER] Middleware ejecutado para chapterDocument");
      console.log("📥 [SERVER] Input recibido:", JSON.stringify(input, null, 2));
      
      // Verificar que las variables de entorno estén configuradas
      // UploadThing puede usar UPLOADTHING_TOKEN o UPLOADTHING_SECRET + UPLOADTHING_APP_ID
      const hasToken = !!process.env.UPLOADTHING_TOKEN;
      const hasSecretAndAppId = !!process.env.UPLOADTHING_SECRET && !!process.env.UPLOADTHING_APP_ID;
      
      if (!hasToken && !hasSecretAndAppId) {
        console.error("❌ [SERVER] Uploadthing no está configurado. Faltan variables de entorno");
        throw new Error("Uploadthing no está configurado. Necesitas UPLOADTHING_TOKEN o UPLOADTHING_SECRET + UPLOADTHING_APP_ID");
      }
      console.log("✅ [SERVER] Variables de entorno de UploadThing configuradas correctamente");
      
      // Validar que el input tenga los campos necesarios
      if (!input || typeof input !== 'object' || !('courseId' in input) || !('chapterId' in input)) {
        console.error("❌ [SERVER] Input inválido o faltan courseId/chapterId:", input);
        throw new Error("Input inválido: se requieren courseId y chapterId");
      }
      
      console.log("✅ [SERVER] Input válido, retornando metadata:", { courseId: input.courseId, chapterId: input.chapterId });
      
      // Retornar el input para que esté disponible en onUploadComplete
      return { courseId: input.courseId, chapterId: input.chapterId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("🔥🔥🔥 [SERVER] ===== onUploadComplete EJECUTADO =====");
      console.log("✅ [SERVER] Document uploaded successfully to UploadThing:", {
        url: file.url,
        name: file.name,
        size: file.size,
        key: file.key,
        type: file.type,
        metadata,
      });
      console.log("📦 [SERVER] Metadata recibido:", JSON.stringify(metadata, null, 2));
      console.log("📦 [SERVER] Metadata type:", typeof metadata);
      console.log("📦 [SERVER] Metadata keys:", metadata ? Object.keys(metadata) : "null");
      
      // Guardar automáticamente en la BD usando courseId y chapterId del metadata
      if (metadata && typeof metadata === 'object' && 'courseId' in metadata && 'chapterId' in metadata) {
        try {
          const courseId = metadata.courseId as string;
          const chapterId = metadata.chapterId as string;
          
          console.log("💾 [SERVER] Auto-saving file to database:", { courseId, chapterId, fileUrl: file.url });
          
          // Importar Prisma dinámicamente para evitar problemas de importación circular
          const prisma = (await import("@/lib/prisma")).default;
          
          // Obtener el capítulo actual para agregar el nuevo recurso
          const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId, courseId: courseId },
            select: { resources: true },
          });
          
          if (!chapter) {
            console.error("❌ [SERVER] Chapter not found:", { courseId, chapterId });
            return { url: file.url, name: file.name, size: file.size, type: file.type };
          }
          
          // Parsear recursos existentes
          let existingResources: Array<{ url: string; name: string; type?: string; size?: number }> = [];
          if (chapter.resources) {
            if (Array.isArray(chapter.resources)) {
              // Validar que cada elemento tenga la estructura correcta
              existingResources = chapter.resources.filter((r): r is { url: string; name: string; type?: string; size?: number } => {
                return typeof r === 'object' && r !== null && 'url' in r && typeof (r as { url: unknown }).url === 'string';
              }).map(r => ({
                url: (r as { url: string }).url,
                name: (r as { name?: string }).name || (r as { url: string }).url.split('/').pop() || 'Unknown',
                type: (r as { type?: string }).type,
                size: (r as { size?: number }).size,
              }));
            } else if (typeof chapter.resources === 'string') {
              try {
                const parsed = JSON.parse(chapter.resources);
                if (Array.isArray(parsed)) {
                  existingResources = parsed.filter((r): r is { url: string; name: string; type?: string; size?: number } => {
                    return typeof r === 'object' && r !== null && 'url' in r && typeof (r as { url: unknown }).url === 'string';
                  }).map(r => ({
                    url: (r as { url: string }).url,
                    name: (r as { name?: string }).name || (r as { url: string }).url.split('/').pop() || 'Unknown',
                    type: (r as { type?: string }).type,
                    size: (r as { size?: number }).size,
                  }));
                }
              } catch (e) {
                console.error("Error parsing existing resources:", e);
              }
            }
          }
          
          // Verificar si el archivo ya existe (por URL)
          const fileExists = existingResources.some(r => r.url === file.url);
          if (fileExists) {
            console.log("⚠️ [SERVER] File already exists in database, skipping");
            return { url: file.url, name: file.name, size: file.size, type: file.type };
          }
          
          // Agregar el nuevo recurso
          const newResource = {
            url: file.url,
            name: file.name || file.url.split('/').pop() || `Documento_${Date.now()}`,
            type: file.type || 'file',
            size: file.size || 0,
          };
          
          const updatedResources = [...existingResources, newResource];
          
          // Guardar en la BD
          await prisma.chapter.update({
            where: { id: chapterId, courseId: courseId },
            data: { resources: updatedResources },
          });
          
          console.log("✅ [SERVER] File auto-saved to database successfully");
        } catch (error) {
          console.error("❌ [SERVER] Error auto-saving file to database:", error);
          // No lanzar error, solo loguear - el cliente puede guardar manualmente
        }
      } else {
        console.log("⚠️ [SERVER] No courseId/chapterId in metadata, skipping auto-save");
      }
      
      // Retornar los datos que el cliente espera
      // En desarrollo local, este callback puede no ejecutarse si UploadThing no puede alcanzar el servidor
      // Pero UploadThing devolverá los datos directamente al cliente de todas formas
      const result = { 
        url: file.url, 
        name: file.name, 
        size: file.size,
        type: file.type // Agregar type para que el cliente pueda determinar el tipo de archivo
      };
      
      console.log("📤 [SERVER] Returning to client:", result);
      return result;
    }),
  chapterImages: f({
    image: { maxFileCount: 10, maxFileSize: "4MB" },
  })
    .input(
      z.object({
        courseId: z.string(),
        chapterId: z.string(),
      })
    )
    .middleware(async ({ input }) => {
      console.log("🔐 Middleware ejecutado para chapterImages");
      console.log("📥 Input recibido:", input);
      
      // Verificar que las variables de entorno estén configuradas
      // UploadThing puede usar UPLOADTHING_TOKEN o UPLOADTHING_SECRET + UPLOADTHING_APP_ID
      const hasToken = !!process.env.UPLOADTHING_TOKEN;
      const hasSecretAndAppId = !!process.env.UPLOADTHING_SECRET && !!process.env.UPLOADTHING_APP_ID;
      
      if (!hasToken && !hasSecretAndAppId) {
        throw new Error("Uploadthing no está configurado. Necesitas UPLOADTHING_TOKEN o UPLOADTHING_SECRET + UPLOADTHING_APP_ID");
      }
      
      // Retornar el input para que esté disponible en onUploadComplete
      return { courseId: input.courseId, chapterId: input.chapterId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("✅ [SERVER] Image uploaded successfully to UploadThing:", {
        url: file.url,
        name: file.name,
        size: file.size,
        key: file.key,
        type: file.type,
        metadata,
      });
      
      // Guardar automáticamente en la BD usando courseId y chapterId del metadata
      if (metadata && typeof metadata === 'object' && 'courseId' in metadata && 'chapterId' in metadata) {
        try {
          const courseId = metadata.courseId as string;
          const chapterId = metadata.chapterId as string;
          
          console.log("💾 [SERVER] Auto-saving image to database:", { courseId, chapterId, fileUrl: file.url });
          
          // Importar Prisma dinámicamente para evitar problemas de importación circular
          const prisma = (await import("@/lib/prisma")).default;
          
          // Obtener el capítulo actual para agregar el nuevo recurso
          const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId, courseId: courseId },
            select: { resources: true },
          });
          
          if (!chapter) {
            console.error("❌ [SERVER] Chapter not found:", { courseId, chapterId });
            return { url: file.url, name: file.name, size: file.size, type: file.type };
          }
          
          // Parsear recursos existentes
          let existingResources: Array<{ url: string; name: string; type?: string; size?: number }> = [];
          if (chapter.resources) {
            if (Array.isArray(chapter.resources)) {
              // Validar que cada elemento tenga la estructura correcta
              existingResources = chapter.resources.filter((r): r is { url: string; name: string; type?: string; size?: number } => {
                return typeof r === 'object' && r !== null && 'url' in r && typeof (r as { url: unknown }).url === 'string';
              }).map(r => ({
                url: (r as { url: string }).url,
                name: (r as { name?: string }).name || (r as { url: string }).url.split('/').pop() || 'Unknown',
                type: (r as { type?: string }).type,
                size: (r as { size?: number }).size,
              }));
            } else if (typeof chapter.resources === 'string') {
              try {
                const parsed = JSON.parse(chapter.resources);
                if (Array.isArray(parsed)) {
                  existingResources = parsed.filter((r): r is { url: string; name: string; type?: string; size?: number } => {
                    return typeof r === 'object' && r !== null && 'url' in r && typeof (r as { url: unknown }).url === 'string';
                  }).map(r => ({
                    url: (r as { url: string }).url,
                    name: (r as { name?: string }).name || (r as { url: string }).url.split('/').pop() || 'Unknown',
                    type: (r as { type?: string }).type,
                    size: (r as { size?: number }).size,
                  }));
                }
              } catch (e) {
                console.error("Error parsing existing resources:", e);
              }
            }
          }
          
          // Verificar si el archivo ya existe (por URL)
          const fileExists = existingResources.some(r => r.url === file.url);
          if (fileExists) {
            console.log("⚠️ [SERVER] Image already exists in database, skipping");
            return { url: file.url, name: file.name, size: file.size, type: file.type };
          }
          
          // Agregar el nuevo recurso
          const newResource = {
            url: file.url,
            name: file.name || file.url.split('/').pop() || `Immagine_${Date.now()}`,
            type: file.type || 'image',
            size: file.size || 0,
          };
          
          const updatedResources = [...existingResources, newResource];
          
          // Guardar en la BD
          await prisma.chapter.update({
            where: { id: chapterId, courseId: courseId },
            data: { resources: updatedResources },
          });
          
          console.log("✅ [SERVER] Image auto-saved to database successfully");
        } catch (error) {
          console.error("❌ [SERVER] Error auto-saving image to database:", error);
          // No lanzar error, solo loguear - el cliente puede guardar manualmente
        }
      } else {
        console.log("⚠️ [SERVER] No courseId/chapterId in metadata, skipping auto-save");
      }
      
      return { url: file.url, name: file.name, size: file.size, type: file.type };
    }),
  chapterImage: f({
    image: { maxFileCount: 1, maxFileSize: "4MB" },
  }).onUploadComplete(({ file }) => {
    return { url: file.url };
  }),
  chapterResources: f({
    image: { maxFileCount: 10, maxFileSize: "4MB" },
    pdf: { maxFileCount: 10, maxFileSize: "16MB" },
    blob: { maxFileCount: 10, maxFileSize: "16MB" }, // Para Excel, Word, etc.
  }).onUploadComplete(({ file }) => {
    return { url: file.url, name: file.name, size: file.size };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
