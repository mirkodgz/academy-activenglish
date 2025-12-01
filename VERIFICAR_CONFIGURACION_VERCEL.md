# 🔍 Verificar Configuración en Vercel para Login

## ❌ Problema: Login funciona en local pero no en producción

Si el login funciona en local pero no en producción, es muy probable que falte alguna configuración en Vercel.

## ✅ Checklist de Verificación en Vercel

### 1. Verificar NEXTAUTH_URL

**Ubicación:** Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

**Debe estar configurado así:**
- **Key:** `NEXTAUTH_URL`
- **Value:** `https://academy-activenglish.vercel.app` (tu URL exacta de producción)
- **Ambientes:** ✅ Production, ✅ Preview, ✅ Development

**⚠️ IMPORTANTE:**
- Debe empezar con `https://` (no `http://`)
- Debe ser la URL exacta de tu proyecto (sin `/` al final)
- No debe tener espacios al inicio o final

### 2. Verificar NEXTAUTH_SECRET

**Ubicación:** Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

**Debe estar configurado así:**
- **Key:** `NEXTAUTH_SECRET`
- **Value:** `YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=`
- **Ambientes:** ✅ Production, ✅ Preview, ✅ Development

**⚠️ IMPORTANTE:**
- Debe ser el mismo valor en todos los ambientes
- No debe tener espacios al inicio o final
- Debe ser una cadena segura (no usar valores por defecto en producción)

### 3. Verificar que las Variables Estén Aplicadas

Después de agregar/modificar variables:

1. Ve a **Deployments**
2. Click en los **3 puntos (⋯)** del último deployment
3. Click en **"Redeploy"**
4. Espera a que termine el build

**⚠️ IMPORTANTE:** Las variables de entorno solo se aplican en nuevos deployments. Si modificaste variables, debes hacer redeploy.

### 4. Verificar los Logs de Vercel

Si el problema persiste:

1. Ve a **Deployments**
2. Click en el último deployment
3. Click en **"Functions"** o **"Logs"**
4. Busca errores relacionados con:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `Environment variable not found`
   - `Cookie` o `session`

## 🔧 Cambios Recientes en el Código

Se agregaron las siguientes mejoras:

1. **`trustHost: true`** en `lib/auth-config.ts`
   - Necesario para que NextAuth funcione correctamente en Vercel
   - Permite que NextAuth confíe en el host de Vercel

2. **Delay aumentado a 1000ms** en el login
   - Da más tiempo para que las cookies se establezcan en producción
   - Las cookies pueden tardar más en establecerse en Vercel que en local

3. **Verificación de sesión antes de redirigir**
   - Verifica que la sesión esté disponible antes de redirigir
   - Si la sesión no está disponible, espera 500ms adicionales

## 📝 Nota sobre Variables de Entorno

**El proyecto está configurado para usar `activenglish_PRISMA_DATABASE_URL` como variable principal.**

El código tiene mapeos automáticos que funcionan así:
- Si existe `activenglish_PRISMA_DATABASE_URL` → Se usa directamente ✅
- Si NO existe pero existe `DATABASE_URL` → Se mapea automáticamente
- Si NO existe pero existe `activenglish_POSTGRES_URL` → Se mapea automáticamente
- Si NO existe pero existe `activenglish_DATABASE_URL` → Se mapea automáticamente

**En tu caso:** Tienes `activenglish_PRISMA_DATABASE_URL` configurada, así que está perfecto. No necesitas `DATABASE_URL` adicional.

## 📋 Pasos para Solucionar

### Paso 1: Verificar Variables en Vercel

1. Ve a https://vercel.com
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Verifica que existan estas variables:

| Variable | Valor Esperado | Estado | Nota |
|----------|---------------|--------|------|
| `NEXTAUTH_URL` | `https://academy-activenglish.vercel.app` | ✅/❌ | **REQUERIDA** |
| `NEXTAUTH_SECRET` | `YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=` | ✅/❌ | **REQUERIDA** |
| `activenglish_PRISMA_DATABASE_URL` | `prisma+postgres://...` | ✅/❌ | **REQUERIDA** (Principal) |
| `activenglish_POSTGRES_URL` | `prisma+postgres://...` | ✅/❌ | Opcional (se mapea automáticamente) |
| `activenglish_DATABASE_URL` | `prisma+postgres://...` | ✅/❌ | Opcional (se mapea automáticamente) |
| `DATABASE_URL` | `prisma+postgres://...` | ❌ | **NO REQUERIDA** (el código mapea automáticamente) |

### Paso 2: Si Faltan Variables

**IMPORTANTE:** El proyecto usa `activenglish_PRISMA_DATABASE_URL` como variable principal. El código mapea automáticamente desde otras variables si no existe.

**Variables REQUERIDAS:**
1. `NEXTAUTH_URL` - Debe ser `https://academy-activenglish.vercel.app`
2. `NEXTAUTH_SECRET` - Debe ser `YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=`
3. `activenglish_PRISMA_DATABASE_URL` - Tu connection string de Prisma Accelerate

**Variables OPCIONALES (se mapean automáticamente):**
- `activenglish_POSTGRES_URL` - Se mapea a `activenglish_PRISMA_DATABASE_URL` si falta
- `activenglish_DATABASE_URL` - Se mapea a `activenglish_PRISMA_DATABASE_URL` si falta
- `DATABASE_URL` - Se mapea a `activenglish_PRISMA_DATABASE_URL` si falta

**Para agregar una variable:**
1. Click en **"Add New"**
2. Agrega la variable faltante con el valor correcto
3. Marca las 3 casillas (Production, Preview, Development)
4. Click en **"Save"**

### Paso 3: Hacer Redeploy

1. Ve a **Deployments**
2. Click en los **3 puntos (⋯)** del último deployment
3. Click en **"Redeploy"**
4. Espera a que termine el build (puede tardar 2-3 minutos)

### Paso 4: Probar en Producción

1. Abre tu aplicación en producción: `https://academy-activenglish.vercel.app`
2. Intenta iniciar sesión
3. Abre la consola del navegador (F12)
4. Verifica los logs:
   - `✅ Sesión obtenida`
   - `✅ Sesión verificada, redirigiendo a: /`
   - `🔄 Ejecutando redirección a: /`

## 🐛 Debugging

Si el problema persiste después de verificar todo:

1. **Abre la consola del navegador (F12)**
2. Ve a la pestaña **"Application"** o **"Storage"**
3. Ve a **"Cookies"** → Tu dominio
4. Busca una cookie llamada `next-auth.session-token`
   - Si **NO existe**: El problema es que las cookies no se están estableciendo
   - Si **existe**: El problema puede ser con el middleware

5. **Revisa los logs de Vercel:**
   - Ve a **Deployments** → Último deployment → **Logs**
   - Busca errores relacionados con NextAuth

## 📞 Información Útil para Debugging

Si necesitas ayuda adicional, proporciona:

1. **URL de tu proyecto en Vercel:** `https://academy-activenglish.vercel.app`
2. **Screenshot de las variables de entorno en Vercel** (ocultando valores sensibles)
3. **Logs de la consola del navegador** cuando intentas hacer login
4. **Logs de Vercel** del último deployment

