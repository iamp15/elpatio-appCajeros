/**
 * Handlers de navegación
 */

import { UI } from "../ui.js";
import { HistoryManager } from "../history.js";
import { TransactionManager } from "../transactions.js";
import { Auth } from "../auth.js";
import { saldoManager } from "../saldo.js";

/**
 * Crear handlers de navegación
 */
export function createNavigationHandlers(app) {
  return {
    /**
     * Manejar refresh de transacciones
     */
    async handleRefresh() {
      if (Auth.isAuthenticated()) {
        await app.loadTransactions();
      }
    },

    /**
     * Manejar cambio de pestaña
     */
    handleTabSwitch(tabName) {
      TransactionManager.switchTab(tabName);
    },

    /**
     * Manejar navegación desde el menú lateral
     */
    handleNavigate(screen) {
      UI.navigateToScreen(screen);

      // Acciones específicas por pantalla
      switch (screen) {
        case "dashboard":
          // Recargar transacciones al volver al dashboard
          app.loadTransactions();
          break;
        case "historial":
          // Mostrar estado inicial del historial
          HistoryManager.showInitialState();
          break;
        case "saldo":
          // Cargar saldo actual y mostrar estado inicial del historial
          if (Auth.isAuthenticated()) {
            const token = Auth.getToken();
            // Mostrar spinner inicialmente (siempre, para indicar que se está cargando)
            saldoManager.mostrarCargaSaldo(true);
            saldoManager.cargarSaldoActual(token);
            saldoManager.showInitialState();
          }
          break;
        case "perfil":
          // Actualizar estado de conexión
          app.updateConnectionStatus();
          break;
      }
    },

    /**
     * Actualizar estado de conexión WebSocket en el perfil
     */
    updateConnectionStatus() {
      const connected = window.cajeroWebSocket?.isConnected && 
                        window.cajeroWebSocket?.isAuthenticated;
      UI.updateConnectionStatus(connected);
    }
  };
}
