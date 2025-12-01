# 📤 Configurar Uploadthing para Carga de Imágenes

## ❌ Problema Actual

Las variables de entorno de Uploadthing no están configuradas, por lo que la carga de imágenes no funciona.

## ✅ Solución

### Paso 1: Crear cuenta en Uploadthing

1. Ve a https://uploadthing.com
2. Crea una cuenta (puedes usar GitHub para login rápido)
3. Una vez dentro del dashboard, crea una nueva aplicación

### Paso 2: Obtener las credenciales

1. En el dashboard de Uploadthing, ve a **Settings** o **API Keys**
2. Copia los siguientes valores:
   - **UPLOADTHING_SECRET**: Comienza con `sk_live_` o `sk_test_`
   - **UPLOADTHING_APP_ID**: Un identificador único de tu app

### Paso 3: Configurar variables de entorno localmente

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
UPLOADTHING_SECRET=sk_live_tu_secret_key_aqui
UPLOADTHING_APP_ID=tu_app_id_aqui
```

### Paso 4: Configurar variables en Vercel (Producción)

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Agrega:
   - **Key**: `UPLOADTHING_SECRET`
   - **Value**: Tu secret key de Uploadthing
   - **Ambientes**: Marca Production, Preview y Development
4. Agrega:
   - **Key**: `UPLOADTHING_APP_ID`
   - **Value**: Tu app ID de Uploadthing
   - **Ambientes**: Marca Production, Preview y Development
5. Haz un redeploy

### Paso 5: Reiniciar el servidor de desarrollo

Después de agregar las variables en `.env.local`:

```bash
# Detén el servidor (Ctrl+C) y reinícialo
npm run dev
```

## 🔍 Verificar que funciona

1. Intenta subir una imagen en la configuración del curso
2. Deberías ver en la consola del navegador:
   - "Upload begin: [nombre del archivo]"
   - "Upload complete response: [objeto con URL]"
   - "Image URL: [URL de la imagen]"
3. La imagen debería actualizarse automáticamente

## ⚠️ Nota

Si no quieres usar Uploadthing, puedes:
- Usar otro servicio de almacenamiento (Cloudinary, AWS S3, etc.)
- Almacenar imágenes localmente (solo para desarrollo)
- Usar un servicio de hosting de imágenes gratuito

Pero necesitarás modificar el código para usar ese servicio en lugar de Uploadthing.

