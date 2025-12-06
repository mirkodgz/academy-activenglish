# 🔧 Configurar UPLOADTHING_TOKEN

## ❌ Problema

Error en producción: `Missing token. Please set the UPLOADTHING_TOKEN environment variable`

## ✅ Solución

UploadThing puede usar **dos formas** de autenticación:

### Opción 1: UPLOADTHING_TOKEN (Recomendado - Más Simple)

Usa un token combinado que incluye tanto el secret como el app ID.

**En Vercel:**
1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Agrega:
   - **Key**: `UPLOADTHING_TOKEN`
   - **Value**: `TU_TOKEN_UPLOADTHING_AQUI` (obtén el token desde tu dashboard de UploadThing)
   - **Ambientes**: Marca Production, Preview y Development
4. Haz un redeploy

**En local (.env.local):**
```env
UPLOADTHING_TOKEN=TU_TOKEN_UPLOADTHING_AQUI
```

### Opción 2: UPLOADTHING_SECRET + UPLOADTHING_APP_ID (Alternativa)

Si prefieres usar las variables separadas:

**En Vercel:**
1. **Settings** → **Environment Variables**
2. Agrega:
   - **Key**: `UPLOADTHING_SECRET`
   - **Value**: `TU_SECRET_UPLOADTHING_AQUI` (obtén el secret desde tu dashboard de UploadThing)
   - **Ambientes**: Production, Preview, Development
3. Agrega:
   - **Key**: `UPLOADTHING_APP_ID`
   - **Value**: `6m8z3ftjbv`
   - **Ambientes**: Production, Preview, Development
4. Haz un redeploy

**En local (.env.local):**
```env
UPLOADTHING_SECRET=TU_SECRET_UPLOADTHING_AQUI
UPLOADTHING_APP_ID=6m8z3ftjbv
```

## 📝 Nota Importante

- **Usa solo UNA de las dos opciones**, no ambas
- Si usas `UPLOADTHING_TOKEN`, no necesitas `UPLOADTHING_SECRET` ni `UPLOADTHING_APP_ID`
- Si usas `UPLOADTHING_SECRET` + `UPLOADTHING_APP_ID`, no necesitas `UPLOADTHING_TOKEN`
- UploadThing buscará automáticamente estas variables en el orden: primero `UPLOADTHING_TOKEN`, luego `UPLOADTHING_SECRET` + `UPLOADTHING_APP_ID`

## ✅ Recomendación

**Usa `UPLOADTHING_TOKEN`** porque:
- Es más simple (una sola variable)
- Es más seguro (token combinado)
- Es lo que UploadThing recomienda en su documentación más reciente

## 🔄 Después de Configurar

1. **Reinicia el servidor de desarrollo** (si estás en local)
2. **Haz un redeploy en Vercel** (si estás en producción)
3. Prueba subir un archivo nuevamente

