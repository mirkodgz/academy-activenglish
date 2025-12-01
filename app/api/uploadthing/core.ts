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
    pdf: { maxFileCount: 1, maxFileSize: "16MB" },
    blob: { maxFileCount: 1, maxFileSize: "16MB" },
  }).onUploadComplete(({ file }) => {
    return { url: file.url };
  }),
  chapterImage: f({
    image: { maxFileCount: 1, maxFileSize: "4MB" },
  }).onUploadComplete(({ file }) => {
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
