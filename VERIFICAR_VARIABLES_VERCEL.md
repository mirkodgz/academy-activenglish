# 🔍 Verificar Variables de Entorno en Vercel

## ❌ Si el error persiste después de agregar DATABASE_URL

### Paso 1: Verificar que la variable existe

1. Ve a **Vercel Dashboard** → Tu proyecto
2. **Settings** → **Environment Variables**
3. Busca `DATABASE_URL` en la lista
4. **Verifica que:**
   - ✅ El nombre sea exactamente `DATABASE_URL` (sin espacios, sin prefijos)
   - ✅ Esté marcada para **Production** (al menos)
   - ✅ El valor sea correcto (debe empezar con `prisma+postgres://`)

### Paso 2: Verificar el ambiente del deployment

El error puede ocurrir si:
- La variable solo está marcada para "Development" pero el deployment es "Production"
- La variable solo está marcada para "Production" pero el deployment es "Preview"

**Solución:** Marca las 3 casillas (Production, Preview, Development) para `DATABASE_URL`

### Paso 3: Verificar que no hay espacios o caracteres especiales

1. Click en `DATABASE_URL` para editarla
2. Verifica que:
   - No haya espacios al inicio o final del nombre
   - No haya espacios al inicio o final del valor
   - El valor esté completo (no truncado)

### Paso 4: Hacer un nuevo deployment (no redeploy)

A veces un redeploy no recarga las variables. Prueba:

1. **Opción A: Hacer un commit vacío y push**
   ```bash
   git commit --allow-empty -m "Trigger new deployment"
   git push origin main
   ```

2. **Opción B: Cancelar y crear nuevo deployment**
   - Ve a **Deployments**
   - Cancela el deployment actual (si está en progreso)
   - Crea un nuevo deployment desde el último commit

### Paso 5: Verificar en los logs del build

1. Ve a **Deployments** → Click en el deployment
2. Revisa los logs del build
3. Busca si hay algún mensaje sobre variables de entorno
4. El script de verificación debería mostrar:
   ```
   ✅ DATABASE_URL está configurada
   ```

## 🔧 Solución Alternativa: Usar vercel.json

Si las variables no se cargan correctamente, puedes crear un archivo `vercel.json`:

```json
{
  "buildCommand": "node scripts/verify-env.js && prisma migrate deploy && next build",
  "env": {
    "DATABASE_URL": "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18wZEJaeFhOTFl0TGtVLUtBTFViQzIiLCJhcGlfa2V5IjoiMDFLQkQ4WlJZQVM1NzEzUFRSU1NTM1RIQU0iLCJ0ZW5hbnRfaWQiOiIyMjYxOWZkNjVhZWI4NjlmZWE4YjVjYTg5OTA0YmM1YjZiOWI4MWQxZmMyNzYxYWJhNTc2MDk1MzMzODYzMzgyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNWQ2MzI1NmMtMDk3ZS00OTE1LThiNTktMmExNjYyNmY5NTZlIn0.o9QV9DAw9qcl0LfPhRRczgJN40Oa5HAKKkDcrQr0oE0"
  }
}
```

**⚠️ NOTA:** No recomendado para producción, es mejor usar Environment Variables en Vercel.

## 📋 Checklist de Verificación

Antes de hacer otro deployment, verifica:

- [ ] `DATABASE_URL` existe en Vercel (Settings → Environment Variables)
- [ ] El nombre es exactamente `DATABASE_URL` (sin espacios, sin prefijos)
- [ ] Está marcada para **Production** (al menos)
- [ ] El valor es correcto (empieza con `prisma+postgres://`)
- [ ] No hay espacios al inicio o final del valor
- [ ] Has hecho un **nuevo deployment** (no solo redeploy)

## 🆘 Si nada funciona

1. **Elimina y vuelve a crear la variable:**
   - Elimina `DATABASE_URL` de Vercel
   - Vuelve a agregarla con el valor correcto
   - Marca las 3 casillas (Production, Preview, Development)
   - Guarda

2. **Verifica el proyecto correcto:**
   - Asegúrate de estar en el proyecto correcto de Vercel
   - Verifica que el repositorio conectado sea el correcto

3. **Contacta soporte de Vercel:**
   - Si después de todo esto el error persiste, puede ser un problema de Vercel
   - Contacta soporte con los logs del build

