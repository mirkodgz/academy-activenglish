# 🔧 Solución: Error DATABASE_URL en Vercel

## ❌ Error que estás viendo:
```
Error: Environment variable not found: DATABASE_URL.
```

## ✅ Solución Rápida (5 minutos)

### Paso 1: Ir a Vercel Dashboard
1. Ve a https://vercel.com
2. Inicia sesión
3. Selecciona tu proyecto

### Paso 2: Configurar Variables de Entorno

1. **Click en "Settings"** (en el menú superior)
2. **Click en "Environment Variables"** (en el menú lateral izquierdo)
3. **Click en "Add New"** (botón en la parte superior)

### Paso 3: Agregar DATABASE_URL

1. **Key**: `DATABASE_URL`
2. **Value**: Pega este valor:
   ```
   prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18wZEJaeFhOTFl0TGtVLUtBTFViQzIiLCJhcGlfa2V5IjoiMDFLQkQ4WlJZQVM1NzEzUFRSU1NTM1RIQU0iLCJ0ZW5hbnRfaWQiOiIyMjYxOWZkNjVhZWI4NjlmZWE4YjVjYTg5OTA0YmM1YjZiOWI4MWQxZmMyNzYxYWJhNTc2MDk1MzMzODYzMzgyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNWQ2MzI1NmMtMDk3ZS00OTE1LThiNTktMmExNjYyNmY5NTZlIn0.o9QV9DAw9qcl0LfPhRRczgJN40Oa5HAKKkDcrQr0oE0
   ```
3. **Selecciona los ambientes**: Marca las 3 casillas:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
4. **Click en "Save"**

### Paso 4: Agregar NEXTAUTH_URL

1. **Click en "Add New"** nuevamente
2. **Key**: `NEXTAUTH_URL`
3. **Value**: Tu URL de Vercel (ejemplo: `https://tu-proyecto.vercel.app`)
   - Puedes encontrar tu URL en la pestaña "Deployments" → Click en el último deployment
4. **Selecciona los ambientes**: Marca las 3 casillas
5. **Click en "Save"**

### Paso 5: Agregar NEXTAUTH_SECRET

1. **Click en "Add New"** nuevamente
2. **Key**: `NEXTAUTH_SECRET`
3. **Value**: `YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=`
4. **Selecciona los ambientes**: Marca las 3 casillas
5. **Click en "Save"**

### Paso 6: Hacer Redeploy

1. Ve a la pestaña **"Deployments"**
2. Click en los **3 puntos (⋯)** del último deployment
3. Click en **"Redeploy"**
4. Espera a que termine el build

## ✅ Verificación

Después del redeploy, verifica los logs:
1. Click en el deployment
2. Revisa los logs del build
3. Deberías ver: `✔ Applied migration: 0_init` o similar
4. El build debería completarse exitosamente

## 🎯 Resumen de Variables Necesarias

| Variable | Valor | Ambientes |
|----------|-------|-----------|
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=...` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://tu-proyecto.vercel.app` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=` | Production, Preview, Development |

## ⚠️ Notas Importantes

1. **NEXTAUTH_URL**: Debe ser la URL real de tu proyecto en Vercel
2. **Todas las variables**: Deben estar marcadas para los 3 ambientes (Production, Preview, Development)
3. **Después de agregar variables**: Siempre haz un **Redeploy** para que se apliquen

## 🚀 ¡Listo!

Una vez configuradas las variables y hecho el redeploy, tu aplicación debería desplegarse correctamente con las migraciones de Prisma ejecutándose automáticamente.

