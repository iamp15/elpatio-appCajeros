/**
 * Módulo de modales de verificación de pago
 */

import { ModalsManager } from "./modals.js";
import { formatearMontoVenezolano, formatearMontoBsVenezolano } from "../config.js";

/**
 * Clase para gestionar modales de verificación de pago
 */
export class VerificationModalsManager extends ModalsManager {
  constructor(showAlertCallback, closeModalCallback, rejectPaymentCallback) {
    super();
    this.showAlert = showAlertCallback;
    this.closeModal = closeModalCallback;
    this.handleRejectPayment = rejectPaymentCallback;
    this.processingPayment = null;
    this.handleVerificarConfirmClick = null;
  }

  /**
   * Mostrar pop-up de verificación de pago
   */
  showVerificarPagoPopup(data) {
    // Verificar si la transacción ya fue completada antes de abrir el modal
    if (
      window.cajeroWebSocket &&
      window.cajeroWebSocket.completedTransactions &&
      window.cajeroWebSocket.completedTransactions.has(data.transaccionId)
    ) {
      console.warn(
        `⚠️ [UI] Transacción ${data.transaccionId} ya fue completada, no abriendo modal de verificación`
      );
      return;
    }

    // Cerrar modal anterior si existe para evitar listeners duplicados
    this.closeTransactionDetailsModal();

    const montoSolicitado = data.monto / 100;
    
    const modalHTML = `
      <div class="transaction-details-modal verificar-pago-modal">
        <div class="modal-header">
          <h2>🔍 Verificar Pago</h2>
          <button onclick="closeTransactionDetails()" class="close-btn">&times;</button>
        </div>
        
        <div class="transaction-info">
          <div class="transaction-header deposito">
            <div class="transaction-type">
              💰 Depósito
            </div>
            <div class="transaction-amount">
              ${formatearMontoBsVenezolano(montoSolicitado)} Bs
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <strong>Jugador:</strong>
              <span>${data.jugador.nombre}</span>
            </div>
            
            <div class="detail-item">
              <strong>Banco:</strong>
              <span>${data.datosPago.banco}</span>
            </div>
            
            <div class="detail-item">
              <strong>Referencia:</strong>
              <span class="reference-code">${data.datosPago.referencia}</span>
            </div>
            
            <div class="detail-item">
              <strong>Teléfono:</strong>
              <span>${data.datosPago.telefono}</span>
            </div>
          </div>

          <div class="form-group monto-verificacion">
            <label class="form-label">
              Monto recibido (Bs): *
              <span class="label-hint">Ingresa el monto exacto que recibiste</span>
            </label>
            <input 
              type="number" 
              id="monto-recibido" 
              class="form-input" 
              placeholder="0.00"
              step="0.01"
              min="0"
              value="${montoSolicitado}"
            />
            <div id="monto-alert" class="monto-alert" style="display: none;"></div>
          </div>
          
          <div class="status-message">
            <p>🔍 <strong>Verificación requerida:</strong> Confirma en tu cuenta bancaria si el pago fue recibido correctamente.</p>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-success" id="btn-verificar-confirmar" data-transaction-id="${data.transaccionId}" data-monto-solicitado="${montoSolicitado}">✅ Confirmar Pago</button>
          <button class="btn btn-danger reject-payment-btn" data-transaction-id="${data.transaccionId}">❌ Rechazar Pago</button>
        </div>
      </div>
    `;

    this.showTransactionDetailsModal(modalHTML);

    // Agregar event listeners
    const montoRecibidoInput = document.getElementById('monto-recibido');
    const montoAlert = document.getElementById('monto-alert');

    montoRecibidoInput.addEventListener('input', (e) => {
      const montoRecibido = parseFloat(e.target.value) || 0;
      
      if (montoRecibido !== montoSolicitado) {
        montoAlert.style.display = 'block';
        
        if (montoRecibido < montoSolicitado) {
          montoAlert.className = 'monto-alert error';
          montoAlert.innerHTML = `⚠️ El monto recibido es MENOR al solicitado. Diferencia: ${formatearMontoBsVenezolano(montoSolicitado - montoRecibido)} Bs`;
        } else {
          montoAlert.className = 'monto-alert warning';
          montoAlert.innerHTML = `⚠️ El monto recibido es MAYOR al solicitado. Diferencia: ${formatearMontoBsVenezolano(montoRecibido - montoSolicitado)} Bs`;
        }
      } else {
        montoAlert.style.display = 'none';
      }
    });

    // Botón de confirmar con validación de monto
    const confirmBtn = document.getElementById('btn-verificar-confirmar');
    if (confirmBtn) {
      // Remover listener anterior si existe
      if (this.handleVerificarConfirmClick) {
        confirmBtn.removeEventListener('click', this.handleVerificarConfirmClick);
      }

      // Crear nuevo listener
      this.handleVerificarConfirmClick = (e) => {
        const transaccionId = e.target.dataset.transactionId;
        const montoSolicitado = parseFloat(e.target.dataset.montoSolicitado);
        const montoRecibido = parseFloat(montoRecibidoInput.value) || 0;

        // Verificar si ya fue completada antes de procesar
        if (
          window.cajeroWebSocket &&
          window.cajeroWebSocket.completedTransactions &&
          window.cajeroWebSocket.completedTransactions.has(transaccionId)
        ) {
          console.warn(
            `⚠️ [UI] Transacción ${transaccionId} ya fue completada, ignorando click`
          );
          return;
        }

        if (montoRecibido <= 0) {
          this.showAlert('Debes ingresar el monto recibido');
          return;
        }

        // Si hay diferencia en el monto, manejar apropiadamente
        if (montoRecibido !== montoSolicitado) {
          this.handleDiferenciaMonto(transaccionId, montoSolicitado, montoRecibido);
        } else {
          // Confirmar directamente si el monto coincide
          this.handleConfirmPayment(transaccionId);
        }
      };

      confirmBtn.addEventListener('click', this.handleVerificarConfirmClick);
    }

    // Configurar botón de rechazo
    const rejectBtn = document.querySelector('.reject-payment-btn');
    if (rejectBtn) {
      // Remover listener anterior si existe para evitar duplicados
      const newRejectBtn = rejectBtn.cloneNode(true);
      rejectBtn.parentNode.replaceChild(newRejectBtn, rejectBtn);
      
      newRejectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const transaccionId = newRejectBtn.getAttribute('data-transaction-id');
        console.log('❌ [UI] Botón rechazar clickeado para transacción:', transaccionId);
        console.log('❌ [UI] handleRejectPayment existe:', !!this.handleRejectPayment);
        
        if (transaccionId) {
          if (this.handleRejectPayment) {
            this.handleRejectPayment(transaccionId);
          } else {
            console.error('❌ [UI] handleRejectPayment no está definido');
            this.showAlert('Error: No se puede procesar el rechazo. Por favor, recarga la página.');
          }
        } else {
          console.error('❌ [UI] No se encontró transaccionId en el botón de rechazar');
          this.showAlert('Error: No se pudo identificar la transacción.');
        }
      });
    } else {
      console.warn('⚠️ [UI] No se encontró el botón de rechazar pago');
    }
  }

  /**
   * Manejar diferencia de monto
   */
  async handleDiferenciaMonto(transaccionId, montoSolicitado, montoRecibido) {
    // Obtener configuración de monto mínimo
    const montoMinimo = await this.obtenerMontoMinimo();

    // Si el monto recibido es menor al mínimo, debe rechazarse
    if (montoRecibido < montoMinimo) {
      this.showAlert(
        `El monto recibido (${montoRecibido} Bs) es menor al mínimo permitido (${montoMinimo} Bs). Debes rechazar este depósito.`
      );
      return;
    }

    // Mostrar modal de ajuste directamente para cualquier diferencia (mayor o menor)
    // El comportamiento debe ser consistente independientemente de si el monto es mayor o menor
    this.showModalAjusteMonto(transaccionId, montoSolicitado, montoRecibido);
  }

  /**
   * Obtener monto mínimo desde la configuración
   */
  async obtenerMontoMinimo() {
    try {
      // Importar API_CONFIG si no está disponible
      const API_BASE = window.API_CONFIG?.BASE_URL || 'https://elpatio-backend.fly.dev';
      const response = await fetch(`${API_BASE}/api/config/depositos`);
      if (response.ok) {
        const data = await response.json();
        return data.configuracion?.deposito_monto_minimo || 10;
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
    }
    return 10; // Valor por defecto
  }

  /**
   * Mostrar modal de ajuste de monto
   */
  showModalAjusteMonto(transaccionId, montoSolicitado, montoRecibido) {
    const modalHTML = `
      <div class="modal-ajuste-monto">
        <div class="modal-header warning">
          <h2>⚠️ Ajustar Monto</h2>
          <button class="close-btn" onclick="closeTransactionDetails()">&times;</button>
        </div>
        
        <div class="modal-content">
          <div class="monto-comparison">
            <div class="monto-item">
              <div class="monto-label">Monto Solicitado</div>
              <div class="monto-value">${formatearMontoBsVenezolano(montoSolicitado)} Bs</div>
            </div>
            <div class="monto-arrow">→</div>
            <div class="monto-item">
              <div class="monto-label">Monto Recibido</div>
              <div class="monto-value">${formatearMontoBsVenezolano(montoRecibido)} Bs</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Confirma el monto real recibido:</label>
            <input 
              type="number" 
              id="monto-ajustado-final" 
              class="form-input" 
              value="${montoRecibido}"
              step="0.01"
              min="0"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Razón del ajuste: (opcional)</label>
            <textarea 
              id="razon-ajuste" 
              class="form-textarea" 
              rows="3" 
              placeholder="Describe por qué el monto es diferente..."
            ></textarea>
          </div>

          <div class="info-message">
            <p>ℹ️ El depósito se completará con el monto ajustado. El jugador recibirá este monto en su saldo.</p>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeTransactionDetails()">Cancelar</button>
          <button class="btn btn-success" id="btn-confirmar-ajuste">Confirmar Ajuste</button>
        </div>
      </div>
    `;

    this.showTransactionDetailsModal(modalHTML);

    // Event listener para confirmar ajuste
    document.getElementById('btn-confirmar-ajuste').addEventListener('click', () => {
      const montoFinal = parseFloat(document.getElementById('monto-ajustado-final').value);
      const razon = document.getElementById('razon-ajuste').value.trim();

      if (!montoFinal || montoFinal <= 0) {
        this.showAlert('Debes ingresar un monto válido');
        return;
      }

      // Convertir de bolívares a centavos (el backend espera centavos)
      const montoEnCentavos = Math.round(montoFinal * 100);
      this.procesarAjusteMonto(transaccionId, montoEnCentavos, razon || 'Ajuste de monto por discrepancia');
    });
  }

  /**
   * Procesar ajuste de monto
   */
  procesarAjusteMonto(transaccionId, montoReal, razon) {
    console.log('💰 Ajustando monto:', { transaccionId, montoReal, razon });

    // Marcar como procesando
    this.processingPayment = transaccionId;

    // Cerrar el modal
    this.closeTransactionDetailsModal();

    // Enviar ajuste via WebSocket
    if (
      window.cajeroWebSocket &&
      window.cajeroWebSocket.isConnected &&
      window.cajeroWebSocket.isAuthenticated
    ) {
      // Enviar ajuste - la confirmación automática se hará cuando llegue el evento monto-ajustado
      window.cajeroWebSocket.ajustarMontoDeposito(transaccionId, montoReal, razon);
    } else {
      console.error('No hay conexión WebSocket disponible');
      this.showAlert('Error: No hay conexión disponible');
      this.processingPayment = null;
    }
  }

  /**
   * Manejar confirmación de pago
   */
  handleConfirmPayment(transaccionId) {
    // Verificar si ya se está procesando esta transacción
    if (this.processingPayment === transaccionId) {
      console.warn(
        `⚠️ [UI] Transacción ${transaccionId} ya está siendo procesada, ignorando solicitud duplicada`
      );
      return;
    }

    // Verificar si la transacción ya fue completada (protección adicional)
    if (
      window.cajeroWebSocket &&
      window.cajeroWebSocket.completedTransactions &&
      window.cajeroWebSocket.completedTransactions.has(transaccionId)
    ) {
      console.warn(
        `⚠️ [UI] Transacción ${transaccionId} ya fue completada, ignorando solicitud`
      );
      return;
    }

    // Marcar como procesando
    this.processingPayment = transaccionId;

    // Deshabilitar botones de confirmar y rechazar para prevenir doble envío
    this.setPaymentButtonsDisabled(transaccionId, true);

    // Cerrar el modal
    this.closeTransactionDetailsModal();

    // Enviar confirmación via WebSocket
    if (
      window.cajeroWebSocket &&
      window.cajeroWebSocket.isConnected &&
      window.cajeroWebSocket.isAuthenticated
    ) {
      // Enviando confirmación via WebSocket
      window.cajeroWebSocket.confirmarPagoCajero(transaccionId);
    } else {
      console.error("No hay conexión WebSocket disponible");
      this.showAlert("Error: No hay conexión disponible");
      this.processingPayment = null; // Limpiar en caso de error
      this.setPaymentButtonsDisabled(transaccionId, false); // Rehabilitar botones
    }
  }

  /**
   * Habilitar/deshabilitar botones de pago para prevenir doble envío
   */
  setPaymentButtonsDisabled(transaccionId, disabled) {
    // Buscar botón de confirmar en el modal abierto
    const confirmBtn = document.getElementById("btn-verificar-confirmar");
    const confirmBtnByClass = document.querySelector(
      `.confirm-payment-btn[data-transaction-id="${transaccionId}"]`
    );
    const rejectBtn = document.querySelector(
      `.reject-payment-btn[data-transaction-id="${transaccionId}"]`
    );

    if (confirmBtn) {
      confirmBtn.disabled = disabled;
      if (disabled) {
        confirmBtn.innerHTML = "⏳ Procesando...";
        confirmBtn.classList.add("processing");
      } else {
        confirmBtn.innerHTML = "✅ Confirmar Pago";
        confirmBtn.classList.remove("processing");
      }
    }

    if (confirmBtnByClass) {
      confirmBtnByClass.disabled = disabled;
      if (disabled) {
        confirmBtnByClass.innerHTML = "⏳ Procesando...";
        confirmBtnByClass.classList.add("processing");
      } else {
        confirmBtnByClass.innerHTML = "✅ Confirmar Pago";
        confirmBtnByClass.classList.remove("processing");
      }
    }

    if (rejectBtn) {
      rejectBtn.disabled = disabled;
    }
  }

  /**
   * Establecer estado de procesamiento
   */
  setProcessingPayment(transaccionId) {
    this.processingPayment = transaccionId;
  }

  /**
   * Limpiar estado de procesamiento
   */
  clearProcessingPayment() {
    this.processingPayment = null;
  }

  /**
   * Obtener estado de procesamiento
   */
  getProcessingPayment() {
    return this.processingPayment;
  }
}
