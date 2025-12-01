# 🔧 Configuración de Variables de Entorno en Vercel

## ❌ Problema Actual

Tienes estas variables en Vercel:
- `activenglish_POSTGRES_URL` ✅
- `activenglish_PRISMA_DATABASE_URL` ✅
- `activeenglish_DATABASE_URL` ✅ (nota: falta una 't')

**Pero faltan estas variables críticas:**
- ❌ `DATABASE_URL` (opcional, pero recomendada)
- ❌ `NEXTAUTH_SECRET` (REQUERIDA para NextAuth)
- ❌ `NEXTAUTH_URL` (REQUERIDA para NextAuth)

## ✅ Solución: Agregar Variables Faltantes

### Paso 1: Agregar NEXTAUTH_SECRET (REQUERIDA)

1. Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Click en **"Add New"**
3. Configura:
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: Genera una clave secreta (ver abajo)
   - **Ambientes**: Marca las 3 casillas (Production, Preview, Development)
4. Click en **"Save"**

**Generar NEXTAUTH_SECRET:**
```bash
# En PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# O usa este valor (ya generado):
YA66v7S+a706fPANrI5fDWGs0N/qcDiS5xZhkfaFg9c=
```

### Paso 2: Agregar NEXTAUTH_URL (REQUERIDA)

1. Click en **"Add New"** nuevamente
2. Configura:
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://academy-activenglish.vercel.app` (tu URL de producción)
   - **Ambientes**: Marca las 3 casillas
3. Click en **"Save"**

### Paso 3: Agregar DATABASE_URL (Opcional pero Recomendada)

Aunque ya tienes `activenglish_PRISMA_DATABASE_URL`, es buena práctica tener también `DATABASE_URL`:

1. Click en **"Add New"** nuevamente
2. Configura:
   - **Key**: `DATABASE_URL`
   - **Value**: Usa el mismo valor que `activenglish_PRISMA_DATABASE_URL`
   - **Ambientes**: Marca las 3 casillas
3. Click en **"Save"**

## 📋 Resumen de Variables Necesarias

| Variable | Estado | Acción |
|----------|--------|--------|
| `activenglish_PRISMA_DATABASE_URL` | ✅ Ya existe | No hacer nada |
| `activenglish_POSTGRES_URL` | ✅ Ya existe | No hacer nada |
| `activeenglish_DATABASE_URL` | ✅ Ya existe | No hacer nada |
| `DATABASE_URL` | ❌ Falta | **Agregar** (opcional) |
| `NEXTAUTH_SECRET` | ❌ Falta | **Agregar** (REQUERIDA) |
| `NEXTAUTH_URL` | ❌ Falta | **Agregar** (REQUERIDA) |

## 🔄 Después de Agregar Variables

1. Ve a la pestaña **"Deployments"**
2. Click en los **3 puntos (⋯)** del último deployment
3. Click en **"Redeploy"**
4. Espera a que termine el build

## ✅ Verificación

Después del redeploy, verifica:
1. Los logs del build no muestran errores
2. Puedes acceder a `/sign-in` sin errores 500
3. Puedes crear un usuario nuevo
4. Puedes iniciar sesión con un usuario existente

## ⚠️ Notas Importantes

1. **NEXTAUTH_SECRET**: Debe ser una cadena aleatoria segura. No uses el valor de ejemplo en producción real.
2. **NEXTAUTH_URL**: Debe ser exactamente la URL de tu proyecto en Vercel (con https://)
3. **Después de agregar variables**: Siempre haz un **Redeploy** para que se apliquen
4. **Las variables con prefijo `activenglish_`**: Están bien, el código ahora las detecta automáticamente

