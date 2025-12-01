import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  cloudinary.config();
} else {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfm9igqy1";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado correctamente. Verifica las variables de entorno.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "image", "video", "document"

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file fornito" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!type || !["image", "video", "document"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo di file non valido" },
        { status: 400 }
      );
    }

    // Convertir File a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convertir buffer a base64
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Determinar resource_type y folder según el tipo
    let resourceType: "image" | "video" | "raw" = "image";
    let folder = "activenglish/chapters";

    if (type === "video") {
      resourceType = "video";
      folder = "activenglish/chapters/videos";
    } else if (type === "document") {
      resourceType = "raw"; // Para documentos PDF, DOC, etc.
      folder = "activenglish/chapters/documents";
    } else {
      folder = "activenglish/chapters/images";
    }

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: folder,
          resource_type: resourceType,
          // Para documentos, mantener el formato original
          ...(type === "document" && { format: "auto" }),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    interface CloudinaryResult {
      secure_url: string;
      public_id: string;
    }
    
    return NextResponse.json({
      url: (result as CloudinaryResult).secure_url,
      public_id: (result as CloudinaryResult).public_id,
    });
  } catch (error: unknown) {
    console.error("Error uploading to Cloudinary:", error);
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? (error as { message?: string }).message
      : undefined;
    return NextResponse.json(
      { error: errorMessage || "Errore durante il caricamento del file" },
      { status: 500 }
    );
  }
}

