/**
 * Aplicación principal de cajeros - Versión modular
 * @version 0.11.0 - Refactorizado en módulos
 */

import { Auth } from "./js/auth.js";
import { UI } from "./js/ui.js";
import { TransactionManager } from "./js/transactions.js";
import { HistoryManager } from "./js/history.js";
import { API_CONFIG } from "./js/config.js";
import "./js/notifications.js"; // Importar sistema de notificaciones toast

// Importar handlers
import { setupWebSocketHandlers } from "./js/handlers/websocket-handlers.js";
import { createAuthHandlers } from "./js/handlers/auth-handlers.js";
import { createTransactionHandlers } from "./js/handlers/transaction-handlers.js";
import { createHistoryHandlers } from "./js/handlers/history-handlers.js";
import { createNavigationHandlers } from "./js/handlers/navigation-handlers.js";

// Importar servicios
import { NotificationsService } from "./js/services/notifications-service.js";

// Importar utilidades
import { setupGlobalFunctions } from "./js/utils/globals.js";

// Constante de versión
const APP_VERSION = "0.11.0"; // Refactorizado en módulos

/**
 * Clase principal de la aplicación
 */
class CajerosApp {
  constructor() {
    this.isInitialized = false;
    this.isLoggingOut = false; // Flag para prevenir múltiples llamadas al logout
    this.processedTransactions = new Set(); // Para evitar duplicados
    this.version = APP_VERSION;

    // Inicializar handlers
    this.authHandlers = createAuthHandlers(this);
    this.transactionHandlers = createTransactionHandlers(this);
    this.historyHandlers = createHistoryHandlers(this);
    this.navigationHandlers = createNavigationHandlers(this);
  }

  /**
   * Inicializar la aplicación
   */
  async init() {
    if (this.isInitialized) return;

    try {
      console.log(
        `🚀 Iniciando aplicación de cajeros v${this.version} [ALPHA]...`
      );

      // Configurar WebSocket
      setupWebSocketHandlers(this);

      // Configurar callbacks de autenticación
      Auth.setCallbacks({
        onLoginSuccess: this.authHandlers.handleLoginSuccess.bind(this.authHandlers),
        onTokenExpired: this.authHandlers.handleTokenExpired.bind(this.authHandlers),
      });

      // Configurar callbacks de transacciones
      TransactionManager.setCallbacks({
        onTransactionAssigned: this.transactionHandlers.handleTransactionAssigned.bind(this.transactionHandlers),
        onTransactionError: this.transactionHandlers.handleTransactionError.bind(this.transactionHandlers),
      });

      // Configurar event listeners de la UI
      UI.setupEventListeners({
        onLogin: this.authHandlers.handleLogin.bind(this.authHandlers),
        onLogout: this.authHandlers.handleLogout.bind(this.authHandlers),
        onRefresh: this.navigationHandlers.handleRefresh.bind(this.navigationHandlers),
        onTabSwitch: this.navigationHandlers.handleTabSwitch.bind(this.navigationHandlers),
        onNavigate: this.navigationHandlers.handleNavigate.bind(this.navigationHandlers),
        onApplyHistoryFilters: this.historyHandlers.handleApplyHistoryFilters.bind(this.historyHandlers),
        onClearHistoryFilters: this.historyHandlers.handleClearHistoryFilters.bind(this.historyHandlers),
        onLoadMoreHistory: this.historyHandlers.handleLoadMoreHistory.bind(this.historyHandlers),
      });

      // Inicializar autenticación
      await Auth.init();

      // Inicializar sistema de notificaciones
      await NotificationsService.init();

      // Hacer disponibles las instancias globalmente para uso en HTML
      window.transactionManager = TransactionManager;
      window.historyManager = HistoryManager;
      window.CajerosApp = this;
      window.API_CONFIG = API_CONFIG;

      // Configurar funciones globales
      setupGlobalFunctions(this);

      this.isInitialized = true;
    } catch (error) {
      console.error("Error inicializando la aplicación:", error);
      UI.showError("Error al inicializar la aplicación");
    }
  }

  // ===== DELEGACIÓN A HANDLERS =====

  // Handlers de autenticación
  async handleLogin(e) {
    return this.authHandlers.handleLogin(e);
  }

  async handleLoginSuccess(cajeroInfo) {
    return this.authHandlers.handleLoginSuccess(cajeroInfo);
  }

  authenticateWithWebSocket(cajeroInfo, retryCount = 0) {
    return this.authHandlers.authenticateWithWebSocket(cajeroInfo, retryCount);
  }

  handleLogout() {
    return this.authHandlers.handleLogout();
  }

  finalizeLogout() {
    return this.authHandlers.finalizeLogout();
  }

  completeLogout() {
    return this.authHandlers.completeLogout();
  }

  handleTokenExpired() {
    return this.authHandlers.handleTokenExpired();
  }

  // Handlers de transacciones
  async handleNuevaSolicitudDeposito(data) {
    return this.transactionHandlers.handleNuevaSolicitudDeposito(data);
  }

  handleVerificarPago(data) {
    return this.transactionHandlers.handleVerificarPago(data);
  }

  handleDepositoCompletado(data) {
    return this.transactionHandlers.handleDepositoCompletado(data);
  }

  handleDepositoRechazado(data) {
    return this.transactionHandlers.handleDepositoRechazado(data);
  }

  handleTransaccionCanceladaPorJugador(data) {
    return this.transactionHandlers.handleTransaccionCanceladaPorJugador(data);
  }

  handleTransaccionCanceladaPorTimeout(data) {
    return this.transactionHandlers.handleTransaccionCanceladaPorTimeout(data);
  }

  markTransactionAsNew(transactionId) {
    return this.transactionHandlers.markTransactionAsNew(transactionId);
  }

  handleMontoAjustado(data) {
    return this.transactionHandlers.handleMontoAjustado(data);
  }

  async handleTransactionAssigned() {
    return this.transactionHandlers.handleTransactionAssigned();
  }

  handleTransactionError(error) {
    return this.transactionHandlers.handleTransactionError(error);
  }

  // Handlers de navegación
  async handleRefresh() {
    return this.navigationHandlers.handleRefresh();
  }

  handleTabSwitch(tabName) {
    return this.navigationHandlers.handleTabSwitch(tabName);
  }

  handleNavigate(screen) {
    return this.navigationHandlers.handleNavigate(screen);
  }

  updateConnectionStatus() {
    return this.navigationHandlers.updateConnectionStatus();
  }

  // Handlers de historial
  async handleApplyHistoryFilters() {
    return this.historyHandlers.handleApplyHistoryFilters();
  }

  handleClearHistoryFilters() {
    return this.historyHandlers.handleClearHistoryFilters();
  }

  handleLoadMoreHistory() {
    return this.historyHandlers.handleLoadMoreHistory();
  }

  // Handlers de notificaciones
  handleNuevaNotificacion(data) {
    return NotificationsService.handleNuevaNotificacion(data);
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Cargar transacciones pendientes
   */
  async loadTransactions() {
    const token = Auth.getToken();
    if (token) {
      await TransactionManager.loadTransactions(token);
    }
  }

  /**
   * Obtener token actual (para uso global)
   */
  getToken() {
    return Auth.getToken();
  }

  /**
   * Obtener información del cajero (para uso global)
   */
  getCajeroInfo() {
    return Auth.getCajeroInfo();
  }

  /**
   * Verificar si está autenticado (para uso global)
   */
  isAuthenticated() {
    return Auth.isAuthenticated();
  }

  /**
   * Obtener instancia de UI (para uso global)
   */
  getUI() {
    return UI;
  }

  /**
   * Obtener instancia de TransactionManager (para uso global)
   */
  getTransactionManager() {
    return TransactionManager;
  }
}

// Crear instancia única de la aplicación
const app = new CajerosApp();

// Inicializar la aplicación cuando se carga el DOM
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});

// Exportar para uso en otros módulos si es necesario
export default app;
