# 🔐 Instrucciones Completas: Autenticación Real

## ✅ Lo que ya está implementado

1. ✅ Schema de Prisma actualizado con modelos de NextAuth
2. ✅ Configuración de NextAuth (`app/api/auth/[...nextauth]/route.ts`)
3. ✅ Funciones de autenticación (`lib/auth.ts`)
4. ✅ Página de login funcional (`app/(auth)/sign-in/[[...sign-in]]/page.tsx`)
5. ✅ Página de registro (`app/(auth)/sign-up/page.tsx`)
6. ✅ API de registro (`app/api/auth/register/route.ts`)
7. ✅ Tipos de TypeScript para NextAuth (`types/next-auth.d.ts`)

## 🚀 Pasos para Activar la Autenticación Real

### Paso 1: Instalar Dependencias

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

### Paso 2: Configurar Variables de Entorno

**Crear `.env.local` en la raíz del proyecto:**

```env
# Opción A: Usar tu BD de producción (para pruebas rápidas)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18wZEJaeFhOTFl0TGtVLUtBTFViQzIiLCJhcGlfa2V5IjoiMDFLQkQ4WlJZQVM1NzEzUFRSU1NTM1RIQU0iLCJ0ZW5hbnRfaWQiOiIyMjYxOWZkNjVhZWI4NjlmZWE4YjVjYTg5OTA0YmM1YjZiOWI4MWQxZmMyNzYxYWJhNTc2MDk1MzMzODYzMzgyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNWQ2MzI1NmMtMDk3ZS00OTE1LThiNTktMmExNjYyNmY5NTZlIn0.o9QV9DAw9qcl0LfPhRRczgJN40Oa5HAKKkDcrQr0oE0"

# Opción B: Crear BD de desarrollo en Neon (gratis) - RECOMENDADO
# Ve a https://neon.tech y crea una BD gratis
# DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# NextAuth (REQUERIDO)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-una-clave-secreta-aqui"
```

**Generar NEXTAUTH_SECRET (Windows PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Paso 3: Ejecutar Migraciones

```bash
# Esto creará las tablas Account, Session, VerificationToken en tu BD
npx prisma migrate dev --name add_auth_models
```

### Paso 4: Generar Prisma Client

```bash
npx prisma generate
```

### Paso 5: Crear Usuario de Prueba

**Opción A: Usar la página de registro**
1. Ir a `http://localhost:3000/sign-up`
2. Llenar el formulario
3. Crear cuenta

**Opción B: Usar la API directamente**
```bash
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

### Paso 6: Actualizar Imports en el Código

**Buscar y reemplazar en todos los archivos:**

**Antes (mock):**
```typescript
import { getCurrentUser, isTeacher, isStudent } from "@/lib/auth-mock";
```

**Después (real):**
```typescript
import { getCurrentUser, isTeacher, isStudent } from "@/lib/auth";
```

### Paso 7: Probar Login

1. Iniciar servidor: `npm run dev`
2. Ir a `http://localhost:3000/sign-in`
3. Usar las credenciales del usuario creado
4. Deberías ser autenticado y redirigido

---

## 🔄 Cambios Necesarios en el Código

### Archivos que necesitan actualización:

1. **Todas las páginas** que usan `@/lib/auth-mock` → Cambiar a `@/lib/auth`
2. **Todas las rutas API** que usan `@/lib/auth-mock` → Cambiar a `@/lib/auth`
3. **Componentes** que usan autenticación → Actualizar si es necesario

### Script para buscar archivos a actualizar:

```bash
# Buscar todos los archivos que usan auth-mock
grep -r "auth-mock" app/ components/ actions/
```

---

## 📋 Checklist de Implementación

- [ ] Instalar dependencias
- [ ] Configurar `.env.local` con DATABASE_URL y NEXTAUTH_SECRET
- [ ] Ejecutar migraciones (`npx prisma migrate dev`)
- [ ] Generar Prisma Client (`npx prisma generate`)
- [ ] Crear usuario de prueba
- [ ] Actualizar imports de `auth-mock` a `auth`
- [ ] Probar login
- [ ] Probar registro
- [ ] Verificar que las rutas protegidas funcionen
- [ ] Actualizar Navbar para mostrar usuario real
- [ ] Actualizar Sidebar para usar rol real

---

## 🎯 Recomendación: Desarrollo vs Producción

### Para Desarrollo (Recomendado):
- **Usar Neon (gratis)**: https://neon.tech
- Crear una BD separada para desarrollo
- Permite resetear datos sin problemas

### Para Producción:
- **Usar tu BD de Prisma Accelerate** (la que ya creaste)
- Configurar variables en Vercel
- Usar `migrate deploy` en lugar de `migrate dev`

---

## 🐛 Solución de Problemas

**Error: "Cannot find module 'next-auth'"**
- Ejecuta: `npm install next-auth@beta`

**Error: "NEXTAUTH_SECRET is missing"**
- Agrega `NEXTAUTH_SECRET` a `.env.local`
- Reinicia el servidor

**Error: "Table does not exist"**
- Ejecuta: `npx prisma migrate dev`

**Error: "Prisma schema validation"**
- Verifica que `DATABASE_URL` esté en `.env.local`
- Ejecuta: `npx prisma generate`

---

## 📝 Notas Importantes

1. **No elimines `lib/auth-mock.ts` todavía**: Úsalo como respaldo hasta que todo funcione
2. **Prueba en local primero**: Antes de conectar a producción
3. **Backup de datos**: Si usas producción, haz backup antes de migraciones
4. **Variables de entorno**: Nunca subas `.env.local` a Git

