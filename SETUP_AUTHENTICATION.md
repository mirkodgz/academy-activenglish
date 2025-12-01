# 🚀 Guía de Setup: Autenticación Real con NextAuth.js + Prisma

## 📦 Paso 1: Instalar Dependencias

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

## 🔧 Paso 2: Actualizar Prisma Schema

El schema necesita los modelos de NextAuth. Ya tienes el modelo `User`, solo necesitamos agregar los modelos de sesión.

## 🌍 Paso 3: Configurar Variables de Entorno

### Opción A: Desarrollo Local (Recomendado para empezar)

**Crear `.env.local`:**
```env
# Base de datos de desarrollo (puedes usar Neon gratis)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-una-clave-secreta-aqui"
```

**Para generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Opción B: Usar tu BD de Producción (Solo para pruebas)

**Crear `.env.local`:**
```env
# Tu BD de Prisma Accelerate
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18wZEJaeFhOTFl0TGtVLUtBTFViQzIiLCJhcGlfa2V5IjoiMDFLQkQ4WlJZQVM1NzEzUFRSU1NTM1RIQU0iLCJ0ZW5hbnRfaWQiOiIyMjYxOWZkNjVhZWI4NjlmZWE4YjVjYTg5OTA0YmM1YjZiOWI4MWQxZmMyNzYxYWJhNTc2MDk1MzMzODYzMzgyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNWQ2MzI1NmMtMDk3ZS00OTE1LThiNTktMmExNjYyNmY5NTZlIn0.o9QV9DAw9qcl0LfPhRRczgJN40Oa5HAKKkDcrQr0oE0"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-una-clave-secreta-aqui"
```

## 📝 Paso 4: Actualizar Schema de Prisma

Agregar modelos de NextAuth al schema existente.

## 🔄 Paso 5: Ejecutar Migraciones

```bash
npx prisma migrate dev --name add_auth_models
```

## ⚙️ Paso 6: Configurar NextAuth

Crear archivo de configuración de NextAuth.

## 🔐 Paso 7: Crear API Routes

Crear rutas de autenticación.

## 🔄 Paso 8: Reemplazar Funciones Mock

Actualizar `lib/auth-mock.ts` para usar NextAuth.

---

## 🎯 Recomendación Final

**Para desarrollo:** Usa una BD separada (Neon gratis o local)
**Para producción:** Usa tu BD de Prisma Accelerate

Esto te permite:
- ✅ Probar sin miedo a romper datos de producción
- ✅ Resetear la BD cuando quieras
- ✅ Desarrollo más rápido

