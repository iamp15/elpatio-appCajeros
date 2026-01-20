/**
 * Módulo de modales de depósito completado/rechazado
 */

import { ModalsManager } from "./modals.js";

/**
 * Clase para gestionar modales de resultado de pago
 */
export class PaymentModalsManager extends ModalsManager {
  /**
   * Mostrar pop-up de depósito completado
   */
  showDepositoCompletadoPopup(data) {
    const modalHTML = `
      <div class="deposito-completado-modal">
        <div class="modal-header success">
          <h2>✅ Depósito Completado</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-content">
          <div class="success-info">
            <div class="info-row">
              <span class="label">Transacción:</span>
              <span class="value">${data.transaccionId}</span>
            </div>
            <div class="info-row">
              <span class="label">Monto:</span>
              <span class="value amount">${(data.monto / 100).toFixed(
                2
              )} Bs</span>
            </div>
            <div class="info-row">
              <span class="label">Nuevo saldo del jugador:</span>
              <span class="value balance">${(data.saldoNuevo / 100).toFixed(
                2
              )} Bs</span>
            </div>
          </div>
          <div class="success-message">
            <p>🎉 ¡Transacción procesada exitosamente!</p>
            <p>El saldo del jugador ha sido actualizado.</p>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary close-btn">Continuar</button>
        </div>
      </div>
    `;

    this.showTransactionDetailsModal(modalHTML);
  }

  /**
   * Mostrar pop-up de depósito rechazado
   */
  showDepositoRechazadoPopup(data) {
    const modalHTML = `
      <div class="deposito-rechazado-modal">
        <div class="modal-header error">
          <h2>❌ Depósito Rechazado</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-content">
          <div class="error-info">
            <div class="info-row">
              <span class="label">Transacción:</span>
              <span class="value">${data.transaccionId}</span>
            </div>
            <div class="info-row">
              <span class="label">Motivo:</span>
              <span class="value reason">${data.motivo}</span>
            </div>
          </div>
          <div class="error-message">
            <p>⚠️ La transacción ha sido rechazada.</p>
            <p>El jugador será notificado del rechazo.</p>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary close-btn">Entendido</button>
        </div>
      </div>
    `;

    this.showTransactionDetailsModal(modalHTML);
  }
}
