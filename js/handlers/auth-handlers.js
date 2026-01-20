/**
 * Handlers de autenticación
 */

import { Auth } from "../auth.js";
import { UI } from "../ui.js";
import { MESSAGES } from "../config.js";
import browserNotifications from "../push-notifications.js";

/**
 * Crear handlers de autenticación
 */
export function createAuthHandlers(app) {
  return {
    /**
     * Manejar el envío del formulario de login
     */
    async handleLogin(e) {
      e.preventDefault();

      const formData = UI.getLoginFormData();
      if (!formData) {
        UI.showError(MESSAGES.ERROR.INCOMPLETE_FIELDS);
        return;
      }

      UI.setLoading(true);
      UI.hideError();

      try {
        await Auth.login(formData.email, formData.password);
      } catch (error) {
        console.error("Error en login:", error);
        UI.showError(error.message);
      } finally {
        UI.setLoading(false);
      }
    },

    /**
     * Manejar login exitoso
     */
    async handleLoginSuccess(cajeroInfo) {
      try {
        // Autenticar con WebSocket
        app.authenticateWithWebSocket(cajeroInfo);

        // Actualizar UI con información del cajero
        UI.updateCajeroDisplay(cajeroInfo);

        // Cargar transacciones pendientes
        await app.loadTransactions();

        // Mostrar dashboard
        UI.showDashboard();

        // Solicitar permisos de notificación (solo se hace una vez)
        try {
          await browserNotifications.requestPermission();
        } catch (error) {
          console.log("No se pudo solicitar permiso de notificaciones:", error);
        }

        // Crear notificación local de inicio de sesión
        if (window.notificationManager) {
          window.notificationManager.success(
            "Sesión iniciada",
            `Bienvenido ${cajeroInfo.nombreCompleto || cajeroInfo.email}`
          );
        }
      } catch (error) {
        console.error(`Error después del login exitoso: ${error.message}`);
        UI.showError("Error al cargar datos del dashboard");
      }
    },

    /**
     * Autenticar con WebSocket
     * @param {Object} cajeroInfo - Información del cajero
     * @param {number} retryCount - Contador de reintentos (interno)
     */
    authenticateWithWebSocket(cajeroInfo, retryCount = 0) {
      const maxRetries = 10; // Máximo 10 reintentos (20 segundos)
      
      if (window.cajeroWebSocket.isConnected) {
        const token = Auth.getToken();
        console.log("🔐 [LOGIN] WebSocket conectado, autenticando cajero...");
        window.cajeroWebSocket.authenticateCajero(token);
      } else {
        // Si el WebSocket no está conectado, reconectarlo primero
        // Esto es necesario después de un logout donde se desconecta el socket
        if (!window.cajeroWebSocket.socket) {
          console.log("🔄 [LOGIN] WebSocket desconectado, reconectando...");
          window.cajeroWebSocket.connect();
        }
        
        // Evitar reintentos infinitos
        if (retryCount >= maxRetries) {
          console.error("❌ [LOGIN] No se pudo conectar el WebSocket después de múltiples intentos");
          if (window.notificationManager) {
            window.notificationManager.error(
              "Error de conexión",
              "No se pudo establecer conexión con el servidor. Intenta recargar la página."
            );
          }
          return;
        }
        
        // Esperar y reintentar autenticación
        setTimeout(() => {
          app.authenticateWithWebSocket(cajeroInfo, retryCount + 1);
        }, 2000);
      }
    },

    /**
     * Manejar logout
     */
    handleLogout() {
      // Prevenir múltiples llamadas al logout
      if (app.isLoggingOut) {
        console.log("⚠️ [LOGOUT] Ya hay un logout en progreso, ignorando...");
        return;
      }
      app.isLoggingOut = true;

      // Emitir evento de logout al WebSocket para actualizar el estado en el backend
      if (window.cajeroWebSocket && window.cajeroWebSocket.isConnected && window.cajeroWebSocket.socket) {
        try {
          // Usar un callback para confirmar que el evento fue recibido
          // Esto asegura que el servidor procesó el logout antes de desconectar
          const socket = window.cajeroWebSocket.socket;
          
          // Verificar que el socket realmente esté conectado
          if (socket.connected) {
            console.log("🚪 [LOGOUT] Emitiendo evento logout-cajero...");
            
            // Flag para evitar doble llamada a finalizeLogout
            let logoutFinalized = false;
            
            // Emitir con callback para confirmar recepción
            socket.emit("logout-cajero", {}, (response) => {
              if (logoutFinalized) return; // Prevenir doble ejecución
              logoutFinalized = true;
              
              if (response && response.success) {
                console.log("✅ [LOGOUT] Servidor confirmó recepción del logout");
              }
              // Desconectar después de recibir confirmación
              app.finalizeLogout();
            });
            
            // Timeout de seguridad: desconectar después de 500ms aunque no haya confirmación
            setTimeout(() => {
              if (logoutFinalized) return; // Prevenir doble ejecución
              logoutFinalized = true;
              
              console.log("⏱️ [LOGOUT] Timeout: desconectando después de 500ms");
              app.finalizeLogout();
            }, 500);
            
            return; // Salir temprano, finalizeLogout se llamará después
          } else {
            console.warn("⚠️ [LOGOUT] Socket no está conectado, continuando con logout normal");
          }
        } catch (error) {
          console.error("❌ Error emitiendo logout-cajero:", error);
          // Si hay error, continuar con logout normal
        }
      }

      // Si no hay WebSocket conectado o hubo error, desconectar y continuar
      app.finalizeLogout();
    },

    /**
     * Finalizar desconexión y completar logout
     */
    finalizeLogout() {
      // Desconectar WebSocket
      if (window.cajeroWebSocket) {
        window.cajeroWebSocket.disconnect();
      }
      
      // Completar proceso de logout
      app.completeLogout();
      
      // Resetear flag de logout
      app.isLoggingOut = false;
    },

    /**
     * Completar proceso de logout (limpiar sesión, UI, etc.)
     */
    completeLogout() {
      // Crear notificación de cierre de sesión
      if (window.notificationManager) {
        window.notificationManager.info(
          "Sesión cerrada",
          "Has cerrado sesión correctamente"
        );
      }

      // Limpiar sesión en Auth
      Auth.logout();

      // Actualizar UI
      UI.showLoginScreen();

      // Limpiar transacciones
      app.getTransactionManager().clearTransactions();
    },

    /**
     * Manejar expiración de token
     */
    handleTokenExpired() {
      UI.showLoginScreen();
      app.getTransactionManager().clearTransactions();
      UI.showError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
    }
  };
}
