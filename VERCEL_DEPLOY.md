# Guía de Despliegue en Vercel con PostgreSQL y Prisma

## 🎯 Opciones de Base de Datos

### Opción 1: Vercel Postgres (Recomendado) ⭐
- **Ventajas**: Integración nativa con Vercel, fácil configuración, conexión automática
- **Precio**: Plan gratuito disponible, luego desde $20/mes
- **Ideal para**: Proyectos que quieren todo en un solo lugar

### Opción 2: Neon (Recomendado para desarrollo) ⭐
- **Ventajas**: Plan gratuito generoso, compatible con Vercel, buena performance
- **Precio**: Gratis hasta 0.5GB, luego desde $19/mes
- **Ideal para**: Proyectos que necesitan más control y mejor plan gratuito

### Opción 3: Supabase
- **Ventajas**: Plan gratuito, incluye autenticación y storage
- **Precio**: Gratis hasta 500MB, luego desde $25/mes
- **Ideal para**: Proyectos que necesitan más funcionalidades

## 📋 Pasos para Desplegar en Vercel

### Paso 1: Preparar el Proyecto

1. **Agregar script de migración en package.json** (ya está configurado el postinstall)

2. **Asegúrate de tener todas las migraciones de Prisma**:
   ```bash
   npx prisma migrate dev --name init
   ```

### Paso 2: Crear Base de Datos

#### Si usas Vercel Postgres:
1. Ve a tu proyecto en Vercel Dashboard
2. Ve a la pestaña **Storage**
3. Click en **Create Database** → **Postgres**
4. Selecciona un plan (Hobby es gratis)
5. Vercel creará automáticamente la variable `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING`

#### Si usas Neon (Recomendado):
1. Ve a https://neon.tech
2. Crea una cuenta y un nuevo proyecto
3. Copia la **Connection String** (formato: `postgresql://user:password@host/dbname?sslmode=require`)
4. Usa esta URL como `DATABASE_URL` en Vercel

#### Si usas Supabase:
1. Ve a https://supabase.com
2. Crea un proyecto
3. Ve a Settings → Database
4. Copia la **Connection String** (URI mode)
5. Usa esta URL como `DATABASE_URL` en Vercel

### Paso 3: Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → **Settings** → **Environment Variables** y agrega:

#### Variables Requeridas:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YnJpZWYtc2t5bGFyay0zMC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_U4ZQpLeLkfTKIcQpzQxK5cbdBZtcaoHao7VDmx4HQg
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Database (si usas Vercel Postgres, estas se crean automáticamente)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Si usas Vercel Postgres, también necesitas:
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Stripe (Comentado - No necesario por ahora, pero disponible para uso futuro)
# STRIPE_SECRET_KEY=sk_live_... (o sk_test_... para desarrollo)
# STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Next.js
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

### Paso 4: Configurar Build Settings en Vercel

1. Ve a **Settings** → **General** → **Build & Development Settings**

2. **Build Command**: (Vercel lo detecta automáticamente, pero verifica)
   ```bash
   npm run build
   ```
   o
   ```bash
   yarn build
   ```

3. **Install Command**: (Vercel lo detecta automáticamente)
   ```bash
   npm install
   ```
   o
   ```bash
   yarn install
   ```

4. **Output Directory**: `.next` (automático)

### Paso 5: Configurar Migraciones de Prisma

Vercel ejecutará `postinstall` automáticamente que incluye `prisma generate`, pero necesitas ejecutar las migraciones.

#### Opción A: Usar Build Command (Recomendado)

Actualiza el `package.json` para incluir migraciones en el build:

```json
{
  "scripts": {
    "build": "prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

#### Opción B: Usar Vercel Build Command

En Vercel Dashboard → Settings → Build & Development Settings:

**Build Command**:
```bash
npx prisma migrate deploy && npm run build
```

### Paso 6: Desplegar

1. **Conecta tu repositorio** a Vercel (si no lo has hecho):
   - Ve a Vercel Dashboard
   - Click en **Add New Project**
   - Conecta tu repositorio de GitHub/GitLab/Bitbucket
   - Vercel detectará automáticamente Next.js

2. **Configura las variables de entorno** (Paso 3)

3. **Haz push a tu repositorio** o click en **Deploy**

4. **Espera a que termine el build**

5. **Verifica las migraciones**: Después del primer deploy, verifica que las tablas se crearon correctamente

### Paso 7: Ejecutar Migraciones (Primera vez)

Si las migraciones no se ejecutaron automáticamente:

1. Ve a tu proyecto en Vercel
2. Click en **Deployments**
3. Abre la consola del deployment más reciente
4. Ejecuta manualmente:
   ```bash
   npx prisma migrate deploy
   ```

O desde tu máquina local (conectado a la DB de producción):
```bash
DATABASE_URL="tu-url-de-produccion" npx prisma migrate deploy
```

## 🔧 Configuración Adicional

<!-- ### Configurar Webhook de Stripe (Comentado - No necesario por ahora)

1. Ve a Stripe Dashboard → Developers → Webhooks
2. Agrega endpoint: `https://tu-dominio.vercel.app/api/webhook`
3. Selecciona eventos: `checkout.session.completed`
4. Copia el **Signing secret** (empieza con `whsec_`)
5. Agrega como `STRIPE_WEBHOOK_SECRET` en Vercel
-->

### Configurar Clerk para Producción

1. En Clerk Dashboard, agrega tu dominio de Vercel
2. Actualiza `NEXT_PUBLIC_APP_URL` con tu URL de producción
3. Usa claves de producción (`pk_live_` y `sk_live_`) en lugar de test

### Configurar UploadThing

1. Ve a UploadThing Dashboard
2. Crea una nueva app o usa la existente
3. Agrega tu dominio de Vercel a los dominios permitidos
4. Copia las credenciales a Vercel

## ✅ Checklist Pre-Deploy

- [ ] Base de datos creada y conectada
- [ ] Variables de entorno configuradas en Vercel
- [ ] Migraciones de Prisma ejecutadas
- [ ] <!-- Webhook de Stripe configurado --> (Comentado - No necesario por ahora)
- [ ] Clerk configurado con dominio de producción
- [ ] UploadThing configurado
- [ ] `NEXT_PUBLIC_APP_URL` apunta a la URL de producción
- [ ] Build pasa sin errores

## 🐛 Troubleshooting

### Error: "Prisma Client not generated"
- **Solución**: Verifica que `postinstall` esté en package.json
- Ejecuta manualmente: `npx prisma generate`

### Error: "Migration not found"
- **Solución**: Ejecuta `npx prisma migrate deploy` manualmente
- O agrega `prisma migrate deploy` al build command

### Error: "Database connection failed"
- **Solución**: Verifica que `DATABASE_URL` esté correctamente configurada
- Si usas Vercel Postgres, usa `POSTGRES_PRISMA_URL` en lugar de `DATABASE_URL`

### Error: "Clerk authentication failed"
- **Solución**: Verifica que las claves de Clerk sean correctas
- Asegúrate de usar claves de producción (`pk_live_`) en producción

## 📚 Recursos

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deploy Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Neon Docs](https://neon.tech/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

