# 🔧 Solución: Archivos no se guardan en UploadThing

## 🔍 Diagnóstico

Si los archivos no se están guardando en UploadThing, puede ser por varias razones:

### 1. Variables de Entorno no Configuradas

**Verificar:**
```bash
# En la terminal, ejecuta:
node -e "console.log('UPLOADTHING_SECRET:', process.env.UPLOADTHING_SECRET ? '✅ Configurada' : '❌ No configurada'); console.log('UPLOADTHING_APP_ID:', process.env.UPLOADTHING_APP_ID ? '✅ Configurada' : '❌ No configurada');"
```

**Solución:**
1. Ve a https://uploadthing.com
2. Inicia sesión en tu cuenta
3. Ve a **Settings** → **API Keys**
4. Copia:
   - `UPLOADTHING_SECRET` (comienza con `sk_live_` o `sk_test_`)
   - `UPLOADTHING_APP_ID` (un ID único)
5. Agrega en `.env.local`:
   ```env
   UPLOADTHING_SECRET=sk_live_tu_secret_aqui
   UPLOADTHING_APP_ID=tu_app_id_aqui
   ```
6. **Reinicia el servidor de desarrollo** (Ctrl+C y luego `npm run dev`)

### 2. Verificar Logs en la Consola

He agregado logs detallados. Cuando intentes subir un archivo, deberías ver:

**En la consola del navegador (F12):**
- `🚀 Upload begin: [nombre del archivo]`
- `📊 Upload progress: X%`
- `=== UPLOAD COMPLETE ===`
- `Full response: [objeto con los datos]`

**En la consola del servidor (terminal):**
- `🔐 Middleware ejecutado para chapterDocument`
- `✅ Variables de entorno de UploadThing configuradas correctamente`
- `✅ Document uploaded successfully to UploadThing: [datos del archivo]`

### 3. Verificar que el Archivo se Sube Correctamente

**Pasos:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network** (Red)
3. Intenta subir un archivo
4. Busca una petición a `/api/uploadthing`
5. Verifica:
   - **Status**: Debe ser `200 OK` o `201 Created`
   - **Response**: Debe contener la URL del archivo

### 4. Verificar en el Dashboard de UploadThing

1. Ve a https://uploadthing.com
2. Inicia sesión
3. Ve a **Files**
4. Deberías ver los archivos que has subido

## 🐛 Errores Comunes

### Error: "Uploadthing no está configurado"
**Causa:** Faltan variables de entorno
**Solución:** Ver sección 1 arriba

### Error: "File type not allowed"
**Causa:** El tipo de archivo no está permitido
**Solución:** El endpoint `chapterDocument` acepta:
- PDFs (`.pdf`)
- Archivos blob (Word, Excel, etc.)

### El archivo se sube pero no aparece en la base de datos
**Causa:** El callback `onClientUploadComplete` no se ejecuta correctamente
**Solución:** 
1. Verifica los logs en la consola del navegador
2. Verifica que `onClientUploadComplete` reciba la respuesta correcta
3. Verifica que el endpoint de la API (`/api/course/[courseId]/chapter/[chapterId]`) funcione correctamente

## 📝 Checklist de Verificación

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Servidor de desarrollo reiniciado después de agregar variables
- [ ] Logs aparecen en la consola del navegador
- [ ] Logs aparecen en la consola del servidor
- [ ] Archivo aparece en el dashboard de UploadThing
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la consola del servidor

## 🔗 Recursos

- [Documentación de UploadThing](https://docs.uploadthing.com)
- [Dashboard de UploadThing](https://uploadthing.com)
- [Estado de UploadThing](https://uploadthingstatus.com)

