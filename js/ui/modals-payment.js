/**
 * Módulo de modales de depósito completado/rechazado
 */

import { ModalsManager } from "./modals.js";
import { formatearMontoVenezolano, API_CONFIG } from "../config.js";

/**
 * Clase para gestionar modales de resultado de pago
 */
export class PaymentModalsManager extends ModalsManager {
  /**
   * Mostrar pop-up de depósito o retiro completado
   */
  showDepositoCompletadoPopup(data) {
    const esRetiro = data.categoria === "retiro";
    const titulo = esRetiro ? "Retiro Completado" : "Depósito Completado";
    const mensajeTransaccion = esRetiro
      ? "Retiro procesado exitosamente. El jugador ha recibido el dinero."
      : "Transacción procesada exitosamente. El saldo del jugador ha sido actualizado.";

    const modalHTML = `
      <div class="deposito-completado-modal">
        <div class="modal-header success">
          <h2>✅ ${titulo}</h2>
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
              <span class="value amount">${formatearMontoVenezolano(data.monto)} Bs</span>
            </div>
            <div class="info-row">
              <span class="label">Nuevo saldo del jugador:</span>
              <span class="value balance">${formatearMontoVenezolano(data.saldoNuevo)} Bs</span>
            </div>
          </div>
          <div class="success-message">
            <p>🎉 ¡${mensajeTransaccion}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary close-btn">Cerrar</button>
        </div>
      </div>
    `;

    this.showTransactionDetailsModal(modalHTML);
  }

  /**
   * Mostrar pop-up para reportar transferencia (retiros)
   */
  showReportarTransferenciaRetiroPopup(transaccion) {
    const transaccionId = transaccion._id;

    const modalHTML = `
      <div class="transaction-details-modal reportar-transferencia-modal">
        <div class="modal-header">
          <h2>💸 Reportar Transferencia</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-content">
          <form id="form-reportar-transferencia" class="reportar-transferencia-form">
            <div class="form-group">
              <label for="transferencia-referencia">Número de referencia *</label>
              <input type="text" id="transferencia-referencia" required placeholder="Ej: PAGO123456" />
            </div>
            <div class="form-group">
              <label for="transferencia-banco">Banco desde donde enviaste *</label>
              <select id="transferencia-banco" required>
                <option value="">Selecciona un banco</option>
                <option value="Banesco">Banesco</option>
                <option value="Mercantil">Mercantil</option>
                <option value="Venezuela">Banco de Venezuela</option>
                <option value="BOD">BOD</option>
                <option value="BBVA">BBVA Provincial</option>
                <option value="Bicentenario">Bicentenario</option>
              </select>
            </div>
            <div class="form-group">
              <label for="transferencia-notas">Notas (opcional)</label>
              <textarea id="transferencia-notas" rows="2" placeholder="Ej: Transferencia realizada"></textarea>
            </div>
            <div class="form-group">
              <label>Captura del comprobante *</label>
              <div class="file-upload-container">
                <input type="file" id="transferencia-imagen" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" class="file-input" required />
                <label for="transferencia-imagen" class="file-input-label">
                  <span class="file-input-icon">📷</span>
                  <span class="file-input-text">Seleccionar imagen (máx. 5MB)</span>
                </label>
                <div id="transferencia-imagen-preview" class="imagen-preview-container" style="display: none;">
                  <img id="transferencia-imagen-preview-img" class="imagen-preview" alt="Preview" />
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary close-btn">Cancelar</button>
          <button type="submit" form="form-reportar-transferencia" class="btn btn-primary" id="btn-confirmar-transferencia">
            ✅ Confirmar Transferencia
          </button>
        </div>
      </div>
    `;

    this.showTransactionDetailsModal(modalHTML);

    const form = document.getElementById("form-reportar-transferencia");
    const imagenInput = document.getElementById("transferencia-imagen");
    const previewContainer = document.getElementById("transferencia-imagen-preview");
    const previewImg = document.getElementById("transferencia-imagen-preview-img");

    imagenInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("La imagen no puede ser mayor a 5MB");
          e.target.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          previewImg.src = ev.target.result;
          previewContainer.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.style.display = "none";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btnConfirmar = document.getElementById("btn-confirmar-transferencia");
      btnConfirmar.disabled = true;
      btnConfirmar.textContent = "Procesando...";

      try {
        const referencia = document.getElementById("transferencia-referencia").value;
        const bancoOrigen = document.getElementById("transferencia-banco").value;
        const notas = document.getElementById("transferencia-notas").value || "Transferencia enviada";
        const imagenFile = document.getElementById("transferencia-imagen").files[0];

        let comprobanteUrl = null;
        if (imagenFile) {
          comprobanteUrl = await this.subirImagenComprobante(imagenFile);
        }

        const payload = {
          notas,
          numeroReferencia: referencia,
          bancoOrigen,
          comprobanteUrl,
        };

        if (window.cajeroWebSocket) {
          window.cajeroWebSocket.confirmarPagoCajero(transaccionId, payload);
          this.closeTransactionDetailsModal();
        } else {
          alert("Error: No hay conexión con el servidor");
        }
      } catch (error) {
        console.error("Error reportando transferencia:", error);
        alert(`Error: ${error.message || "No se pudo completar"}`);
      } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = "✅ Confirmar Transferencia";
      }
    });

    document.querySelectorAll(".close-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.closeTransactionDetailsModal());
    });
  }

  async subirImagenComprobante(archivo) {
    const formData = new FormData();
    formData.append("imagen", archivo);

    const token =
      window.cajeroWebSocket?.lastAuthToken ||
      window.AuthManager?.getToken?.() ||
      localStorage.getItem("cajeroToken") ||
      localStorage.getItem("token");

    if (!token) {
      throw new Error("No hay token de autenticación. Inicia sesión nuevamente.");
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/upload/imagen-comprobante`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.mensaje || "Error al subir imagen");
    }

    const data = await response.json();
    return data.imagen?.url;
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
