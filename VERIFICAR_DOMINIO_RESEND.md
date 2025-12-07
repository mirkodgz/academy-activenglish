# 🔐 Guía: Verificar Dominio en Resend

## 📋 Requisitos Previos

- ✅ Cuenta en Resend (ya la tienes)
- ✅ Acceso al panel de control de tu dominio (`activenglish.com`)
- ✅ Permisos para agregar registros DNS

---

## 🚀 Pasos para Verificar tu Dominio

### Paso 1: Acceder a Resend Domains

1. Ve a https://resend.com
2. Inicia sesión en tu cuenta
3. En el menú lateral, ve a **"Domains"** o directamente a: https://resend.com/domains

### Paso 2: Agregar tu Dominio

1. Click en el botón **"Add Domain"** o **"Add New Domain"**
2. Ingresa tu dominio: `activenglish.com`
   - ⚠️ **NO** incluyas `www` ni `http://` ni `https://`
   - Solo: `activenglish.com`
3. Click en **"Add Domain"** o **"Continue"**

### Paso 3: Obtener los Registros DNS

Resend te mostrará **3 registros DNS** que necesitas agregar:

#### 1. **Registro SPF** (TXT)
```
Tipo: TXT
Nombre: @ (o activenglish.com)
Valor: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (o el que recomiende Resend)
```

#### 2. **Registro DKIM** (TXT)
```
Tipo: TXT
Nombre: resend._domainkey (o el que te indique Resend)
Valor: [Un valor largo que Resend te dará, algo como:]
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
TTL: 3600
```

#### 3. **Registro DMARC** (TXT) - Opcional pero recomendado
```
Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:dmarc@activenglish.com
TTL: 3600
```

### Paso 4: Agregar Registros DNS en tu Proveedor

**Dónde agregar los registros DNS:**

Depende de dónde tengas registrado tu dominio `activenglish.com`. Algunos proveedores comunes:

#### Si tu dominio está en:
- **Cloudflare**: Cloudflare Dashboard → DNS → Records → Add Record
- **GoDaddy**: GoDaddy DNS Management → Add Record
- **Namecheap**: Namecheap Domain List → Manage → Advanced DNS
- **Google Domains**: Google Domains → DNS → Custom Records
- **Otro proveedor**: Busca "DNS Management" o "DNS Records" en tu panel

**Cómo agregar cada registro:**

1. **SPF Record:**
   - Tipo: `TXT`
   - Nombre/Host: `@` o `activenglish.com` (depende del proveedor)
   - Valor: `v=spf1 include:_spf.resend.com ~all`
   - TTL: `3600` o `Auto`

2. **DKIM Record:**
   - Tipo: `TXT`
   - Nombre/Host: `resend._domainkey` (o el que te indique Resend)
   - Valor: [El valor largo que Resend te dio]
   - TTL: `3600` o `Auto`

3. **DMARC Record (Opcional):**
   - Tipo: `TXT`
   - Nombre/Host: `_dmarc`
   - Valor: `v=DMARC1; p=none; rua=mailto:dmarc@activenglish.com`
   - TTL: `3600` o `Auto`

### Paso 5: Esperar la Verificación

1. Después de agregar los registros DNS, vuelve a Resend
2. Click en **"Verify Domain"** o **"Check Verification"**
3. La verificación puede tardar:
   - **Mínimo**: 5-10 minutos
   - **Típico**: 15-30 minutos
   - **Máximo**: Hasta 48 horas (raro)

**⚠️ Nota**: Los cambios DNS pueden tardar en propagarse. Si no se verifica inmediatamente, espera unos minutos y vuelve a intentar.

### Paso 6: Verificar que Está Verificado

Una vez verificado, deberías ver:
- ✅ Estado: **"Verified"** o **"Active"**
- ✅ Checkmarks verdes en todos los registros
- ✅ Mensaje de éxito

---

## 🔧 Configurar en tu Proyecto

Una vez que tu dominio esté verificado:

### 1. Actualizar `.env.local`

```env
RESEND_FROM_EMAIL=noreply@activenglish.com
# O también puedes usar:
# RESEND_FROM_EMAIL=support@activenglish.it
```

### 2. Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C) y reinícialo
npm run dev
```

### 3. Probar el Envío

1. Ve a `/teacher/send-emails`
2. Envía un email de prueba
3. Debería funcionar sin errores
4. El email llegará desde `noreply@activenglish.com`

---

## 🐛 Troubleshooting

### Problema: Los registros DNS no se verifican

**Solución:**
1. Verifica que copiaste exactamente los valores (sin espacios extra)
2. Espera más tiempo (hasta 48 horas)
3. Usa herramientas de verificación DNS:
   - https://mxtoolbox.com/spf.aspx (para SPF)
   - https://mxtoolbox.com/dkim.aspx (para DKIM)
4. Verifica que los registros están en el proveedor correcto

### Problema: "Domain already exists"

**Solución:**
- El dominio ya está agregado en Resend
- Ve a la lista de dominios y verifica su estado

### Problema: "Invalid domain format"

**Solución:**
- Asegúrate de que NO incluyas:
  - `www.`
  - `http://`
  - `https://`
- Solo el dominio: `activenglish.com`

---

## ✅ Checklist de Verificación

- [ ] Cuenta en Resend creada
- [ ] Dominio agregado en Resend
- [ ] Registro SPF agregado en DNS
- [ ] Registro DKIM agregado en DNS
- [ ] Registro DMARC agregado en DNS (opcional)
- [ ] Esperado tiempo de propagación (15-30 min)
- [ ] Dominio verificado en Resend
- [ ] `RESEND_FROM_EMAIL` actualizado en `.env.local`
- [ ] Servidor reiniciado
- [ ] Email de prueba enviado exitosamente

---

## 📝 Notas Importantes

1. **Propagación DNS**: Los cambios DNS pueden tardar hasta 48 horas, pero normalmente es 15-30 minutos.

2. **Múltiples registros SPF**: Si ya tienes un registro SPF, debes combinarlo:
   ```
   v=spf1 include:_spf.resend.com include:otro-servicio.com ~all
   ```

3. **Subdominios**: Si quieres usar `noreply@activenglish.com`, no necesitas configurar nada adicional. El dominio principal (`activenglish.com`) cubre todos los subdominios.

4. **Plan Gratuito**: Con el plan gratuito de Resend puedes enviar 100 emails/día desde tu dominio verificado.

---

## 🎯 Después de Verificar

Una vez verificado, podrás:
- ✅ Enviar emails a **cualquier destinatario**
- ✅ Usar `noreply@activenglish.com` o `support@activenglish.it`
- ✅ Emails más profesionales desde tu dominio
- ✅ Sin limitación de destinatarios (solo límite de cantidad según plan)

---

## 💡 Tip

Si tienes problemas, puedes usar herramientas online para verificar tus registros DNS:
- https://mxtoolbox.com/
- https://dnschecker.org/

