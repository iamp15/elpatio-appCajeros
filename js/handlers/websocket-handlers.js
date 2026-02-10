/**
 * Handlers de eventos WebSocket
 */

import { Auth } from "../auth.js";
import { UI } from "../ui.js";
import { TransactionManager } from "../transactions.js";

/**
 * Configurar todos los event listeners de WebSocket
 */
export function setupWebSocketHandlers(app) {
  // Configurar callbacks de WebSocket
  window.cajeroWebSocket.on("onConnect", () => {
    // WebSocket conectado
  });

  window.cajeroWebSocket.on("onDisconnect", (reason) => {
    console.log(`❌ WebSocket desconectado: ${reason}`);
  });

  window.cajeroWebSocket.on("onAuthResult", (result) => {
    if (!result.success) {
      console.error(`🔐 Error de autenticación WebSocket: ${result.message}`);
    }
  });

  window.cajeroWebSocket.on("onNuevaSolicitudDeposito", (data) => {
    console.log("💰 Nueva solicitud de depósito recibida");
    app.handleNuevaSolicitudDeposito(data);
  });

  window.cajeroWebSocket.on("onVerificarPago", (data) => {
    console.log("🔍 Solicitud de verificación de pago recibida");
    app.handleVerificarPago(data);
  });

  window.cajeroWebSocket.on("onDepositoCompletado", (data) => {
    console.log("✅ Depósito completado recibido");
    app.handleDepositoCompletado(data);
  });

  window.cajeroWebSocket.on("onRetiroCompletado", (data) => {
    console.log("✅ Retiro completado recibido");
    app.handleRetiroCompletado(data);
  });

  window.cajeroWebSocket.on("onDepositoRechazado", (data) => {
    console.log("❌ Depósito rechazado recibido");
    app.handleDepositoRechazado(data);
  });

  window.cajeroWebSocket.on("onTransaccionCanceladaPorJugador", (data) => {
    console.log("❌ Jugador canceló transacción");
    app.handleTransaccionCanceladaPorJugador(data);
  });

  window.cajeroWebSocket.on("onTransaccionCanceladaPorTimeout", (data) => {
    console.log("⏱️ Transacción cancelada por timeout");
    app.handleTransaccionCanceladaPorTimeout(data);
  });

  // Listener para notificaciones persistentes
  window.cajeroWebSocket.on("onNuevaNotificacion", (data) => {
    console.log("🔔 Nueva notificación recibida:", data);
    app.handleNuevaNotificacion(data);
  });

  // Listener para monto ajustado
  window.cajeroWebSocket.on("onMontoAjustado", (data) => {
    console.log("💰 Monto ajustado recibido:", data);
    app.handleMontoAjustado(data);
  });

  window.cajeroWebSocket.on("onError", (error) => {
    console.error(`❌ Error WebSocket: ${error.message || error}`);
    // Limpiar el estado de procesamiento en caso de error
    const transaccionId = error.transaccionId || UI.processingPayment;
    UI.processingPayment = null;
    
    // Rehabilitar botones de pago
    if (transaccionId) {
      UI.setPaymentButtonsDisabled(transaccionId, false);
    }
  });

  // Listener para sesión reemplazada (otra pestaña/dispositivo tomó la sesión)
  window.cajeroWebSocket.on("onSessionReplaced", (data) => {
    console.log("⚠️ [SESSION] Sesión reemplazada:", data);
    
    // Mostrar notificación al usuario
    if (window.notificationManager) {
      window.notificationManager.warning(
        "Sesión cerrada",
        "Tu sesión fue cerrada porque iniciaste sesión en otro lugar"
      );
    }
    
    // Desconectar WebSocket para evitar conflictos
    window.cajeroWebSocket.disconnect();
    
    // Limpiar sesión y mostrar pantalla de login
    Auth.logout();
    UI.showLoginScreen();
    TransactionManager.clearTransactions();
  });

  // Agregar callback para errores de conexión
  window.cajeroWebSocket.socket?.on("connect_error", (error) => {
    console.error(`❌ Error de conexión WebSocket: ${error.message}`);
  });

  // Conectar WebSocket
  window.cajeroWebSocket.connect();
}
