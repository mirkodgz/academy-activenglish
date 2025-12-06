import { createUploadthing, type FileRouter } from "uploadthing/next";

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
      if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID) {
        throw new Error("Uploadthing no está configurado. Faltan UPLOADTHING_SECRET o UPLOADTHING_APP_ID");
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
    .middleware(async () => {
      console.log("🔐 Middleware ejecutado para chapterDocument");
      // Verificar que las variables de entorno estén configuradas
      if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID) {
        console.error("❌ Uploadthing no está configurado. Faltan variables de entorno");
        throw new Error("Uploadthing no está configurado. Faltan UPLOADTHING_SECRET o UPLOADTHING_APP_ID");
      }
      console.log("✅ Variables de entorno de UploadThing configuradas correctamente");
      return {};
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("✅ Document uploaded successfully to UploadThing:", {
        url: file.url,
        name: file.name,
        size: file.size,
        key: file.key,
        type: file.type,
        metadata,
      });
      
      // Retornar los datos que el cliente espera
      const result = { 
        url: file.url, 
        name: file.name, 
        size: file.size 
      };
      
      console.log("📤 Returning to client:", result);
      return result;
    }),
  chapterImages: f({
    image: { maxFileCount: 10, maxFileSize: "4MB" },
  })
    .middleware(async () => {
      // Verificar que las variables de entorno estén configuradas
      if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID) {
        throw new Error("Uploadthing no está configurado. Faltan UPLOADTHING_SECRET o UPLOADTHING_APP_ID");
      }
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("✅ Image uploaded successfully:", {
        url: file.url,
        name: file.name,
        size: file.size,
        key: file.key,
      });
      return { url: file.url, name: file.name, size: file.size };
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
