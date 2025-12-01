# 🚀 Guía de Despliegue Automático en Vercel

## ✅ Configuración Automática de Migraciones

Tu proyecto ya está configurado para ejecutar migraciones automáticamente en producción. El `package.json` incluye:

```json
{
  "scripts": {
    "build": "prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

Esto significa que **cada vez que Vercel haga un deploy**:
1. ✅ Ejecutará `prisma generate` (postinstall)
2. ✅ Ejecutará `prisma migrate deploy` (build)
3. ✅ Creará/actualizará todas las tablas automáticamente
4. ✅ Luego construirá la aplicación Next.js

## 📋 Pasos para Desplegar en Vercel

### Paso 1: Subir Código a GitHub

```bash
git add .
git commit -m "Configure automatic migrations for production"
git push origin main
```

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com
2. Click en **Add New Project**
3. Conecta tu repositorio de GitHub
4. Vercel detectará Next.js automáticamente

### Paso 3: Configurar Variables de Entorno en Vercel

Ve a **Settings** → **Environment Variables** y agrega:

#### Variables Obligatorias:

```env
# Base de Datos (Prisma Accelerate - Producción)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18wZEJaeFhOTFl0TGtVLUtBTFViQzIiLCJhcGlfa2V5IjoiMDFLQkQ4WlJZQVM1NzEzUFRSU1NTM1RIQU0iLCJ0ZW5hbnRfaWQiOiIyMjYxOWZkNjVhZWI4NjlmZWE4YjVjYTg5OTA0YmM1YjZiOWI4MWQxZmMyNzYxYWJhNTc2MDk1MzMzODYzMzgyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNWQ2MzI1NmMtMDk3ZS00OTE1LThiNTktMmExNjYyNmY5NTZlIn0.o9QV9DAw9qcl0LfPhRRczgJN40Oa5HAKKkDcrQr0oE0

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=

# UploadThing (si lo usas)
# UPLOADTHING_SECRET=sk_live_...
# UPLOADTHING_APP_ID=...
```

**⚠️ IMPORTANTE:**
- Reemplaza `https://tu-dominio.vercel.app` con tu URL real de Vercel
- Selecciona **Production**, **Preview** y **Development** para cada variable

### Paso 4: Configurar Build Settings (Opcional)

Vercel detectará automáticamente:
- **Build Command**: `npm run build` (ya incluye migraciones)
- **Install Command**: `npm install` (ya incluye `prisma generate`)
- **Output Directory**: `.next`

No necesitas cambiar nada, pero puedes verificar en:
**Settings** → **General** → **Build & Development Settings**

### Paso 5: Hacer el Primer Deploy

1. Click en **Deploy** en Vercel
2. Vercel ejecutará automáticamente:
   - `npm install` → `prisma generate`
   - `npm run build` → `prisma migrate deploy` → `next build`
3. ✅ Las tablas se crearán automáticamente en la primera ejecución

### Paso 6: Verificar que Funcionó

Después del deploy, verifica los logs:
1. Ve a **Deployments** en Vercel
2. Click en el último deployment
3. Revisa los logs del build
4. Deberías ver: `✔ Applied migration: 0_init` o similar

## 🔄 Actualizaciones Futuras

Cada vez que:
- Cambies el schema de Prisma
- Hagas `git push` a GitHub
- Vercel detecte cambios y haga un nuevo deploy

**Las migraciones se ejecutarán automáticamente** gracias al script `build` en `package.json`.

## 📝 Crear Nuevas Migraciones

Cuando cambies el schema:

```bash
# En desarrollo local
npx dotenv -e .env.local -- npx prisma migrate dev --name nombre_de_la_migracion

# Esto creará una nueva migración en prisma/migrations/
# Luego haz commit y push
git add prisma/migrations/
git commit -m "Add new migration"
git push
```

Vercel ejecutará automáticamente `prisma migrate deploy` en el próximo deploy.

## ⚠️ Notas Importantes

1. **Primera vez**: Las migraciones se ejecutarán y crearán todas las tablas
2. **Siguientes deploys**: Solo aplicarán nuevas migraciones
3. **Variables de entorno**: Asegúrate de configurarlas ANTES del primer deploy
4. **NEXTAUTH_URL**: Debe ser la URL de producción (https://tu-dominio.vercel.app)

## 🎯 Resumen

✅ **Migraciones automáticas**: Ya configurado en `package.json`
✅ **Build automático**: Vercel ejecuta `prisma migrate deploy` antes de `next build`
✅ **Solo necesitas**: Configurar variables de entorno en Vercel y hacer deploy

¡Todo listo para producción! 🚀

