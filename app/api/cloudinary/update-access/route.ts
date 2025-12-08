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
    const { publicId, resourceType = 'raw' } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID no proporcionado" },
        { status: 400 }
      );
    }

    console.log(`[UPDATE-ACCESS] Actualizando access_mode para: ${publicId}`);

    // Actualizar el access_mode a 'public' usando explicit()
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.explicit(
        publicId,
        {
          type: 'upload',
          resource_type: resourceType as 'image' | 'video' | 'raw',
          access_mode: 'public',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    console.log(`[UPDATE-ACCESS] Access_mode actualizado exitosamente`);

    return NextResponse.json({
      success: true,
      message: "Access mode actualizado a público",
      result,
    });
  } catch (error: unknown) {
    console.error("[UPDATE-ACCESS] Error:", error);
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? (error as { message?: string }).message
      : undefined;
    return NextResponse.json(
      { error: errorMessage || "Error al actualizar el access mode" },
      { status: 500 }
    );
  }
}

