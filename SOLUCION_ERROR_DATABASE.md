# 🔧 Solución: Error DATABASE_URL en Vercel

## ❌ Error que estás viendo:
```
Error: Environment variable not found: DATABASE_URL.
```

## ✅ Solución: Configurar Base de Datos PostgreSQL

Tienes 3 opciones (recomiendo Neon por su plan gratuito generoso):

---

## Opción 1: Neon (Recomendado) ⭐

### Paso 1: Crear cuenta y proyecto
1. Ve a https://neon.tech
2. Crea una cuenta (puedes usar GitHub para login rápido)
3. Click en **Create Project**
4. Elige un nombre para tu proyecto (ej: `active-english`)
5. Selecciona la región más cercana
6. Click en **Create Project**

### Paso 2: Obtener Connection String
1. Una vez creado el proyecto, verás el dashboard
2. Busca la sección **Connection string** o **Connection Details**
3. Copia la **Connection string** (formato: `postgresql://user:password@host/dbname?sslmode=require`)
4. ⚠️ **IMPORTANTE**: Copia la que dice **"Pooled connection"** o **"Connection pooling"** (es más eficiente)

### Paso 3: Configurar en Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** → **Environment Variables**
3. Click en **Add New**
4. **Key**: `DATABASE_URL`
5. **Value**: Pega tu connection string de Neon
6. Selecciona los ambientes donde aplica (Production, Preview, Development)
7. Click en **Save**

### Paso 4: Ejecutar migraciones
Después de configurar `DATABASE_URL`, necesitas ejecutar las migraciones:

**Opción A: Desde Vercel (Recomendado)**
1. Ve a tu deployment en Vercel
2. Click en **View Function Logs** o abre la consola
3. Ejecuta manualmente en la consola:
   ```bash
   npx prisma migrate deploy
   ```

**Opción B: Desde tu máquina local**
```bash
# Conecta tu .env local a la DB de producción temporalmente
DATABASE_URL="tu-connection-string-de-neon" npx prisma migrate deploy
```

**Opción C: Hacer un nuevo deploy**
- Vercel ejecutará automáticamente `prisma migrate deploy` en el build
- Solo haz un nuevo commit y push, o re-deploy desde Vercel

---

## Opción 2: Vercel Postgres

### Paso 1: Crear base de datos en Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Ve a la pestaña **Storage**
3. Click en **Create Database** → **Postgres**
4. Selecciona un plan (Hobby es gratis)
5. Elige una región
6. Click en **Create**

### Paso 2: Variables automáticas
Vercel creará automáticamente estas variables:
- `POSTGRES_PRISMA_URL` (usa esta para Prisma)
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_URL`

### Paso 3: Configurar Prisma
Necesitas actualizar tu `prisma/schema.prisma` para usar la variable correcta:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")  // Cambiar de DATABASE_URL a POSTGRES_PRISMA_URL
}
```

O mantener `DATABASE_URL` y crear un alias en Vercel:
1. Ve a **Settings** → **Environment Variables**
2. Agrega: `DATABASE_URL` = valor de `POSTGRES_PRISMA_URL`

### Paso 4: Ejecutar migraciones
Igual que en la Opción 1, Paso 4.

---

## Opción 3: Supabase

### Paso 1: Crear proyecto
1. Ve a https://supabase.com
2. Crea una cuenta y un nuevo proyecto
3. Espera a que se cree (tarda unos minutos)

### Paso 2: Obtener Connection String
1. Ve a **Settings** → **Database**
2. Busca **Connection string** → **URI**
3. Copia la connection string
4. Reemplaza `[YOUR-PASSWORD]` con tu contraseña de la base de datos

### Paso 3: Configurar en Vercel
Igual que Opción 1, Paso 3.

### Paso 4: Ejecutar migraciones
Igual que Opción 1, Paso 4.

---

## 🚀 Después de Configurar

### 1. Verificar variables en Vercel
Asegúrate de que `DATABASE_URL` esté configurada en:
- ✅ Production
- ✅ Preview (opcional pero recomendado)
- ✅ Development (opcional)

### 2. Hacer nuevo deploy
```bash
# Desde tu máquina local
git add .
git commit -m "Configure database"
git push
```

O desde Vercel Dashboard:
- Ve a **Deployments**
- Click en los 3 puntos del último deployment
- Click en **Redeploy**

### 3. Verificar que funcionó
- Revisa los logs del build en Vercel
- Deberías ver: `Prisma migrations applied successfully`
- El build debería completarse sin errores

---

## 📝 Checklist

- [ ] Base de datos PostgreSQL creada (Neon/Vercel/Supabase)
- [ ] Connection string copiada
- [ ] Variable `DATABASE_URL` configurada en Vercel
- [ ] Migraciones ejecutadas (automático en build o manual)
- [ ] Nuevo deploy realizado
- [ ] Build exitoso sin errores

---

## 🆘 Si aún tienes problemas

### Error: "Migration not found"
**Solución**: Primero crea las migraciones localmente:
```bash
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m "Add Prisma migrations"
git push
```

### Error: "Connection refused" o "Timeout"
**Solución**: 
- Verifica que la connection string sea correcta
- Asegúrate de usar la versión "Pooled" si usas Neon
- Verifica que la base de datos esté activa

### Error: "Schema validation failed"
**Solución**: 
- Verifica que `prisma/schema.prisma` esté correcto
- Ejecuta `npx prisma format` localmente
- Asegúrate de que todas las migraciones estén en `prisma/migrations`

---

## 💡 Recomendación Final

**Usa Neon** porque:
- ✅ Plan gratuito generoso (0.5GB)
- ✅ Fácil de configurar
- ✅ Connection pooling incluido
- ✅ Buena performance
- ✅ Compatible con Vercel

¡Una vez configurado, tu deploy debería funcionar perfectamente! 🎉

