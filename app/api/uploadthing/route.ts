import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  
  // Configuración opcional para desarrollo local
  config: {
    // En desarrollo local, UploadThing necesita poder alcanzar el servidor
    // Si estás usando un túnel (ngrok, etc.), configura la URL aquí
    // callbackUrl: process.env.UPLOADTHING_CALLBACK_URL,
  },
});
