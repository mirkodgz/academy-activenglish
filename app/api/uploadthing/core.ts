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
      // Verificar que las variables de entorno estén configuradas
      const hasToken = !!process.env.UPLOADTHING_TOKEN;
      const hasSecretAndAppId = !!process.env.UPLOADTHING_SECRET && !!process.env.UPLOADTHING_APP_ID;
      
      if (!hasToken && !hasSecretAndAppId) {
        throw new Error("Uploadthing no está configurado. Necesitas UPLOADTHING_TOKEN o UPLOADTHING_SECRET + UPLOADTHING_APP_ID");
      }
      
      return { courseId: input.courseId, chapterId: input.chapterId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("[SERVER] ===== onUploadComplete EJECUTADO (chapterDocument) =====");
      console.log("[SERVER] File:", { url: file.url, name: file.name, size: file.size, type: file.type });
      console.log("[SERVER] Metadata:", JSON.stringify(metadata, null, 2));
      console.log("[SERVER] Metadata type:", typeof metadata);
      console.log("[SERVER] Metadata keys:", metadata ? Object.keys(metadata) : "null");
      
      // Guardar automáticamente en la BD (fallback si el callback del cliente no se ejecuta)
      if (metadata && typeof metadata === 'object' && 'courseId' in metadata && 'chapterId' in metadata) {
        try {
          const courseId = metadata.courseId as string;
          const chapterId = metadata.chapterId as string;
          
          console.log("[SERVER] Guardando archivo en BD:", { courseId, chapterId, fileUrl: file.url });
          
          const prisma = (await import("@/lib/prisma")).default;
          
          const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId, courseId: courseId },
            select: { resources: true },
          });
          
          if (!chapter) {
            console.error("[SERVER] Chapter not found:", { courseId, chapterId });
            return { 
              url: file.url, 
              name: file.name, 
              size: file.size,
              type: file.type
            };
          }
          
          console.log("[SERVER] Chapter encontrado, resources actuales:", chapter.resources);
          
          let existingResources: Array<{ url: string; name: string; type?: string; size?: number }> = [];
          if (chapter.resources) {
            if (Array.isArray(chapter.resources)) {
              existingResources = chapter.resources as Array<{ url: string; name: string; type?: string; size?: number }>;
            } else if (typeof chapter.resources === 'string') {
              try {
                existingResources = JSON.parse(chapter.resources) as Array<{ url: string; name: string; type?: string; size?: number }>;
              } catch (e) {
                console.error("[SERVER] Error parsing existing resources:", e);
              }
            }
          }
          
          console.log("[SERVER] Existing resources:", existingResources);
          
          const fileExists = existingResources.some(r => r.url === file.url);
          if (fileExists) {
            console.log("[SERVER] File already exists in database, skipping");
            return { 
              url: file.url, 
              name: file.name, 
              size: file.size,
              type: file.type
            };
          }
          
          const newResource = {
            url: file.url,
            name: file.name || file.url.split('/').pop() || `Documento_${Date.now()}`,
            type: file.type || 'file',
            size: file.size || 0,
          };
          
          const updatedResources = [...existingResources, newResource];
          
          console.log("[SERVER] Actualizando resources en BD:", updatedResources);
          
          await prisma.chapter.update({
            where: { id: chapterId, courseId: courseId },
            data: { resources: updatedResources },
          });
          
          console.log("[SERVER] File auto-saved to database successfully");
        } catch (error) {
          console.error("[SERVER] Error auto-saving file to database:", error);
        }
      } else {
        console.log("[SERVER] No courseId/chapterId in metadata, skipping auto-save");
        console.log("[SERVER] Metadata recibido:", metadata);
      }
      
      return { 
        url: file.url, 
        name: file.name, 
        size: file.size,
        type: file.type
      };
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
      console.log("[SERVER] Middleware ejecutado para chapterImages");
      console.log("[SERVER] Input recibido:", JSON.stringify(input, null, 2));
      
      // Verificar que las variables de entorno estén configuradas
      const hasToken = !!process.env.UPLOADTHING_TOKEN;
      const hasSecretAndAppId = !!process.env.UPLOADTHING_SECRET && !!process.env.UPLOADTHING_APP_ID;
      
      if (!hasToken && !hasSecretAndAppId) {
        throw new Error("Uploadthing no está configurado. Necesitas UPLOADTHING_TOKEN o UPLOADTHING_SECRET + UPLOADTHING_APP_ID");
      }
      
      const metadata = { courseId: input.courseId, chapterId: input.chapterId };
      console.log("[SERVER] Retornando metadata:", metadata);
      
      return metadata;
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("[SERVER] ===== onUploadComplete EJECUTADO (chapterImages) =====");
      console.log("[SERVER] File:", { url: file.url, name: file.name, size: file.size, type: file.type });
      console.log("[SERVER] Metadata:", JSON.stringify(metadata, null, 2));
      console.log("[SERVER] Metadata type:", typeof metadata);
      console.log("[SERVER] Metadata keys:", metadata ? Object.keys(metadata) : "null");
      
      // Guardar automáticamente en la BD (fallback si el callback del cliente no se ejecuta)
      if (metadata && typeof metadata === 'object' && 'courseId' in metadata && 'chapterId' in metadata) {
        try {
          const courseId = metadata.courseId as string;
          const chapterId = metadata.chapterId as string;
          
          console.log("[SERVER] Guardando imagen en BD:", { courseId, chapterId, fileUrl: file.url });
          
          const prisma = (await import("@/lib/prisma")).default;
          
          const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId, courseId: courseId },
            select: { resources: true },
          });
          
          if (!chapter) {
            console.error("[SERVER] Chapter not found:", { courseId, chapterId });
            return { url: file.url, name: file.name, size: file.size, type: file.type };
          }
          
          console.log("[SERVER] Chapter encontrado, resources actuales:", chapter.resources);
          
          let existingResources: Array<{ url: string; name: string; type?: string; size?: number }> = [];
          if (chapter.resources) {
            if (Array.isArray(chapter.resources)) {
              existingResources = chapter.resources as Array<{ url: string; name: string; type?: string; size?: number }>;
            } else if (typeof chapter.resources === 'string') {
              try {
                existingResources = JSON.parse(chapter.resources) as Array<{ url: string; name: string; type?: string; size?: number }>;
              } catch (e) {
                console.error("[SERVER] Error parsing existing resources:", e);
              }
            }
          }
          
          console.log("[SERVER] Existing resources:", existingResources);
          
          const fileExists = existingResources.some(r => r.url === file.url);
          if (fileExists) {
            console.log("[SERVER] Image already exists in database, skipping");
            return { url: file.url, name: file.name, size: file.size, type: file.type };
          }
          
          const newResource = {
            url: file.url,
            name: file.name || file.url.split('/').pop() || `Immagine_${Date.now()}`,
            type: file.type || 'image',
            size: file.size || 0,
          };
          
          const updatedResources = [...existingResources, newResource];
          
          console.log("[SERVER] Actualizando resources en BD:", updatedResources);
          
          await prisma.chapter.update({
            where: { id: chapterId, courseId: courseId },
            data: { resources: updatedResources },
          });
          
          console.log("[SERVER] Image auto-saved to database successfully");
        } catch (error) {
          console.error("[SERVER] Error auto-saving image to database:", error);
        }
      } else {
        console.log("[SERVER] No courseId/chapterId in metadata, skipping auto-save");
        console.log("[SERVER] Metadata recibido:", metadata);
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
