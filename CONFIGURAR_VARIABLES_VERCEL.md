# 🔧 Configurar Variables de Entorno en Vercel

## ❌ Problema Actual

Tienes estas variables en Vercel:
- `activenglish_POSTGRES_URL`
- `activenglish_PRISMA_DATABASE_URL`
- `activenglish_DATABASE_URL`

Pero Prisma busca `DATABASE_URL` (sin el prefijo `activenglish_`).

## ✅ Solución

Necesitas agregar la variable `DATABASE_URL` en Vercel con el valor de Prisma Accelerate.

### Paso 1: Agregar DATABASE_URL

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Click en **"Add New"**
4. Configura:
   - **Key**: `DATABASE_URL`
   - **Value**: 
     ```
     prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18wZEJaeFhOTFl0TGtVLUtBTFViQzIiLCJhcGlfa2V5IjoiMDFLQkQ4WlJZQVM1NzEzUFRSU1NTM1RIQU0iLCJ0ZW5hbnRfaWQiOiIyMjYxOWZkNjVhZWI4NjlmZWE4YjVjYTg5OTA0YmM1YjZiOWI4MWQxZmMyNzYxYWJhNTc2MDk1MzMzODYzMzgyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNWQ2MzI1NmMtMDk3ZS00OTE1LThiNTktMmExNjYyNmY5NTZlIn0.o9QV9DAw9qcl0LfPhRRczgJN40Oa5HAKKkDcrQr0oE0
     ```
   - **Ambientes**: Marca las 3 casillas (Production, Preview, Development)
5. Click en **"Save"**

### Paso 2: Agregar NEXTAUTH_URL

1. Click en **"Add New"** nuevamente
2. Configura:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: Tu URL de Vercel (ejemplo: `https://tu-proyecto.vercel.app`)
     - Puedes encontrar tu URL en la pestaña "Deployments"
   - **Ambientes**: Marca las 3 casillas
3. Click en **"Save"**

### Paso 3: Agregar NEXTAUTH_SECRET

1. Click en **"Add New"** nuevamente
2. Configura:
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: `YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=`
   - **Ambientes**: Marca las 3 casillas
3. Click en **"Save"**

### Paso 4: Hacer Redeploy

1. Ve a la pestaña **"Deployments"**
2. Click en los **3 puntos (⋯)** del último deployment
3. Click en **"Redeploy"**
4. Espera a que termine el build

## 📋 Resumen de Variables Necesarias

| Variable | Valor | Nota |
|----------|-------|------|
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=...` | **NUEVA** - Usa Prisma Accelerate |
| `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` | **NUEVA** - Tu URL de Vercel |
| `NEXTAUTH_SECRET` | `YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=` | **NUEVA** - Secreto de NextAuth |

## ⚠️ Notas Importantes

1. **DATABASE_URL**: Debe usar el valor de `activenglish_PRISMA_DATABASE_URL` (Prisma Accelerate es mejor para producción)
2. **Las variables con prefijo `activenglish_`**: Puedes dejarlas, no causan problemas, pero Prisma necesita `DATABASE_URL` específicamente
3. **Después de agregar variables**: Siempre haz un **Redeploy** para que se apliquen

## ✅ Verificación

Después del redeploy, verifica los logs:
1. Click en el deployment
2. Revisa los logs del build
3. Deberías ver: `✔ Applied migration: 0_init` o similar
4. El build debería completarse exitosamente

