import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  cloudinary.config();
} else {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dskliu1ig";
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
    let folder = "activeacademy/chapters";
    const fileName = file.name;

    if (type === "video") {
      resourceType = "video";
      folder = "activeacademy/chapters/videos";
    } else if (type === "document") {
      resourceType = "raw"; // Para documentos PDF, DOC, etc.
      folder = "activeacademy/chapters/documents";
    } else {
      folder = "activeacademy/chapters/images";
    }

    // Configuración de upload según el tipo
    const uploadOptions: {
      folder: string;
      resource_type: "image" | "video" | "raw";
      use_filename?: boolean;
      unique_filename?: boolean;
      filename_override?: string;
      format?: string;
      access_mode?: string;
      type?: string;
      invalidate?: boolean;
    } = {
      folder: folder,
      resource_type: resourceType,
      access_mode: 'public',
      type: 'upload', // Tipo explícito de upload
      invalidate: false, // No invalidar caché
    };

    // Para documentos, mantener el nombre original y formato
    if (type === "document") {
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = false;
      uploadOptions.filename_override = fileName;
      // No especificar format para documentos raw, Cloudinary lo detecta automáticamente
    }

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    interface CloudinaryResult {
      secure_url: string;
      public_id: string;
      format?: string;
      original_filename?: string;
    }
    
    const cloudinaryResult = result as CloudinaryResult;
    
    // Verificar que el archivo se subió correctamente y actualizar access_mode si es necesario
    // A veces Cloudinary ignora access_mode durante upload, así que lo actualizamos explícitamente
    if (type === "document") {
      try {
        console.log(`[UPLOAD-CHAPTER] Actualizando access_mode a público para: ${cloudinaryResult.public_id}`);
        await new Promise((resolve) => {
          cloudinary.uploader.explicit(
            cloudinaryResult.public_id,
            {
              type: 'upload',
              resource_type: 'raw',
              access_mode: 'public',
            },
            (error, result) => {
              if (error) {
                console.error(`[UPLOAD-CHAPTER] Error actualizando access_mode:`, error);
                // No rechazar, solo loggear el error y resolver
                resolve(result);
              } else {
                console.log(`[UPLOAD-CHAPTER] Access_mode actualizado exitosamente`);
                resolve(result);
              }
            }
          );
        });
      } catch (error) {
        console.error(`[UPLOAD-CHAPTER] Error al actualizar access_mode (no crítico):`, error);
        // Continuar aunque falle, el archivo ya está subido
      }
    }
    
    // Para documentos, usar la URL normal de Cloudinary
    // La descarga se manejará en el frontend con el atributo download del enlace
    // O usando un endpoint proxy si es necesario
    const downloadUrl = cloudinaryResult.secure_url;
    
    return NextResponse.json({
      url: downloadUrl,
      public_id: cloudinaryResult.public_id,
      original_filename: cloudinaryResult.original_filename || fileName,
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

