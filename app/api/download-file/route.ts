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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const filename = searchParams.get("filename");

    if (!fileUrl) {
      return new NextResponse("URL no proporcionada", { status: 400 });
    }

    // Detectar si es una URL de Cloudinary
    const isCloudinary = fileUrl.includes("cloudinary.com") || fileUrl.includes("res.cloudinary.com");

    if (!isCloudinary) {
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

    // Es Cloudinary - seguir el patrón que funciona
    
    // Paso 1: Detección del tipo de archivo
    const hasRawPath = fileUrl.includes("/raw/upload/");
    const hasImagePath = fileUrl.includes("/image/upload/");
    const isImageExtension = filename ? filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) : null;
    const isRawFile = isCloudinary && (hasRawPath || (hasImagePath && !isImageExtension));

    console.log(`[DOWNLOAD-FILE] URL original: ${fileUrl}`);
    console.log(`[DOWNLOAD-FILE] Filename: ${filename}`);
    console.log(`[DOWNLOAD-FILE] hasRawPath: ${hasRawPath}`);
    console.log(`[DOWNLOAD-FILE] hasImagePath: ${hasImagePath}`);
    console.log(`[DOWNLOAD-FILE] isImageExtension: ${!!isImageExtension}`);
    console.log(`[DOWNLOAD-FILE] isRawFile: ${isRawFile}`);

    // Extraer public_id de la URL
    const urlParts = fileUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");
    
    if (uploadIndex === -1) {
      return new NextResponse("URL de Cloudinary inválida", { status: 400 });
    }

    const versionIndex = uploadIndex + 1;
    const version = urlParts[versionIndex];
    // La versión viene como "v1765156956", mantenerla así para cloudinary.url()
    // cloudinary.url() espera la versión con 'v' o sin ella, pero debemos pasarla explícitamente
    const versionNumber = version && version.startsWith("v") ? version.substring(1) : version;
    const publicIdParts = urlParts.slice(versionIndex + 1);
    const publicId = publicIdParts.join("/");

    console.log(`[DOWNLOAD-FILE] Public ID: ${publicId}`);
    console.log(`[DOWNLOAD-FILE] Version original: ${version}`);
    console.log(`[DOWNLOAD-FILE] Version number: ${versionNumber}`);

    // Paso 2: Estrategias para archivos raw (PDFs)
    if (isRawFile) {
      // ESTRATEGIA 1: Intentar con URL original directa (sin firmar) primero
      if (hasRawPath) {
        console.log(`[DOWNLOAD-FILE] Estrategia 1: Intentar URL original directa (sin firmar)`);
        try {
          const response = await fetch(fileUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*',
            },
          });

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (buffer.length === 0) {
              throw new Error("Buffer vacío recibido de Cloudinary");
            }

            console.log(`[DOWNLOAD-FILE] Estrategia 1 funcionó! Tamaño: ${buffer.length} bytes`);

            const extension = filename ? filename.toLowerCase().split('.').pop() : '';
            let contentType = 'application/octet-stream';
            if (extension === 'pdf') {
              contentType = 'application/pdf';
            } else if (extension === 'doc' || extension === 'docx') {
              contentType = 'application/msword';
            } else if (extension === 'xls' || extension === 'xlsx') {
              contentType = 'application/vnd.ms-excel';
            }

            const headers = new Headers();
            headers.set("Content-Type", contentType);
            headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"`);
            headers.set("Content-Length", buffer.length.toString());
            headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

            return new NextResponse(buffer, { headers });
          }

          console.log(`[DOWNLOAD-FILE] Estrategia 1 falló: ${response.status}`);
        } catch (error) {
          console.log(`[DOWNLOAD-FILE] Estrategia 1 error: ${error}`);
        }
      }

      // ESTRATEGIA 2: Si está en /raw/upload/ - URL firmada con resource_type: 'raw'
      if (hasRawPath) {
        console.log(`[DOWNLOAD-FILE] Estrategia 2: Archivo en /raw/upload/ - URL firmada con resource_type: 'raw'`);
        try {
          // Generar URL firmada con resource_type: 'raw' explícitamente
          const signedUrl = cloudinary.url(publicId, {
            resource_type: 'raw',
            secure: true,
            version: versionNumber, // Pasar la versión numérica explícitamente
            sign_url: true,
          });

          console.log(`[DOWNLOAD-FILE] URL firmada generada: ${signedUrl}`);

          const response = await fetch(signedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*',
            },
          });

          if (response.ok) {
            // Convertir a Buffer y validar
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (buffer.length === 0) {
              throw new Error("Buffer vacío recibido de Cloudinary");
            }

            console.log(`[DOWNLOAD-FILE] Estrategia 2 funcionó! Tamaño: ${buffer.length} bytes`);

            // Determinar Content-Type según extensión
            const extension = filename ? filename.toLowerCase().split('.').pop() : '';
            let contentType = 'application/octet-stream';
            if (extension === 'pdf') {
              contentType = 'application/pdf';
            } else if (extension === 'doc' || extension === 'docx') {
              contentType = 'application/msword';
            } else if (extension === 'xls' || extension === 'xlsx') {
              contentType = 'application/vnd.ms-excel';
            }

            const headers = new Headers();
            headers.set("Content-Type", contentType);
            headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"`);
            headers.set("Content-Length", buffer.length.toString());
            headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

            return new NextResponse(buffer, { headers });
          }

          console.log(`[DOWNLOAD-FILE] Estrategia 2 falló: ${response.status}`);
          if (response.status === 401 || response.status === 403) {
            const errorText = await response.text();
            console.log(`[DOWNLOAD-FILE] Error details: ${errorText.substring(0, 200)}`);
          }
        } catch (error) {
          console.log(`[DOWNLOAD-FILE] Estrategia 2 error: ${error}`);
        }
      }

      // ESTRATEGIA 3: Si está en /image/upload/ (archivos subidos con 'auto')
      if (hasImagePath && !isImageExtension) {
        console.log(`[DOWNLOAD-FILE] Estrategia 3: Archivo en /image/upload/ pero es raw - Intentar como 'raw'`);
        try {
          // Intentar primero como 'raw' (aunque esté en /image/upload/)
          const signedUrl = cloudinary.url(publicId, {
            resource_type: 'raw',
            secure: true,
            version: versionNumber, // Pasar la versión numérica explícitamente
            sign_url: true,
          });

          console.log(`[DOWNLOAD-FILE] URL firmada generada (raw): ${signedUrl}`);

          let response = await fetch(signedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*',
            },
          });

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (buffer.length === 0) {
              throw new Error("Buffer vacío recibido de Cloudinary");
            }

            console.log(`[DOWNLOAD-FILE] Estrategia 3 funcionó! Tamaño: ${buffer.length} bytes`);

            const extension = filename ? filename.toLowerCase().split('.').pop() : '';
            let contentType = 'application/octet-stream';
            if (extension === 'pdf') {
              contentType = 'application/pdf';
            } else if (extension === 'doc' || extension === 'docx') {
              contentType = 'application/msword';
            } else if (extension === 'xls' || extension === 'xlsx') {
              contentType = 'application/vnd.ms-excel';
            }

            const headers = new Headers();
            headers.set("Content-Type", contentType);
            headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"`);
            headers.set("Content-Length", buffer.length.toString());
            headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

            return new NextResponse(buffer, { headers });
          }

          console.log(`[DOWNLOAD-FILE] Estrategia 3 (raw) falló: ${response.status}, intentando como 'image'`);

          // Si falla como 'raw', intentar como 'image' (fallback)
          const signedUrlImage = cloudinary.url(publicId, {
            resource_type: 'image',
            secure: true,
            version: versionNumber, // Pasar la versión numérica explícitamente
            sign_url: true,
          });

          response = await fetch(signedUrlImage, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*',
            },
          });

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (buffer.length === 0) {
              throw new Error("Buffer vacío recibido de Cloudinary");
            }

            console.log(`[DOWNLOAD-FILE] Estrategia 3 (image fallback) funcionó! Tamaño: ${buffer.length} bytes`);

            const extension = filename ? filename.toLowerCase().split('.').pop() : '';
            let contentType = 'application/octet-stream';
            if (extension === 'pdf') {
              contentType = 'application/pdf';
            }

            const headers = new Headers();
            headers.set("Content-Type", contentType);
            headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"`);
            headers.set("Content-Length", buffer.length.toString());
            headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

            return new NextResponse(buffer, { headers });
          }

          console.log(`[DOWNLOAD-FILE] Estrategia 3 (image fallback) falló: ${response.status}`);
        } catch (error) {
          console.log(`[DOWNLOAD-FILE] Estrategia 3 error: ${error}`);
        }
      }
    } else {
      // Para imágenes, intentar descarga directa
      console.log(`[DOWNLOAD-FILE] Archivo es imagen - Intentar descarga directa`);
      try {
        const response = await fetch(fileUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
          },
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          if (buffer.length === 0) {
            throw new Error("Buffer vacío recibido");
          }

          const headers = new Headers();
          headers.set("Content-Type", response.headers.get("Content-Type") || "image/jpeg");
          headers.set("Content-Disposition", `attachment; filename="${filename || 'file'}"`);
          headers.set("Content-Length", buffer.length.toString());
          headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

          return new NextResponse(buffer, { headers });
        }
      } catch (error) {
        console.log(`[DOWNLOAD-FILE] Error descargando imagen: ${error}`);
      }
    }

    // ESTRATEGIA FINAL: Si todas fallan, devolver URL firmada para descarga directa desde el frontend
    // Esto evita problemas de CORS o bloqueos del servidor
    if (isRawFile) {
      console.log(`[DOWNLOAD-FILE] Estrategia Final: Generar URL firmada para descarga directa desde navegador`);
      try {
        const signedUrl = cloudinary.url(publicId, {
          resource_type: hasRawPath ? 'raw' : 'image',
          secure: true,
          version: versionNumber,
          sign_url: true,
        });

        console.log(`[DOWNLOAD-FILE] URL firmada para frontend: ${signedUrl}`);
        
        // Devolver JSON con la URL firmada para que el frontend la use directamente
        return NextResponse.json({
          directUrl: signedUrl,
          filename: filename || 'download',
          useDirect: true,
          signed: true,
          message: "Usar URL firmada de Cloudinary para descarga directa desde el navegador"
        }, { status: 200 });
      } catch (error) {
        console.log(`[DOWNLOAD-FILE] Error generando URL firmada: ${error}`);
      }
    }

    // Si todas las estrategias fallan
    console.log(`[DOWNLOAD-FILE] Todas las estrategias fallaron`);
    return new NextResponse("Error al descargar el archivo desde Cloudinary", { status: 500 });
  } catch (error) {
    console.error("Error en download-file:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
