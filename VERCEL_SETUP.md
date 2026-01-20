# Configuración de Vercel para elpatio-appCajeros

Esta guía explica cómo desplegar la aplicación de cajeros en Vercel.

## 📋 Requisitos Previos

- Cuenta en Vercel (gratuita): https://vercel.com
- Repositorio `elpatio-appCajeros` en GitHub
- Acceso al backend en Fly.io

## 🚀 Pasos para Desplegar

### 1. Conectar Repositorio en Vercel

1. Ve a https://vercel.com/dashboard
2. Inicia sesión o crea una cuenta
3. Haz clic en **"Add New..."** → **"Project"**
4. En la sección **"Import Git Repository"**:
   - Busca `elpatio-appCajeros` en la lista
   - O haz clic en **"Adjust GitHub App Permissions"** si no aparece
   - Autoriza el acceso al repositorio si es necesario
5. Selecciona el repositorio `iamp15/elpatio-appCajeros`

### 2. Configurar el Proyecto

En la pantalla de configuración del proyecto:

#### Framework Preset
- Selecciona **"Other"** o déjalo en **"Other"** (Vercel lo detectará automáticamente)

#### Root Directory
- Deja en `./` (raíz del repositorio)

#### Build and Output Settings
- **Build Command**: Deja vacío o `echo 'No build needed'`
  - Vercel usará el `vercel.json` que ya está configurado
- **Output Directory**: `./` (o déjalo vacío, Vercel lo detectará)
- **Install Command**: `npm install` (opcional, solo si hay dependencias)

#### Environment Variables
- **No se requieren variables de entorno** para esta app
- La URL del backend está configurada directamente en `js/config.js` como `https://elpatio-backend.fly.dev`

### 3. Desplegar

1. Haz clic en el botón **"Deploy"**
2. Vercel comenzará a:
   - Clonar el repositorio
   - Instalar dependencias (si hay `package.json`)
   - Desplegar los archivos estáticos
3. Espera a que termine el despliegue (1-2 minutos)

### 4. Obtener URL de Producción

Después del despliegue exitoso:

- **URL de Producción**: `https://elpatio-appcajeros.vercel.app` (o similar)
- **URL de Preview**: Se genera automáticamente para cada push a ramas que no sean `main`

### 5. Verificar el Despliegue

1. Abre la URL de producción en tu navegador
2. Verifica que la aplicación carga correctamente
3. Abre la consola del navegador (F12) y verifica:
   - No hay errores de carga
   - Las peticiones van a `https://elpatio-backend.fly.dev`
   - No hay errores de CORS

### 6. Actualizar CORS en el Backend

⚠️ **IMPORTANTE**: Debes actualizar CORS en el backend para permitir solicitudes desde la nueva URL.

En el backend en Fly.io, ejecuta:

```bash
cd elpatio-backend

# Verificar CORS actual
fly secrets list

# Agregar la nueva URL a CORS_ORIGIN
fly secrets set CORS_ORIGIN="https://elpatio-miniapps.vercel.app,https://elpatio-miniapps-*.vercel.app,https://elpatio-appcajeros.vercel.app,https://elpatio-appcajeros-*.vercel.app"
```

O si ya tienes un dominio personalizado configurado:

```bash
fly secrets set CORS_ORIGIN="https://elpatio.games,https://*.elpatio.games,https://elpatio-miniapps.vercel.app,https://elpatio-appcajeros.vercel.app"
```

**Nota**: Reemplaza `elpatio-appcajeros` con el nombre real de tu proyecto en Vercel si es diferente.

### 7. Configurar Dominio Personalizado (Opcional)

Si quieres usar un dominio personalizado:

1. En Vercel, ve a **Settings** → **Domains**
2. Haz clic en **"Add"**
3. Ingresa tu dominio (ej: `cajeros.elpatio.games`)
4. Sigue las instrucciones para configurar los registros DNS
5. Espera a que se verifique el dominio (puede tardar unos minutos)
6. Actualiza `CORS_ORIGIN` en el backend con el nuevo dominio

## 🔄 Despliegues Automáticos

Vercel despliega automáticamente cuando:

- Haces push a la rama `main` → Despliegue de producción
- Haces push a otras ramas → Despliegue de preview
- Creas un Pull Request → Despliegue de preview para revisión

## 📝 Configuración Actual

La aplicación está configurada con:

- **vercel.json**: Configuración de rewrites y headers para Telegram Web Apps
- **Headers**: `X-Frame-Options: ALLOWALL` y `Content-Security-Policy: frame-ancestors *`
- **Backend URL**: Hardcodeada en `js/config.js` como `https://elpatio-backend.fly.dev`

## 🧪 Testing Local

Para probar localmente antes de desplegar:

```bash
cd elpatio-appCajeros
npm install
npm start
```

Luego abre `http://localhost:3000` en tu navegador.

## ❓ Solución de Problemas

### Error: "Build failed"

- Verifica que `vercel.json` esté en la raíz del repositorio
- Asegúrate de que no haya errores de sintaxis en los archivos

### Error de CORS

- Verifica que hayas actualizado `CORS_ORIGIN` en el backend
- Asegúrate de incluir tanto la URL de producción como las de preview (`*.vercel.app`)

### La app no carga

- Verifica la consola del navegador para errores
- Revisa que la URL del backend en `js/config.js` sea correcta
- Verifica que el backend esté funcionando

### Service Worker no funciona

- Verifica que `sw.js` esté en la raíz del repositorio
- Asegúrate de que el service worker se registre correctamente en `index.html` o `app.js`

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Configuración de Vercel](https://vercel.com/docs/projects/configuration)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)
