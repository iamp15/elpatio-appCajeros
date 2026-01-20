/**
 * Módulo base de gestión de modales
 */

import { UI_CONFIG } from "../config.js";

/**
 * Clase para gestionar modales base
 */
export class ModalsManager {
  constructor() {
    this.handleConfirmPaymentClick = null;
    this.handleRejectPaymentClick = null;
    this.handleVerificarConfirmClick = null;
  }

  /**
   * Mostrar modal de detalles de transacción
   */
  showTransactionDetailsModal(modalHTML) {
    // Cerrar cualquier modal existente antes de crear uno nuevo
    this.closeTransactionDetailsModal();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = modalHTML;
    overlay.style.zIndex = UI_CONFIG.MODAL_Z_INDEX;

    document.body.appendChild(overlay);

    // Configurar evento de cierre
    const closeBtn = overlay.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () =>
        this.closeTransactionDetailsModal()
      );
    }

    // Configurar botones de confirmar y rechazar pago
    const confirmBtn = overlay.querySelector(".confirm-payment-btn");
    if (confirmBtn) {
      // Remover listeners anteriores si existen
      if (this.handleConfirmPaymentClick) {
        confirmBtn.removeEventListener("click", this.handleConfirmPaymentClick);
      }

      // Crear función con contexto - será asignada por el módulo de verificación
      this.handleConfirmPaymentClick = () => {
        const transaccionId = confirmBtn.getAttribute("data-transaction-id");
        console.log(
          "🔍 [UI] Botón confirmar clickeado para transacción:",
          transaccionId
        );
        // Esta función será sobrescrita por el módulo de verificación
      };

      confirmBtn.addEventListener("click", this.handleConfirmPaymentClick);
    }

    const rejectBtn = overlay.querySelector(".reject-payment-btn");
    if (rejectBtn) {
      // Remover listeners anteriores si existen
      if (this.handleRejectPaymentClick) {
        rejectBtn.removeEventListener("click", this.handleRejectPaymentClick);
      }

      // Crear función con contexto - será asignada por el módulo de verificación
      this.handleRejectPaymentClick = () => {
        const transaccionId = rejectBtn.getAttribute("data-transaction-id");
        // Esta función será sobrescrita por el módulo de verificación
      };

      rejectBtn.addEventListener("click", this.handleRejectPaymentClick);
    }

    // Configurar evento de click en overlay para cerrar
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.closeTransactionDetailsModal();
      }
    });
  }

  /**
   * Cerrar modal de detalles de transacción
   */
  closeTransactionDetailsModal() {
    const overlay = document.querySelector(".modal-overlay");
    if (overlay) {
      // Limpiar event listeners antes de remover
      const confirmBtn = overlay.querySelector(".confirm-payment-btn");
      if (confirmBtn && this.handleConfirmPaymentClick) {
        confirmBtn.removeEventListener("click", this.handleConfirmPaymentClick);
      }

      const rejectBtn = overlay.querySelector(".reject-payment-btn");
      if (rejectBtn && this.handleRejectPaymentClick) {
        rejectBtn.removeEventListener("click", this.handleRejectPaymentClick);
      }

      // Limpiar listener del botón de verificar confirmar si existe
      const verificarConfirmBtn = overlay.querySelector("#btn-verificar-confirmar");
      if (verificarConfirmBtn && this.handleVerificarConfirmClick) {
        verificarConfirmBtn.removeEventListener("click", this.handleVerificarConfirmClick);
      }

      overlay.remove();
    }
  }

  /**
   * Configurar handlers para modales de pago
   * Estos métodos serán llamados por los módulos específicos
   */
  setConfirmPaymentHandler(handler) {
    this.handleConfirmPaymentClick = handler;
  }

  setRejectPaymentHandler(handler) {
    this.handleRejectPaymentClick = handler;
  }

  setVerificarConfirmHandler(handler) {
    this.handleVerificarConfirmClick = handler;
  }
}
