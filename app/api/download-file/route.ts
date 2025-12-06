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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const filename = searchParams.get("filename");

    if (!fileUrl) {
      return new NextResponse("URL no proporcionada", { status: 400 });
    }

    // Detectar si es una URL de Cloudinary
    if (!fileUrl.includes("res.cloudinary.com")) {
      // Si no es Cloudinary, hacer fetch normal y redirigir
      const response = await fetch(fileUrl);
      if (!response.ok) {
        return new NextResponse("Error al obtener el archivo", { status: 500 });
      }

      const blob = await response.blob();
      const headers = new Headers();
      headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
      if (filename) {
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
      }

      return new NextResponse(blob, { headers });
    }

    // Es Cloudinary - detectar si es raw
    const isRaw = fileUrl.includes("/raw/upload/");
    const isImage = fileUrl.includes("/image/upload/");
    
    // Si está en /image/upload/ pero la extensión no es imagen, puede ser raw
    let resourceType: "image" | "raw" | "video" = "image";
    if (isRaw) {
      resourceType = "raw";
    } else if (isImage && filename) {
      const extension = filename.toLowerCase().split(".").pop() || "";
      const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      if (!imageExtensions.includes(extension)) {
        // No es imagen, intentar como raw primero
        resourceType = "raw";
      }
    }

    // Extraer public_id de la URL de Cloudinary
    // Formato: https://res.cloudinary.com/cloud_name/resource_type/upload/v1234567890/folder/public_id
    const urlParts = fileUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");
    
    if (uploadIndex === -1) {
      return new NextResponse("URL de Cloudinary inválida", { status: 400 });
    }

    // El public_id es todo después de "upload/v1234567890/"
    const versionIndex = uploadIndex + 1;
    const publicIdParts = urlParts.slice(versionIndex + 1);
    const publicId = publicIdParts.join("/");

    // Generar URL firmada con el resource_type correcto
    let downloadUrl: string;
    
    try {
      // Construir la URL base - usar attachment: true para forzar descarga
      downloadUrl = cloudinary.url(publicId, {
        resource_type: resourceType,
        secure: true,
        sign_url: true,
        attachment: true, // Fuerza la descarga (no visualización)
      });
    } catch (error) {
      // Si falla con raw, intentar con image (compatibilidad con archivos subidos con 'auto')
      if (resourceType === "raw") {
        try {
          downloadUrl = cloudinary.url(publicId, {
            resource_type: "image",
            secure: true,
            sign_url: true,
            attachment: true,
          });
        } catch (imageError) {
          console.error("Error generando URL firmada:", imageError);
          return new NextResponse("Error al generar URL de descarga", { status: 500 });
        }
      } else {
        console.error("Error generando URL firmada:", error);
        return new NextResponse("Error al generar URL de descarga", { status: 500 });
      }
    }

    // Hacer fetch del archivo desde Cloudinary
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return new NextResponse("Error al obtener el archivo desde Cloudinary", { status: 500 });
    }

    // Obtener el blob del archivo
    const blob = await response.blob();
    
    // Determinar el Content-Type basado en la extensión del archivo
    let contentType = response.headers.get("Content-Type") || "application/octet-stream";
    if (filename) {
      const extension = filename.toLowerCase().split(".").pop() || "";
      const mimeTypes: Record<string, string> = {
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
      };
      if (mimeTypes[extension]) {
        contentType = mimeTypes[extension];
      }
    }

    // Crear headers con Content-Disposition para forzar el nombre del archivo
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"; filename*=UTF-8''${encodeURIComponent(filename || 'file')}`);
    headers.set("Content-Length", blob.size.toString());

    // Devolver el archivo con los headers correctos
    return new NextResponse(blob, { headers });
  } catch (error) {
    console.error("Error en download-file:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}

