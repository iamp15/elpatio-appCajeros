# Portal de Cajeros - El Patio

Aplicación web para que los cajeros gestionen las solicitudes de depósitos y retiros en el sistema El Patio.

## 📋 Información del Proyecto

- **Repositorio**: `elpatio-appCajeros`
- **URL de Producción**: https://elpatio-app-cajeros.vercel.app/
- **Estado**: En desarrollo (pruebas locales)
- **Backend**: https://elpatio-backend.fly.dev

## 🏗️ Arquitectura Modular

La aplicación está dividida en módulos independientes que manejan responsabilidades específicas:

```
elpatio-appCajeros/
├── index.html              # Estructura HTML principal
├── styles.css              # Estilos CSS responsivos
├── app.js                  # Aplicación principal (coordinador)
├── sw.js                   # Service Worker para notificaciones push
├── server.js               # Servidor Express para desarrollo local
├── vercel.json             # Configuración de Vercel
├── package.json            # Dependencias y scripts
├── js/                     # Módulos JavaScript
│   ├── config.js           # Configuración centralizada
│   ├── auth.js             # Gestión de autenticación
│   ├── api.js              # Comunicación con el backend
│   ├── ui.js               # Gestión de interfaz de usuario
│   ├── transactions.js     # Gestión de transacciones
│   ├── history.js          # Gestión del historial
│   ├── websocket.js        # Cliente WebSocket
│   ├── notifications.js    # Sistema de notificaciones toast
│   ├── notification-manager.js # Gestor de notificaciones persistentes
│   └── push-notifications.js  # Notificaciones push del navegador
└── README.md               # Esta documentación
```

## 🚀 Desarrollo Local

### Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Backend corriendo en https://elpatio-backend.fly.dev (o localmente en puerto 3001)
- Puerto 3003 disponible (puerto por defecto para desarrollo local)

### Instalación

```bash
# Clonar el repositorio (si es necesario)
cd elpatio-appCajeros

# Instalar dependencias
npm install
```

### Ejecutar en Desarrollo

```bash
# Iniciar servidor de desarrollo local
npm start
# o
npm run dev

# La aplicación estará disponible en:
# http://localhost:3003
```

### Configuración

La aplicación se conecta directamente al backend en producción:
- **Backend URL**: `https://elpatio-backend.fly.dev` (configurado en `js/config.js`)

Para desarrollo local con backend local, modifica `js/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: "http://localhost:3001", // Cambiar a tu backend local
  // ...
};
```

## 📦 Despliegue

### Vercel (Producción)

La aplicación está desplegada automáticamente en Vercel:

- **URL**: https://elpatio-app-cajeros.vercel.app/
- **Despliegue automático**: Cada push a `main` despliega automáticamente
- **Preview deployments**: Cada push a otras ramas crea un preview

Ver [VERCEL_SETUP.md](./VERCEL_SETUP.md) para más detalles sobre la configuración.

### Variables de Entorno

No se requieren variables de entorno. La URL del backend está configurada directamente en `js/config.js`.

## 🔧 Estructura de Módulos

### `config.js` - Configuración
Centraliza toda la configuración:
- URLs de la API y endpoints
- Claves de localStorage
- Mensajes de la aplicación
- Configuración de UI
- Estados y tipos de transacciones

### `auth.js` - Autenticación
Maneja la autenticación de cajeros:
- Login/logout con email y contraseña
- Verificación de tokens JWT
- Gestión de sesiones
- Persistencia de tokens en localStorage

### `api.js` - Comunicación con Backend
Encapsula todas las llamadas a la API:
- Requests HTTP genéricos y autenticados
- Endpoints específicos del backend
- Manejo de errores de conexión

### `ui.js` - Interfaz de Usuario
Gestiona la interacción con el DOM:
- Referencias a elementos del DOM
- Manipulación de pantallas y estados
- Event listeners
- Modales y alertas

### `transactions.js` - Gestión de Transacciones
Maneja la lógica de transacciones:
- Carga de transacciones pendientes
- Visualización de transacciones
- Aceptación de transacciones
- Formateo de datos

### `websocket.js` - Cliente WebSocket
Maneja la conexión WebSocket en tiempo real:
- Conexión al servidor WebSocket
- Autenticación WebSocket
- Manejo de eventos en tiempo real
- Reconexión automática

## 🛠️ API Endpoints Utilizados

- `POST /api/cajeros/login` - Autenticación de cajeros
- `GET /api/cajeros/mi-perfil` - Obtener información del cajero autenticado
- `GET /api/transacciones/pendientes-cajero` - Obtener transacciones pendientes
- `PUT /api/transacciones/:id/asignar-cajero` - Asignar cajero a transacción
- `GET /api/transacciones/:id` - Obtener detalles de transacción

## 🔄 Flujo de Trabajo de Desarrollo

1. **Desarrollo Local**:
   - Trabajar en el código localmente
   - Probar cambios con `npm start`
   - Verificar que todo funcione correctamente

2. **Commit y Push**:
   - Hacer commit de los cambios
   - Push a la rama correspondiente
   - Vercel despliega automáticamente

3. **Pruebas en Producción**:
   - Verificar en https://elpatio-app-cajeros.vercel.app/
   - Probar funcionalidades críticas
   - Revisar logs si hay problemas

## 📝 Notas Importantes

- **Estado de Desarrollo**: Esta aplicación está en etapa de desarrollo activo
- **Pruebas**: Las pruebas se realizan principalmente en ambiente local
- **Backend**: Requiere que el backend esté corriendo y accesible
- **CORS**: El backend debe tener configurado CORS para permitir solicitudes desde Vercel

## 🔍 Debugging

### Logs de Consola

La aplicación incluye logs detallados:
- `✅` - Operaciones exitosas
- `❌` - Errores
- `⏰` - Eventos de tiempo (tokens expirados)
- `👋` - Eventos de usuario (logout)
- `🔄` - Eventos de WebSocket

### Herramientas de Desarrollo

- Abrir DevTools del navegador (F12)
- Revisar la consola para logs
- Verificar el estado de los módulos en `window.CajerosApp`
- Inspeccionar elementos del DOM
- Revisar la pestaña Network para peticiones HTTP
- Revisar la pestaña Application para localStorage y Service Workers

## 📚 Documentación Adicional

- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Guía de configuración de Vercel
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guía de migración desde elpatio-miniapps

## 🚀 Próximas Mejoras

- [ ] Mejoras en la interfaz de usuario
- [ ] Optimización de rendimiento
- [ ] Tests unitarios
- [ ] Mejoras en notificaciones push
- [ ] Modo offline con sincronización
