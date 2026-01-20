/**
 * Servicio de notificaciones
 */

import notificationListManager from "../notification-manager.js";
import browserNotifications from "../push-notifications.js";

/**
 * Clase para gestionar el servicio de notificaciones
 */
export class NotificationsService {
  /**
   * Inicializar sistema de notificaciones
   */
  static async init() {
    try {
      console.log("🔔 Iniciando sistema de notificaciones...");

      // Inicializar gestor de notificaciones persistentes
      notificationListManager.init();

      // Inicializar notificaciones del navegador
      await browserNotifications.init();

      // Solicitar permisos de notificación (opcional, se puede hacer en login)
      // await browserNotifications.requestPermission();

      console.log("✅ Sistema de notificaciones iniciado");
    } catch (error) {
      console.error("❌ Error iniciando sistema de notificaciones:", error);
    }
  }

  /**
   * Manejar nueva notificación via WebSocket
   */
  static handleNuevaNotificacion(data) {
    try {
      const { tipo, titulo, mensaje, transaccionId } = data;

      console.log(`🔔 Notificación recibida - Tipo: ${tipo}`);

      // Mostrar notificación toast
      if (window.notificationManager) {
        window.notificationManager.info(titulo, mensaje);
      }

      // Mostrar notificación del navegador para eventos críticos
      // Solo si la app NO está enfocada
      if (tipo === "nueva_solicitud" || tipo === "pago_realizado") {
        browserNotifications.showCriticalNotification(tipo, {
          mensaje,
          transaccionId,
        });
      }

      // Agregar a la lista de notificaciones persistentes
      // (opcional, si queremos actualizar en tiempo real)
      // notificationListManager.addNotification(data);
    } catch (error) {
      console.error("❌ Error manejando nueva notificación:", error);
    }
  }
}
