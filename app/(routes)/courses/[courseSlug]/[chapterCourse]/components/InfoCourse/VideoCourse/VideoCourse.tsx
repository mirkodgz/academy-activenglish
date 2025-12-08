"use client";

import { VideoCourseProps } from "./VideoCourse.types";

// Función para convertir URL de YouTube a formato embed
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Patrones comunes de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

// Función para verificar si es una URL de YouTube
function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

// Función para verificar si es una URL de Vimeo
function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/.test(url);
}

// Función para obtener URL de embed de Vimeo
function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  
  return null;
}

// Función para verificar si es una URL de Cloudinary Player
function isCloudinaryPlayerUrl(url: string): boolean {
  return /player\.cloudinary\.com/.test(url);
}

// Función para verificar si es una URL de Cloudflare Stream
function isCloudflareStreamUrl(url: string): boolean {
  return /cloudflarestream\.com|cloudflarestre\.com/.test(url);
}

// Función para obtener URL de embed de Cloudflare Stream
function getCloudflareStreamEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Si ya es una URL de iframe de Cloudflare Stream, devolverla tal cual
  if (url.includes('/iframe')) {
    return url;
  }
  
  // Si es una URL HLS o DASH, extraer el Video ID y construir URL de iframe
  // Formato HLS: https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/manifest/video.m3u8
  // Formato DASH: https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/manifest/video.mpd
  // Formato iframe: https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/iframe
  
  // Extraer el dominio base y el customer code
  const domainMatch = url.match(/(https?:\/\/customer-([^.]+)\.cloudflare[^\/]+)/);
  if (domainMatch) {
    const customerCode = domainMatch[2];
    
    // Extraer el Video ID (está después del dominio y antes de /manifest o /iframe)
    const videoIdMatch = url.match(/cloudflare[^\/]+\/([^\/]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      return `https://customer-${customerCode}.cloudflarestream.com/${videoId}/iframe`;
    }
  }
  
  // Fallback: intentar extraer directamente del patrón común
  const fallbackMatch = url.match(/(https?:\/\/[^\/]+)\/([^\/]+)/);
  if (fallbackMatch) {
    const baseUrl = fallbackMatch[1].replace(/\/manifest\/.*$/, '');
    const videoId = fallbackMatch[2];
    return `${baseUrl}/${videoId}/iframe`;
  }
  
  return null;
}

// Función para verificar si es una URL HLS/DASH de Cloudflare Stream
function isCloudflareStreamManifestUrl(url: string): boolean {
  return /cloudflarestream\.com.*\/manifest\/(video\.m3u8|video\.mpd)/.test(url) || 
         /cloudflarestre\.com.*\/manifest\/(video\.m3u8|video\.mpd)/.test(url);
}

export function VideoCourse(props: VideoCourseProps) {
  const { videoUrl } = props;

  if (!videoUrl) {
    return null;
  }

  // Si es YouTube, usar iframe
  if (isYouTubeUrl(videoUrl)) {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    if (embedUrl) {
      return (
        <div className="w-full rounded-md shadow-md overflow-hidden bg-black">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video del curso"
            />
          </div>
        </div>
      );
    }
  }

  // Si es Vimeo, usar iframe
  if (isVimeoUrl(videoUrl)) {
    const embedUrl = getVimeoEmbedUrl(videoUrl);
    if (embedUrl) {
      return (
        <div className="w-full rounded-md shadow-md overflow-hidden bg-black">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Video del curso"
            />
          </div>
        </div>
      );
    }
  }

  // Si es Cloudinary Player, usar iframe
  if (isCloudinaryPlayerUrl(videoUrl)) {
    return (
      <div className="w-full rounded-md shadow-md overflow-hidden bg-black">
        <div className="relative pb-[56.25%] h-0">
          <iframe
            src={videoUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Video del curso"
          />
        </div>
      </div>
    );
  }

  // Si es Cloudflare Stream, usar iframe embed
  if (isCloudflareStreamUrl(videoUrl)) {
    const embedUrl = getCloudflareStreamEmbedUrl(videoUrl);
    if (embedUrl) {
      return (
        <div className="w-full rounded-md shadow-md overflow-hidden bg-black">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video del curso"
            />
          </div>
        </div>
      );
    }
    
    // Si es una URL HLS/DASH manifest, usar reproductor HTML5 con soporte HLS
    if (isCloudflareStreamManifestUrl(videoUrl)) {
      return (
        <div className="w-full rounded-md shadow-md overflow-hidden bg-black">
          <video
            src={videoUrl}
            controls
            className="w-full h-auto"
            style={{ maxHeight: "600px" }}
            crossOrigin="anonymous"
          >
            <source src={videoUrl} type={videoUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'application/dash+xml'} />
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      );
    }
  }

  // Si es una URL directa de video, usar tag video
  return (
    <div className="w-full rounded-md shadow-md overflow-hidden bg-black">
      <video
        src={videoUrl}
        controls
        className="w-full h-auto"
        style={{ maxHeight: "600px" }}
      />
    </div>
  );
}
