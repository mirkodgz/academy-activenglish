# 🔐 Guía: Crear Token de GitHub y Subir Proyecto

## Paso 1: Crear Personal Access Token (PAT) en GitHub

### 1.1. Ir a la configuración de tokens
1. Ve a https://github.com
2. Click en tu **avatar** (esquina superior derecha)
3. Click en **Settings**
4. En el menú lateral izquierdo, ve al final y click en **Developer settings**
5. Click en **Personal access tokens** → **Tokens (classic)**
6. Click en **Generate new token** → **Generate new token (classic)**

### 1.2. Configurar el token
1. **Note**: Pon un nombre descriptivo, ej: `ActiveEnglish-Project`
2. **Expiration**: Elige cuánto tiempo quieres que dure (90 días, 1 año, o sin expiración)
3. **Select scopes** (permisos): Marca las siguientes casillas:
   - ✅ **repo** (todo) - Necesario para subir código
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events
   - ✅ **workflow** - Si usas GitHub Actions (opcional pero recomendado)

### 1.3. Generar y copiar el token
1. Click en **Generate token** (al final de la página)
2. ⚠️ **IMPORTANTE**: Copia el token inmediatamente, solo se muestra una vez
   - Formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. Guárdalo en un lugar seguro (no lo compartas)

## Paso 2: Configurar Git en tu proyecto

### 2.1. Inicializar Git (si no está inicializado)
```bash
git init
```

### 2.2. Configurar tu usuario de Git (si no está configurado)
```bash
git config user.name "Tu Nombre"
git config user.email "tu-email@ejemplo.com"
```

O configurarlo globalmente:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### 2.3. Verificar que .gitignore esté correcto
Asegúrate de que tu `.gitignore` incluya:
- `.env` y `.env.local` (archivos con secretos)
- `node_modules/`
- `.next/`
- Archivos sensibles

## Paso 3: Crear repositorio en GitHub

### Opción A: Desde GitHub Web
1. Ve a https://github.com
2. Click en el botón **+** (esquina superior derecha) → **New repository**
3. **Repository name**: `activeEnglish` (o el nombre que prefieras)
4. **Description**: (opcional) "Plataforma de aprendizaje online para cursos de inglés"
5. **Visibility**: 
   - ✅ **Private** (recomendado si tiene secretos)
   - O **Public** (si quieres que sea público)
6. ❌ **NO marques** "Initialize this repository with a README"
7. Click en **Create repository**

### Opción B: Desde la línea de comandos (después de crear el repo en GitHub)
Solo necesitas la URL del repositorio que GitHub te dará.

## Paso 4: Conectar tu proyecto local con GitHub

### 4.1. Agregar el repositorio remoto
```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
```

**Ejemplo:**
```bash
git remote add origin https://github.com/tuusuario/activeEnglish.git
```

### 4.2. Verificar que se agregó correctamente
```bash
git remote -v
```

Deberías ver:
```
origin  https://github.com/TU-USUARIO/TU-REPOSITORIO.git (fetch)
origin  https://github.com/TU-USUARIO/TU-REPOSITORIO.git (push)
```

## Paso 5: Agregar archivos y hacer commit

### 5.1. Agregar todos los archivos
```bash
git add .
```

### 5.2. Hacer el primer commit
```bash
git commit -m "Initial commit: Active English platform"
```

## Paso 6: Subir código usando el token

### 6.1. Push usando el token
Cuando hagas `git push`, Git te pedirá credenciales:

**Usuario**: Tu nombre de usuario de GitHub  
**Contraseña**: **Pega aquí tu Personal Access Token** (no tu contraseña de GitHub)

```bash
git branch -M main
git push -u origin main
```

### 6.2. Si te pide credenciales
- **Username**: `tu-usuario-github`
- **Password**: `ghp_tu-token-aqui` (el token que copiaste)

### 6.3. Alternativa: Usar el token en la URL (más fácil)
Puedes incluir el token directamente en la URL del remote:

```bash
git remote set-url origin https://TU-TOKEN@github.com/TU-USUARIO/TU-REPOSITORIO.git
```

**Ejemplo:**
```bash
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/tuusuario/activeEnglish.git
```

Luego simplemente:
```bash
git push -u origin main
```

## Paso 7: Verificar que se subió correctamente

1. Ve a tu repositorio en GitHub: `https://github.com/TU-USUARIO/TU-REPOSITORIO`
2. Deberías ver todos tus archivos allí

## 🔒 Seguridad del Token

### ⚠️ IMPORTANTE:
- **NUNCA** subas el token al repositorio
- **NUNCA** lo compartas públicamente
- Si el token se compromete, revócalo inmediatamente:
  1. GitHub → Settings → Developer settings → Personal access tokens
  2. Click en el token
  3. Click en **Revoke**

### Guardar el token de forma segura:
- Usa un gestor de contraseñas (1Password, LastPass, etc.)
- O guárdalo en un archivo local que NO esté en el repositorio
- Puedes usar variables de entorno de Windows

## 🛠️ Comandos Rápidos de Referencia

```bash
# Inicializar Git
git init

# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu-email@ejemplo.com"

# Agregar remoto
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git

# O con token en la URL
git remote set-url origin https://TU-TOKEN@github.com/TU-USUARIO/TU-REPOSITORIO.git

# Agregar archivos
git add .

# Commit
git commit -m "Mensaje del commit"

# Subir código
git push -u origin main

# Verificar remoto
git remote -v
```

## 📝 Notas Adicionales

- Si ya tienes un repositorio Git configurado pero con otro remoto, puedes:
  ```bash
  git remote remove origin
  git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
  ```

- Para futuros pushes, solo necesitas:
  ```bash
  git add .
  git commit -m "Descripción de cambios"
  git push
  ```

- Si usas el token en la URL del remote, no necesitarás ingresarlo cada vez.

