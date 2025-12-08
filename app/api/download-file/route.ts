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
        headers.set("Content-Disposition", `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
      }

      return new NextResponse(blob, { headers });
    }

    // Es Cloudinary - ESTRATEGIA MULTIPLE: Probar todas las soluciones posibles
    
    // Extraer componentes de la URL
    const urlParts = fileUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");
    
    if (uploadIndex === -1) {
      return new NextResponse("URL de Cloudinary inválida", { status: 400 });
    }

    const versionIndex = uploadIndex + 1;
    const version = urlParts[versionIndex];
    const publicIdParts = urlParts.slice(versionIndex + 1);
    const publicId = publicIdParts.join("/");
    
    const cloudNameMatch = fileUrl.match(/res\.cloudinary\.com\/([^\/]+)/);
    const cloudName = cloudNameMatch ? cloudNameMatch[1] : "dfm9igqy1";
    
    const isRaw = fileUrl.includes("/raw/upload/");
    const isImage = fileUrl.includes("/image/upload/");
    const isVideo = fileUrl.includes("/video/upload/");
    
    let resourceType: "image" | "raw" | "video" = "image";
    if (isRaw) {
      resourceType = "raw";
    } else if (isVideo) {
      resourceType = "video";
    } else if (isImage && filename) {
      const extension = filename.toLowerCase().split(".").pop() || "";
      const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      if (!imageExtensions.includes(extension)) {
        resourceType = "raw";
      }
    }

    console.log(`[DOWNLOAD-FILE] URL original: ${fileUrl}`);
    console.log(`[DOWNLOAD-FILE] Public ID: ${publicId}`);
    console.log(`[DOWNLOAD-FILE] Resource Type: ${resourceType}`);
    console.log(`[DOWNLOAD-FILE] Filename: ${filename}`);

    // ESTRATEGIA 1: Intentar con URL original directa
    console.log(`[DOWNLOAD-FILE] 🔄 Estrategia 1: URL original directa`);
    let response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
    });
    
    if (response.ok) {
      console.log(`[DOWNLOAD-FILE] ✅ Estrategia 1 funcionó!`);
      const blob = await response.blob();
      const headers = new Headers();
      headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
      headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"; filename*=UTF-8''${encodeURIComponent(filename || 'file')}`);
      headers.set("Content-Length", blob.size.toString());
      return new NextResponse(blob, { headers });
    }
    
    console.log(`[DOWNLOAD-FILE] ❌ Estrategia 1 falló: ${response.status}`);

    // ESTRATEGIA 2: URL con fl_attachment (sin nombre)
    console.log(`[DOWNLOAD-FILE] 🔄 Estrategia 2: URL con fl_attachment`);
    const urlWithAttachment = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/fl_attachment/${version}/${publicId}`;
    response = await fetch(urlWithAttachment, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
    });
    
    if (response.ok) {
      console.log(`[DOWNLOAD-FILE] ✅ Estrategia 2 funcionó!`);
      const blob = await response.blob();
      const headers = new Headers();
      headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
      headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"; filename*=UTF-8''${encodeURIComponent(filename || 'file')}`);
      headers.set("Content-Length", blob.size.toString());
      return new NextResponse(blob, { headers });
    }
    
    console.log(`[DOWNLOAD-FILE] ❌ Estrategia 2 falló: ${response.status}`);

    // ESTRATEGIA 3: URL firmada con cloudinary.url() sin attachment
    console.log(`[DOWNLOAD-FILE] 🔄 Estrategia 3: URL firmada sin attachment`);
    try {
      const signedUrl = cloudinary.url(publicId, {
        resource_type: resourceType,
        secure: true,
        version: version,
        sign_url: true,
      });
      
      response = await fetch(signedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
        },
      });
      
      if (response.ok) {
        console.log(`[DOWNLOAD-FILE] ✅ Estrategia 3 funcionó!`);
        const blob = await response.blob();
        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
        headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"; filename*=UTF-8''${encodeURIComponent(filename || 'file')}`);
        headers.set("Content-Length", blob.size.toString());
        return new NextResponse(blob, { headers });
      }
      
      console.log(`[DOWNLOAD-FILE] ❌ Estrategia 3 falló: ${response.status}`);
    } catch (error) {
      console.log(`[DOWNLOAD-FILE] ❌ Estrategia 3 error: ${error}`);
    }

    // ESTRATEGIA 4: URL firmada con cloudinary.url() con attachment: true
    console.log(`[DOWNLOAD-FILE] 🔄 Estrategia 4: URL firmada con attachment: true`);
    try {
      const signedUrlWithAttachment = cloudinary.url(publicId, {
        resource_type: resourceType,
        secure: true,
        version: version,
        sign_url: true,
        attachment: true,
      });
      
      response = await fetch(signedUrlWithAttachment, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
        },
      });
      
      if (response.ok) {
        console.log(`[DOWNLOAD-FILE] ✅ Estrategia 4 funcionó!`);
        const blob = await response.blob();
        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
        headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"; filename*=UTF-8''${encodeURIComponent(filename || 'file')}`);
        headers.set("Content-Length", blob.size.toString());
        return new NextResponse(blob, { headers });
      }
      
      console.log(`[DOWNLOAD-FILE] ❌ Estrategia 4 falló: ${response.status}`);
    } catch (error) {
      console.log(`[DOWNLOAD-FILE] ❌ Estrategia 4 error: ${error}`);
    }

    // ESTRATEGIA 5: Si todas fallan, devolver la URL original para uso directo
    // El frontend usará esta URL directamente con el atributo download
    console.log(`[DOWNLOAD-FILE] 🔄 Estrategia 5: Devolver URL para uso directo`);
    console.log(`[DOWNLOAD-FILE] ⚠️ Todas las estrategias fallaron. Cloudinary puede estar bloqueando acceso desde servidor.`);
    console.log(`[DOWNLOAD-FILE] 💡 Solución: Usar URL directa de Cloudinary en el frontend`);
    
    // Devolver JSON con la URL para que el frontend la use directamente
    return NextResponse.json({
      directUrl: fileUrl,
      filename: filename || 'download',
      useDirect: true,
      message: "Usar URL directa de Cloudinary - el servidor no puede acceder al archivo"
    }, { status: 200 });
  } catch (error) {
    console.error("Error en download-file:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}

