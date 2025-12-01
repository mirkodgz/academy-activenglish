# 🚀 Quick Start: Autenticación Real con NextAuth.js

## 📋 Pasos para Configurar

### 1. Instalar Dependencias

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

### 2. Configurar Variables de Entorno

**Crear archivo `.env.local`:**

```env
# Opción A: Usar tu BD de producción (para pruebas rápidas)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18wZEJaeFhOTFl0TGtVLUtBTFViQzIiLCJhcGlfa2V5IjoiMDFLQkQ4WlJZQVM1NzEzUFRSU1NTM1RIQU0iLCJ0ZW5hbnRfaWQiOiIyMjYxOWZkNjVhZWI4NjlmZWE4YjVjYTg5OTA0YmM1YjZiOWI4MWQxZmMyNzYxYWJhNTc2MDk1MzMzODYzMzgyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNWQ2MzI1NmMtMDk3ZS00OTE1LThiNTktMmExNjYyNmY5NTZlIn0.o9QV9DAw9qcl0LfPhRRczgJN40Oa5HAKKkDcrQr0oE0"

# Opción B: Crear BD de desarrollo en Neon (gratis) - RECOMENDADO
# DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# NextAuth (REQUERIDO)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-una-clave-aqui"
```

**Generar NEXTAUTH_SECRET:**
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# O usar OpenSSL si lo tienes
openssl rand -base64 32
```

### 3. Ejecutar Migraciones

```bash
# Esto creará las tablas de NextAuth en tu BD
npx prisma migrate dev --name add_auth_models
```

### 4. Generar Prisma Client

```bash
npx prisma generate
```

### 5. Crear Usuario de Prueba

Puedes crear un usuario manualmente o usar la API de registro:

```bash
# POST a /api/auth/register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesor@test.com",
    "password": "password123",
    "firstName": "Profesor",
    "lastName": "Test",
    "role": "TEACHER"
  }'
```

### 6. Iniciar el Servidor

```bash
npm run dev
```

### 7. Probar Login

1. Ir a `http://localhost:3000/sign-in`
2. Usar las credenciales del usuario creado
3. Deberías ser redirigido y autenticado

---

## 🔄 Cambiar de Mock a Real

Una vez que todo funcione, actualiza los imports:

**Antes (mock):**
```typescript
import { getCurrentUser } from "@/lib/auth-mock";
```

**Después (real):**
```typescript
import { getCurrentUser } from "@/lib/auth";
```

---

## ⚠️ Notas Importantes

1. **BD de Desarrollo vs Producción:**
   - Para desarrollo: Usa Neon (gratis) o PostgreSQL local
   - Para producción: Usa tu BD de Prisma Accelerate

2. **Variables de Entorno:**
   - `.env.local` → Desarrollo local
   - Variables en Vercel → Producción

3. **Migraciones:**
   - `migrate dev` → Desarrollo (crea archivos de migración)
   - `migrate deploy` → Producción (aplica migraciones)

---

## 🐛 Solución de Problemas

**Error: "Prisma schema validation"**
- Verifica que `DATABASE_URL` esté configurada
- Ejecuta `npx prisma generate`

**Error: "NEXTAUTH_SECRET is missing"**
- Agrega `NEXTAUTH_SECRET` a `.env.local`
- Reinicia el servidor

**Error: "Table does not exist"**
- Ejecuta `npx prisma migrate dev`

