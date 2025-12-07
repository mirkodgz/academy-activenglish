# 🧪 Guía: Probar Envío de Emails en Local

## 📋 Requisitos Previos

1. ✅ **Resend configurado** - Ya lo tienes
2. ✅ **Variables de entorno** configuradas en `.env.local`
3. ⚠️ **ngrok** (opcional, solo si quieres probar el link completo)

---

## 🔧 Configuración Actual

### Variables de Entorno Necesarias

En tu `.env.local`:

```env
# Resend (para enviar emails)
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev  # o tu email verificado

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Para desarrollo local
```

---

## 🚀 Opción 1: Test Simple (Sin ngrok)

### Ventajas
- ✅ Más rápido
- ✅ No necesitas instalar nada adicional
- ✅ Perfecto para verificar que los emails se envían

### Desventajas
- ❌ Los links de reset password apuntarán a `localhost:3000` (no funcionarán desde otro dispositivo)

### Pasos:

1. **Verificar variables de entorno**
   ```bash
   # Verifica que tengas RESEND_API_KEY en .env.local
   ```

2. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

3. **Crear un usuario estudiante con curso**
   - Ve a `/teacher/users`
   - Crea un usuario estudiante
   - Asigna un curso

4. **Enviar email de prueba**
   - Ve a `/teacher/send-emails`
   - Selecciona el curso
   - Completa asunto y cuerpo
   - Haz clic en "Invia Email"

5. **Verificar logs**
   - Revisa la consola del servidor para ver logs de `[CREATE_USER]` y `[SEND_PASSWORD_LINKS]`
   - Deberías ver: `✅ Email enviado exitosamente`

6. **Verificar email**
   - Revisa la bandeja de entrada del email del estudiante
   - El email debería llegar en segundos

---

## 🌐 Opción 2: Test Completo con ngrok (Recomendado)

### Ventajas
- ✅ Puedes probar el link completo de reset password
- ✅ Funciona desde cualquier dispositivo
- ✅ Simula mejor el entorno de producción

### Desventajas
- ⚠️ Requiere instalar ngrok
- ⚠️ URL cambia cada vez que reinicias ngrok (gratis)

### Pasos:

#### 1. Instalar ngrok

**Windows:**
```powershell
# Opción A: Con Chocolatey
choco install ngrok

# Opción B: Descargar manualmente
# Ve a https://ngrok.com/download
# Descarga y descomprime
# Agrega ngrok.exe al PATH
```

**Mac/Linux:**
```bash
# Con Homebrew (Mac)
brew install ngrok

# O descargar desde https://ngrok.com/download
```

#### 2. Crear cuenta en ngrok (Gratis)

1. Ve a https://ngrok.com
2. Crea una cuenta gratuita
3. Obtén tu **authtoken** desde el dashboard

#### 3. Configurar ngrok

```bash
# Configurar authtoken (solo la primera vez)
ngrok config add-authtoken tu_authtoken_aqui
```

#### 4. Iniciar túnel ngrok

En una terminal separada:

```bash
# Iniciar túnel apuntando a tu servidor local
ngrok http 3000
```

Deberías ver algo como:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copia la URL HTTPS** (ej: `https://abc123.ngrok-free.app`)

#### 5. Actualizar URL Base en el Formulario

**Opción A: Modificar temporalmente el código**

En `app/(routes)/teacher/send-emails/components/SendEmailForm.tsx`, cambia temporalmente:

```typescript
const getBaseUrl = () => {
  // Para testing con ngrok, usa esta URL:
  return "https://abc123.ngrok-free.app/set-password";  // Reemplaza con tu URL de ngrok
  
  // O usa variable de entorno:
  // return process.env.NEXT_PUBLIC_APP_URL 
  //   ? `${process.env.NEXT_PUBLIC_APP_URL}/set-password`
  //   : typeof window !== "undefined" 
  //     ? `${window.location.origin}/set-password`
  //     : "";
};
```

**Opción B: Usar variable de entorno (Mejor)**

En `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
```

Luego reinicia el servidor:
```bash
npm run dev
```

#### 6. Probar el flujo completo

1. **Crear usuario estudiante** con curso asignado
2. **Enviar email** desde `/teacher/send-emails`
3. **Abrir el email** recibido
4. **Hacer clic en el link** de reset password
5. **Verificar** que abre la página `/set-password?token=...`
6. **Establecer contraseña**
7. **Iniciar sesión** con el nuevo usuario

---

## 🐛 Debugging

### Ver logs del servidor

Cuando envíes emails, deberías ver en la consola:

```
[CREATE_USER] Datos recibidos: { email: '...', role: 'STUDENT', courseId: '...' }
[CREATE_USER] Creando Purchase para estudiante ... con curso ...
[CREATE_USER] Purchase creado exitosamente: ...
[GET_STUDENTS] Purchases encontradas para curso ...: 1
[GET_STUDENTS] Estudiantes filtrados: 1
[SEND_PASSWORD_LINKS] Enviando email a estudiante@example.com
✅ Email enviado exitosamente. ID: ...
```

### Verificar que Purchase se creó

Puedes verificar directamente en la base de datos:

```sql
-- Verificar Purchases
SELECT * FROM "Purchase" WHERE "courseId" = 'tu-course-id';

-- Verificar usuarios estudiantes
SELECT u.email, u.role, p."courseId" 
FROM "User" u 
JOIN "Purchase" p ON u.id = p."userId" 
WHERE u.role = 'STUDENT';
```

### Errores comunes

1. **"RESEND_API_KEY no configurada"**
   - Verifica que `RESEND_API_KEY` esté en `.env.local`
   - Reinicia el servidor después de agregar variables

2. **"Nessuno studente ha acquistato questo corso"**
   - Verifica que el usuario tenga `role = 'STUDENT'`
   - Verifica que exista un `Purchase` para ese usuario y curso
   - Revisa los logs de `[GET_STUDENTS]`

3. **Email no llega**
   - Verifica que `RESEND_FROM_EMAIL` sea válido
   - Si usas `onboarding@resend.dev`, verifica que Resend esté funcionando
   - Revisa la bandeja de spam

---

## ✅ Checklist de Testing

- [ ] Variables de entorno configuradas (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Usuario estudiante creado con curso asignado
- [ ] Purchase creado correctamente (verificar en BD o logs)
- [ ] Email enviado exitosamente (ver logs)
- [ ] Email recibido en la bandeja de entrada
- [ ] Link de reset password funciona (si usas ngrok)
- [ ] Página `/set-password` carga correctamente
- [ ] Contraseña se establece correctamente
- [ ] Usuario puede iniciar sesión con nueva contraseña

---

## 🎯 Próximos Pasos

Una vez que funcione en local:

1. **Probar en producción** (Vercel)
2. **Configurar dominio verificado** en Resend (para usar `noreply@tu-dominio.com`)
3. **Configurar `NEXT_PUBLIC_APP_URL`** en producción

---

## 📝 Notas

- **ngrok gratuito**: La URL cambia cada vez que reinicias ngrok. Para URLs fijas, necesitas plan de pago.
- **Resend gratuito**: 100 emails/día, suficiente para testing.
- **Testing en producción**: Una vez desplegado, puedes probar directamente sin ngrok.


