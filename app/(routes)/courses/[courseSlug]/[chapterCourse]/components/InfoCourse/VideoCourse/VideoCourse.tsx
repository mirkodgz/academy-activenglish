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
