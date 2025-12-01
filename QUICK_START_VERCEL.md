# 🚀 Inicio Rápido - Despliegue en Vercel

## ⚡ Pasos Rápidos

### 1. Crear Base de Datos (Elige una opción)

#### Opción A: Neon (Recomendado - Gratis) ⭐
1. Ve a https://neon.tech y crea cuenta
2. Crea un nuevo proyecto
3. Copia la **Connection String**
4. Formato: `postgresql://user:password@host/dbname?sslmode=require`

#### Opción B: Vercel Postgres
1. En Vercel Dashboard → Storage → Create Database → Postgres
2. Vercel crea automáticamente las variables de entorno

### 2. Crear Migraciones de Prisma (Primera vez)

```bash
# Desde tu máquina local
npx prisma migrate dev --name init
```

Esto creará la carpeta `prisma/migrations` con todas las tablas.

### 3. Subir Código a GitHub/GitLab

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 4. Conectar a Vercel

1. Ve a https://vercel.com
2. **Add New Project**
3. Conecta tu repositorio
4. Vercel detectará Next.js automáticamente

### 5. Configurar Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables, agrega:

#### Obligatorias:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YnJpZWYtc2t5bGFyay0zMC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_U4ZQpLeLkfTKIcQpzQxK5cbdBZtcaoHao7VDmx4HQg
DATABASE_URL=postgresql://... (tu connection string)
# STRIPE_SECRET_KEY=sk_test_... (o sk_live_...) - Comentado, no necesario por ahora
# STRIPE_WEBHOOK_SECRET=whsec_... - Comentado, no necesario por ahora
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

#### Opcionales (ya configuradas):
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### 6. Desplegar

1. Click en **Deploy** en Vercel
2. Espera a que termine el build
3. ✅ ¡Listo!

### 7. Verificar Migraciones

Después del primer deploy, verifica que las tablas se crearon:

```bash
# Opción 1: Desde Vercel (mejor)
# Ve a tu deployment → View Function Logs
# Deberías ver "Prisma migrations applied successfully"

# Opción 2: Desde local (conectado a DB de producción)
DATABASE_URL="tu-url-produccion" npx prisma migrate deploy
```

## 📝 Notas Importantes

- ✅ El script `build` ahora incluye `prisma migrate deploy` automáticamente
- ✅ `postinstall` ejecuta `prisma generate` automáticamente
- ⚠️ Primera vez: Asegúrate de tener migraciones creadas localmente antes de desplegar
- ⚠️ Usa claves de **producción** (`pk_live_`, `sk_live_`) cuando estés listo para producción

## 🆘 Problemas Comunes

**Error en build**: Verifica que todas las variables de entorno estén configuradas

**Base de datos vacía**: Ejecuta `npx prisma migrate deploy` manualmente la primera vez

**Clerk no funciona**: Verifica que `NEXT_PUBLIC_APP_URL` apunte a tu dominio de Vercel

---

📖 Para más detalles, ver `VERCEL_DEPLOY.md`

