/**
 * Funciones globales para uso en HTML
 */

/**
 * Configurar funciones globales
 */
export function setupGlobalFunctions(app) {
  /**
   * Aceptar transacción
   */
  window.acceptTransaction = async (transaccionId) => {
    const token = app.getToken();
    if (token && window.transactionManager) {
      await window.transactionManager.acceptTransaction(transaccionId, token);
    }
  };

  /**
   * Refrescar transacciones
   */
  window.refreshTransactions = async () => {
    const token = app.getToken();
    if (token && window.transactionManager) {
      await window.transactionManager.loadTransactions(token);
    }
  };

  /**
   * Cerrar modal de detalles de transacción
   */
  window.closeTransactionDetails = () => {
    app.getUI().closeTransactionDetailsModal();
  };

  /**
   * Ver detalles de transacción
   */
  window.viewTransactionDetails = async (transaccionId) => {
    const token = app.getToken();
    if (token && window.transactionManager) {
      try {
        // Importar API dinámicamente
        const { API } = await import("../api.js");
        const response = await API.getTransaccionDetalle(transaccionId, token);
        if (response.ok) {
          const data = await response.json();
          window.transactionManager.showTransactionDetailsModal(data.transaccion);
        } else {
          console.error(
            "Error obteniendo detalles de transacción:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error obteniendo detalles de transacción:", error);
      }
    }
  };

  /**
   * Verificar pago
   */
  window.verifyPayment = async (transaccionId) => {
    const token = app.getToken();
    if (!token || !window.transactionManager) return;

    try {
      // Obtener detalles de la transacción
      const { API } = await import("../api.js");
      const response = await API.getTransaccionDetalle(transaccionId, token);

      if (response.ok) {
        const result = await response.json();
        const transaccion = result.transaccion;

        // Formatear datos para el popup de verificación
        const data = {
          transaccionId: transaccion._id,
          monto: transaccion.monto,
          jugador: {
            nombre:
              transaccion.jugadorId?.nickname ||
              transaccion.jugadorId?.firstName ||
              "Usuario",
          },
          datosPago: {
            banco: transaccion.infoPago?.bancoOrigen || "-",
            referencia: transaccion.infoPago?.numeroReferencia || "-",
            telefono: transaccion.infoPago?.telefonoOrigen || "-",
            fecha: transaccion.infoPago?.fechaPago || "-",
            monto: transaccion.monto,
          },
        };

        // Mostrar popup de verificación
        app.getUI().showVerificarPagoPopup(data);
      } else {
        console.error("Error obteniendo transacción:", response.status);
      }
    } catch (error) {
      console.error("Error en verifyPayment:", error);
    }
  };
}
