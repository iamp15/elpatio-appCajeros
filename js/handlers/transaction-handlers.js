/**
 * Handlers de transacciones
 */

import { UI } from "../ui.js";

/**
 * Crear handlers de transacciones
 */
export function createTransactionHandlers(app) {
  return {
    /**
     * Manejar nueva solicitud de depósito via WebSocket
     */
    async handleNuevaSolicitudDeposito(data) {
      try {
        // Usar transaccionId como identificador único para evitar duplicados
        const transactionId =
          data.transaccionId || data.jugadorId + "_" + data.monto;

        // Verificar si ya procesamos esta transacción
        if (app.processedTransactions.has(transactionId)) {
          return;
        }

        // Marcar como procesada
        app.processedTransactions.add(transactionId);

        // Los datos del WebSocket pueden no incluir información completa del jugador
        const jugadorNombre =
          data.jugador?.nombre ||
          data.jugador?.nickname ||
          `Jugador ${data.jugadorId}`;
        const montoBs = (data.monto / 100).toFixed(2); // Convertir centavos a bolívares

        console.log(`📋 Nueva solicitud: ${jugadorNombre} - ${montoBs} Bs`);

        // Forzar actualización de la lista de transacciones
        await app.loadTransactions();

        // Marcar la transacción como nueva (si tiene transaccionId)
        if (data.transaccionId) {
          app.markTransactionAsNew(data.transaccionId);
        }
      } catch (error) {
        console.error(`Error manejando nueva solicitud: ${error.message}`);
      }
    },

    /**
     * Manejar solicitud de verificación de pago
     */
    handleVerificarPago(data) {
      try {
        console.log("🔍 [VERIFICAR-PAGO] Evento recibido:", data);

        // Verificar si la transacción ya fue completada antes de procesar
        if (
          window.cajeroWebSocket &&
          window.cajeroWebSocket.completedTransactions &&
          window.cajeroWebSocket.completedTransactions.has(data.transaccionId)
        ) {
          console.warn(
            `⚠️ [VERIFICAR-PAGO] Transacción ${data.transaccionId} ya fue completada, ignorando evento verificar-pago`
          );
          return;
        }

        console.log("🔍 [VERIFICAR-PAGO] Abriendo modal automáticamente...");

        // PRIMERO actualizar la lista para que muestre el nuevo estado
        app.loadTransactions();

        // LUEGO mostrar el pop-up de verificación (con un pequeño delay para que no se interrumpa)
        setTimeout(() => {
          UI.showVerificarPagoPopup(data);
          console.log("🔍 [VERIFICAR-PAGO] Modal abierto correctamente");
        }, 300);
      } catch (error) {
        console.error("❌ Error manejando verificación de pago:", error);
      }
    },

    /**
     * Manejar depósito completado
     */
    handleDepositoCompletado(data) {
      try {
        const transaccionId = data.transaccionId;

        // Cerrar modal de verificación si está abierto
        UI.closeTransactionDetailsModal();

        // Limpiar el estado de procesamiento
        UI.processingPayment = null;

        // Rehabilitar botones de pago
        if (transaccionId) {
          UI.setPaymentButtonsDisabled(transaccionId, false);
        }

        // Mostrar pop-up de depósito completado
        UI.showDepositoCompletadoPopup(data);

        // Actualizar la lista de transacciones
        app.loadTransactions();
      } catch (error) {
        console.error("Error manejando depósito completado:", error);
        // Asegurar limpieza incluso en caso de error
        UI.processingPayment = null;
      }
    },

    /**
     * Manejar depósito rechazado
     */
    handleDepositoRechazado(data) {
      try {
        const transaccionId = data.transaccionId;

        // Limpiar el estado de procesamiento
        UI.processingPayment = null;

        // Rehabilitar botones de pago
        if (transaccionId) {
          UI.setPaymentButtonsDisabled(transaccionId, false);
        }

        // Mostrar pop-up de depósito rechazado
        UI.showDepositoRechazadoPopup(data);

        // Actualizar la lista de transacciones
        app.loadTransactions();
      } catch (error) {
        console.error("Error manejando depósito rechazado:", error);
        // Asegurar limpieza incluso en caso de error
        UI.processingPayment = null;
      }
    },

    /**
     * Manejar transacción cancelada por jugador
     */
    handleTransaccionCanceladaPorJugador(data) {
      try {
        console.log("❌ [CANCELACION] Procesando cancelación:", data);

        // Actualizar las listas de transacciones (la transacción cancelada desaparecerá)
        app.loadTransactions();

        console.log("✅ [CANCELACION] Listas actualizadas");
      } catch (error) {
        console.error("Error manejando cancelación por jugador:", error);
      }
    },

    /**
     * Manejar cancelación de transacción por timeout
     */
    handleTransaccionCanceladaPorTimeout(data) {
      try {
        console.log("⏱️ [TIMEOUT] Procesando cancelación por timeout:", data);
        console.log(
          `⏱️ [TIMEOUT] Transacción ${data.transaccionId} cancelada por inactividad (${data.tiempoTranscurrido} minutos)`
        );

        // Actualizar las listas de transacciones (la transacción cancelada desaparecerá)
        app.loadTransactions();

        // Opcional: Mostrar notificación al cajero si está viendo esa transacción
        console.log("✅ [TIMEOUT] Listas actualizadas");
      } catch (error) {
        console.error("Error manejando cancelación por timeout:", error);
      }
    },

    /**
     * Marcar transacción como nueva con etiqueta visual
     */
    markTransactionAsNew(transactionId) {
      try {
        // Buscar el elemento de la transacción en el DOM
        const transactionElement = document.querySelector(
          `[data-transaction-id="${transactionId}"]`
        );

        if (transactionElement) {
          // Agregar clase CSS para destacar como nueva
          transactionElement.classList.add("transaction-new");

          // Agregar etiqueta "NUEVA" en una esquina
          const newLabel = document.createElement("div");
          newLabel.className = "new-transaction-label";
          newLabel.textContent = "NUEVA";
          newLabel.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ff4444;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            z-index: 10;
            animation: pulse 2s infinite;
          `;

          // Asegurar que el contenedor tenga posición relativa
          transactionElement.style.position = "relative";
          transactionElement.appendChild(newLabel);

          // Remover la etiqueta después de 10 segundos
          setTimeout(() => {
            if (newLabel.parentNode) {
              newLabel.parentNode.removeChild(newLabel);
            }
            transactionElement.classList.remove("transaction-new");
          }, 10000);

          // Transacción marcada como nueva
        }
      } catch (error) {
        console.error(`Error marcando transacción como nueva: ${error.message}`);
      }
    },

    /**
     * Manejar monto ajustado
     */
    handleMontoAjustado(data) {
      try {
        console.log("💰 [APP] Monto ajustado recibido, confirmando automáticamente:", data);
        const { transaccionId } = data;
        
        // Limpiar processingPayment para permitir la confirmación
        if (UI.processingPayment === transaccionId) {
          UI.processingPayment = null;
        }
        
        // Confirmar automáticamente el pago después del ajuste
        if (transaccionId) {
          setTimeout(() => {
            UI.handleConfirmPayment(transaccionId);
          }, 300);
        }
      } catch (error) {
        console.error("Error manejando monto ajustado:", error);
      }
    },

    /**
     * Manejar transacción asignada
     */
    async handleTransactionAssigned() {
      // Recargar la lista de transacciones
      await app.loadTransactions();
    },

    /**
     * Manejar error en transacción
     */
    handleTransactionError(error) {
      console.error("Error en transacción:", error);
      // Aquí se podría implementar lógica adicional para manejar errores específicos
    }
  };
}
