# 🧪 Configurar ngrok para Testing Local

## 📋 Pasos Rápidos

### 1. Verificar que ngrok está instalado

```bash
ngrok version
```

Si no está instalado, instálalo:
- **Windows**: `choco install ngrok` o descarga desde https://ngrok.com/download
- **Mac**: `brew install ngrok`
- **Linux**: Descarga desde https://ngrok.com/download

### 2. Configurar authtoken (solo primera vez)

Si aún no lo has hecho:

```bash
ngrok config add-authtoken tu_authtoken_de_ngrok
```

Obtén tu authtoken desde: https://dashboard.ngrok.com/get-started/your-authtoken

### 3. Iniciar ngrok

**Opción A: Manual (Recomendado)**

En una terminal separada:

```bash
ngrok http 3000
```

Deberías ver algo como:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Opción B: Con script helper**

```bash
node scripts/start-ngrok.js
```

### 4. Copiar la URL de ngrok

Copia la URL HTTPS que aparece (ej: `https://abc123.ngrok-free.app`)

### 5. Actualizar `.env.local`

Agrega o actualiza esta línea:

```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
```

**⚠️ IMPORTANTE**: Reemplaza `abc123.ngrok-free.app` con tu URL real de ngrok.

### 6. Reiniciar el servidor Next.js

```bash
# Detén el servidor (Ctrl+C) y reinícialo
npm run dev
```

### 7. Verificar que funciona

1. Ve a `/teacher/send-emails`
2. El campo "URL Base del Enlace" debería mostrar: `https://tu-url-ngrok.ngrok-free.app/set-password`
3. Si muestra la URL de ngrok, ¡está configurado correctamente!

---

## 🧪 Probar el Flujo Completo

1. **Crear usuario estudiante** con curso asignado
2. **Enviar email** desde `/teacher/send-emails`
3. **Abrir el email** recibido
4. **Hacer clic en el link** de reset password
5. **Verificar** que abre la página correcta (debería usar la URL de ngrok)
6. **Establecer contraseña**
7. **Iniciar sesión** con el nuevo usuario

---

## 🔄 Cuando Reinicies ngrok

Si reinicias ngrok, la URL cambiará. Entonces:

1. Copia la nueva URL de ngrok
2. Actualiza `NEXT_PUBLIC_APP_URL` en `.env.local`
3. Reinicia el servidor Next.js

---

## 💡 Tips

- **Mantén ngrok corriendo** mientras pruebas
- **No cierres la terminal** donde corre ngrok
- **Usa la misma terminal** para ngrok y otra para `npm run dev`
- **URLs gratuitas cambian** cada vez que reinicias ngrok

---

## ✅ Checklist

- [ ] ngrok instalado y configurado
- [ ] ngrok corriendo (`ngrok http 3000`)
- [ ] URL de ngrok copiada
- [ ] `NEXT_PUBLIC_APP_URL` actualizado en `.env.local`
- [ ] Servidor Next.js reiniciado
- [ ] Campo "URL Base" muestra URL de ngrok
- [ ] Test completo funcionando


