# ☁️ Configurar Cloudinary para Carga de Imágenes

## ✅ Variables de Entorno Necesarias

Para que Cloudinary funcione correctamente, puedes usar **una de estas dos opciones**:

### Opción 1: CLOUDINARY_URL (Recomendado - Más Simple)

```env
# Formato: cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_URL=cloudinary://Ws72SpVfkyblxUct4OCxizko8Ac:tu_api_secret@dfm9igqy1
```

### Opción 2: Variables Individuales

```env
# Cloudinary Cloud Name (público - puede estar en NEXT_PUBLIC_)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dfm9igqy1

# Cloudinary API Key
CLOUDINARY_API_KEY=Ws72SpVfkyblxUct4OCxizko8Ac

# Cloudinary API Secret (PRIVADO - solo en servidor)
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

**Recomendación:** Usa `CLOUDINARY_URL` porque es más simple y Cloudinary la detecta automáticamente.

## 📝 Configuración Local

1. Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
# Opción 1: Usar CLOUDINARY_URL (recomendado)
CLOUDINARY_URL=cloudinary://Ws72SpVfkyblxUct4OCxizko8Ac:tu_api_secret@dfm9igqy1

# O Opción 2: Variables individuales
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dfm9igqy1
# CLOUDINARY_API_KEY=Ws72SpVfkyblxUct4OCxizko8Ac
# CLOUDINARY_API_SECRET=tu_api_secret_de_cloudinary
```

2. **Obtener el API Secret:**
   - Ve a tu dashboard de Cloudinary: https://console.cloudinary.com
   - Ve a **Settings** → **Security** (o **Account Details**)
   - Copia el **API Secret** (no lo compartas públicamente)
   - Reemplaza `tu_api_secret` en la URL con tu API Secret real

3. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

## 🚀 Configuración en Vercel (Producción)

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Agrega la variable `CLOUDINARY_URL`:

   - **Key**: `CLOUDINARY_URL`
   - **Value**: `cloudinary://Ws72SpVfkyblxUct4OCxizko8Ac:tu_api_secret@dfm9igqy1`
     - Reemplaza `tu_api_secret` con tu API Secret real de Cloudinary
   - **Ambientes**: Production, Preview, Development

   **O si prefieres usar variables individuales:**
   
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = `dfm9igqy1`
   - `CLOUDINARY_API_KEY` = `Ws72SpVfkyblxUct4OCxizko8Ac`
   - `CLOUDINARY_API_SECRET` = Tu API Secret

4. Haz un redeploy

## ⚠️ Nota Importante

- El `CLOUDINARY_API_SECRET` es **sensible** y debe mantenerse privado
- No lo subas a GitHub ni lo compartas públicamente
- Solo debe estar en `.env.local` (local) y en las variables de entorno de Vercel (producción)

## 🔍 Verificar que funciona

1. Intenta subir una imagen en la configuración del curso
2. Deberías ver:
   - Un indicador de carga mientras se sube
   - Un mensaje de éxito: "Immagine aggiornata correttamente 🎉"
   - La imagen debería actualizarse automáticamente

## 🆘 Si no tienes el API Secret

Si no tienes el API Secret de Cloudinary, puedes:
1. Obtenerlo desde tu dashboard de Cloudinary
2. O usar el widget de Cloudinary (requiere cambios en el código)

