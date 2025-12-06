import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
// Cloudinary detecta automáticamente CLOUDINARY_URL si está configurada
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  console.log("Usando CLOUDINARY_URL para configuración");
  // Si CLOUDINARY_URL está configurada, Cloudinary la detecta automáticamente
  cloudinary.config();
} else {
  console.log("CLOUDINARY_URL no encontrada, usando variables individuales");
  // Fallback a variables individuales
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfm9igqy1";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error("Faltan CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET");
    throw new Error("Cloudinary no está configurado correctamente. Verifica las variables de entorno.");
  }

  console.log(`Configurando Cloudinary con cloud_name: ${cloudName}, api_key: ${apiKey.substring(0, 5)}...`);
  
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

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file fornito" },
        { status: 400 }
      );
    }

    // Convertir File a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convertir buffer a base64
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: "activenglish/courses",
          resource_type: "image",
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
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento dell'immagine" },
      { status: 500 }
    );
  }
}

