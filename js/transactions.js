/**
 * Módulo de gestión de transacciones para cajeros
 */

import { TRANSACTION_CONFIG, TRANSACTION_TYPES, MESSAGES } from "./config.js";
import { API } from "./api.js";
import { UI } from "./ui.js";

class TransactionManager {
  constructor() {
    this.transactions = [];
    this.filteredTransactions = {
      pendientes: [],
      en_proceso: [],
      realizada: [],
    };
    this.currentTab = "pendientes";
    this.callbacks = {
      onTransactionAssigned: null,
      onTransactionError: null,
    };
  }

  /**
   * Configurar callbacks para eventos de transacciones
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Cargar transacciones pendientes
   */
  async loadTransactions(token) {
    if (!token) return;

    try {
      UI.showLoadingTransactions(true);
      UI.hideNoTransactions();

      // Cargar transacciones de los 3 estados activos
      const estados = ["pendiente", "en_proceso", "realizada"];
      const promesas = estados.map((estado) =>
        API.getTransaccionesCajero(estado, token)
      );

      const respuestas = await Promise.all(promesas);

      // Verificar que todas las respuestas sean exitosas
      for (const respuesta of respuestas) {
        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(errorData.mensaje || "Error cargando transacciones");
        }
      }

      // Combinar todas las transacciones
      this.transactions = [];
      for (let i = 0; i < respuestas.length; i++) {
        const data = await respuestas[i].json();
        const estado = estados[i];
        this.transactions = this.transactions.concat(data.transacciones || []);
      }

      this.filterTransactionsByStatus();
      this.displayTransactionsByTab();
      this.updateTabCounts();
    } catch (error) {
      console.error("Error cargando transacciones:", error);
      UI.showNoTransactions();
    } finally {
      UI.showLoadingTransactions(false);
    }
  }

  /**
   * Filtrar transacciones por estado
   * Nota: El backend ya filtra por cajero para estados "en_proceso", "realizada" y "completada"
   */
  filterTransactionsByStatus() {
    this.filteredTransactions = {
      pendientes: [],
      en_proceso: [],
      realizada: [],
    };

    this.transactions.forEach((transaccion) => {
      switch (transaccion.estado) {
        case "pendiente":
          // Las pendientes se muestran a todos los cajeros
          this.filteredTransactions.pendientes.push(transaccion);
          break;
        case "en_proceso":
          // El backend ya filtra por cajero, solo agregar a la lista
          this.filteredTransactions.en_proceso.push(transaccion);
          break;
        case "realizada":
          // Usuario ya reportó que hizo el pago, cajero debe verificar
          this.filteredTransactions.realizada.push(transaccion);
          break;
        default:
          // Por defecto, considerar como pendiente
          this.filteredTransactions.pendientes.push(transaccion);
      }
    });
  }

  /**
   * Mostrar transacciones según la pestaña activa
   */
  displayTransactionsByTab() {
    const currentTransactions = this.filteredTransactions[this.currentTab];
    UI.displayTransactionsForTab(this.currentTab, currentTransactions);
  }

  /**
   * Cambiar pestaña activa
   */
  switchTab(tabName) {
    this.currentTab = tabName;
    this.displayTransactionsByTab();
    UI.switchTab(tabName);
  }

  /**
   * Actualizar contadores de pestañas
   */
  updateTabCounts() {
    UI.updateTabCount(
      "pendientes",
      this.filteredTransactions.pendientes.length
    );
    UI.updateTabCount(
      "en_proceso",
      this.filteredTransactions.en_proceso.length
    );
    UI.updateTabCount("realizada", this.filteredTransactions.realizada.length);
  }

  /**
   * Mostrar transacciones en la interfaz (método legacy - mantener compatibilidad)
   */
  displayTransactions(transacciones) {
    // Este método se mantiene para compatibilidad pero ahora usa el nuevo sistema
    this.filterTransactionsByStatus();
    this.displayTransactionsByTab();
    this.updateTabCounts();
  }

  /**
   * Formatear referencia para mostrar solo últimos dígitos
   */
  formatReference(referencia) {
    if (!referencia) return "N/A";
    if (referencia.length <= TRANSACTION_CONFIG.REFERENCE_DISPLAY_LENGTH) {
      return referencia;
    }
    return referencia.slice(-TRANSACTION_CONFIG.REFERENCE_DISPLAY_LENGTH);
  }

  /**
   * Formatear monto para mostrar en formato venezolano
   */
  formatAmount(monto) {
    return (monto / TRANSACTION_CONFIG.AMOUNT_DIVISOR).toLocaleString(
      TRANSACTION_CONFIG.LOCALE,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  /**
   * Copiar texto al portapapeles
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return true;
      }
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
      return false;
    }
  }

  /**
   * Mostrar notificación temporal de copia exitosa
   */
  showCopyNotification(button) {
    const originalText = button.innerHTML;
    button.innerHTML = "✓ Copiado";
    button.classList.add("copied");
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove("copied");
    }, 2000);
  }

  /**
   * Copiar un dato específico de pago al portapapeles
   */
  async copyPaymentItem(transactionId, itemType) {
    const elementId = `payment-${itemType}-${transactionId}`;
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Elemento no encontrado: ${elementId}`);
      return;
    }

    const text = element.textContent.trim();
    if (text === "N/A" || !text) {
      return;
    }

    const success = await this.copyToClipboard(text);
    if (success) {
      // Buscar el botón que activó la copia
      const button = document.querySelector(`button[onclick*="copyPaymentItem('${transactionId}', '${itemType}')"]`);
      if (button) {
        this.showCopyNotification(button);
      }
    }
  }

  /**
   * Copiar todos los datos de pago al portapapeles
   */
  async copyAllPaymentData(transactionId) {
    const bancoEl = document.getElementById(`payment-banco-${transactionId}`);
    const cedulaEl = document.getElementById(`payment-cedula-${transactionId}`);
    const telefonoEl = document.getElementById(`payment-telefono-${transactionId}`);

    if (!bancoEl || !cedulaEl || !telefonoEl) {
      console.error("Elementos de pago no encontrados");
      return;
    }

    const banco = bancoEl.textContent.trim();
    const cedula = cedulaEl.textContent.trim();
    const telefono = telefonoEl.textContent.trim();

    const allData = `Banco: ${banco}\nCédula: ${cedula}\nTeléfono: ${telefono}`;

    const success = await this.copyToClipboard(allData);
    if (success) {
      // Buscar el botón "Copiar Todo"
      const button = document.querySelector(`button[onclick*="copyAllPaymentData('${transactionId}')"]`);
      if (button) {
        this.showCopyNotification(button);
      }
    }
  }

  /**
   * Obtener información del tipo de transacción
   */
  getTransactionTypeInfo(categoria) {
    return categoria === TRANSACTION_TYPES.DEPOSITO.key
      ? TRANSACTION_TYPES.DEPOSITO
      : TRANSACTION_TYPES.RETIRO;
  }

  /**
   * Crear tarjeta de transacción
   */
  createTransactionCard(transaccion) {
    const card = document.createElement("div");
    card.className = "transaction-card";
    card.dataset.transactionId = transaccion._id;
    card.dataset.status = transaccion.estado || "pendiente";

    const tipoInfo = this.getTransactionTypeInfo(transaccion.categoria);
    const estado = transaccion.estado || "pendiente";

    card.innerHTML = `
      <div class="transaction-header">
        <div class="transaction-type ${tipoInfo.class}">
          ${tipoInfo.icon} ${tipoInfo.label}
        </div>
        <div class="transaction-amount">
          ${this.formatAmount(transaccion.monto)} Bs
        </div>
      </div>
      
      <div class="transaction-details">
        <p><strong>Descripción:</strong> ${
          transaccion.descripcion || "Sin descripción"
        }</p>
        <p><strong>Categoría:</strong> ${transaccion.categoria || "N/A"}</p>
        <p><strong>Estado:</strong> ${this.formatEstado(estado)}</p>
        <p><strong>Fecha:</strong> ${new Date(
          transaccion.createdAt
        ).toLocaleString()}</p>
        ${
          transaccion._id
            ? `<p><strong>ID Transacción:</strong> ${this.formatReference(
                transaccion._id
              )}</p>`
            : ""
        }
        ${
          transaccion.jugadorId
            ? `<p><strong>Jugador:</strong> ${
                transaccion.jugadorId.username ||
                transaccion.jugadorId.nickname ||
                "N/A"
              }</p>`
            : ""
        }
        ${this.renderPaymentDetails(transaccion.datosPago)}
      </div>
      
      <div class="transaction-actions">
        ${this.renderActionButtons(transaccion, estado)}
      </div>
    `;

    return card;
  }

  /**
   * Formatear estado para mostrar
   */
  formatEstado(estado) {
    const estados = {
      pendiente: "⏳ Pendiente",
      en_proceso: "🔄 En Proceso",
      realizada: "💳 Pago Realizado",
      confirmada: "✅ Confirmada",
      completada: "✅ Completada",
      completada_con_ajuste: "✅ Completada (Ajuste)",
      rechazada: "❌ Rechazada",
      cancelada: "🚫 Cancelada",
      fallida: "⚠️ Fallida",
      revertida: "↩️ Revertida",
      requiere_revision_admin: "🔍 Revisión Admin",
    };
    return estados[estado] || estado;
  }

  /**
   * Renderizar botones de acción según el estado
   */
  renderActionButtons(transaccion, estado) {
    switch (estado) {
      case "pendiente":
        return `
          <button class="btn-action btn-accept" onclick="acceptTransaction('${transaccion._id}')" data-transaction-id="${transaccion._id}">
            <span class="btn-text">✅ Aceptar</span>
            <span class="btn-loading" style="display: none;">⏳ Procesando...</span>
          </button>
        `;
      case "en_proceso":
        if (transaccion.categoria === "retiro") {
          return `
          <button class="btn-action btn-confirm" onclick="reportarTransferenciaRetiro('${transaccion._id}')">
            💸 Reportar Transferencia
          </button>
          <button class="btn-action btn-view" onclick="viewTransactionDetails('${transaccion._id}')">
            👁️ Ver Detalles
          </button>
        `;
        }
        return `
          <button class="btn-action btn-view" onclick="viewTransactionDetails('${transaccion._id}')">
            👁️ Ver Detalles
          </button>
        `;
      case "realizada":
        return `
          <button class="btn-action btn-confirm" onclick="verifyPayment('${transaccion._id}')">
            🔍 Verificar Pago
          </button>
        `;
      case "confirmada":
        return `
          <button class="btn-action btn-view" onclick="viewTransactionDetails('${transaccion._id}')">
            👁️ Ver Detalles
          </button>
        `;
      default:
        return `
          <button class="btn-action btn-accept" onclick="acceptTransaction('${transaccion._id}')" data-transaction-id="${transaccion._id}">
            <span class="btn-text">✅ Aceptar</span>
            <span class="btn-loading" style="display: none;">⏳ Procesando...</span>
          </button>
        `;
    }
  }

  /**
   * Renderizar detalles de pago
   */
  renderPaymentDetails(datosPago) {
    if (!datosPago) return "";

    return `
      <p><strong>Método:</strong> ${datosPago.metodo || "N/A"}</p>
      ${
        datosPago.banco
          ? `<p><strong>Banco:</strong> ${datosPago.banco}</p>`
          : ""
      }
      ${
        datosPago.telefono
          ? `<p><strong>Teléfono:</strong> ${datosPago.telefono}</p>`
          : ""
      }
      ${
        datosPago.referencia
          ? `<p><strong>Referencia:</strong> ${this.formatReference(
              datosPago.referencia
            )}</p>`
          : ""
      }
    `;
  }

  /**
   * Aceptar transacción (tomar la transacción)
   */
  async acceptTransaction(transaccionId, token) {
    UI.showConfirmDialog(MESSAGES.CONFIRM.ASSIGN_TRANSACTION, async () => {
      // Mostrar estado de loading en el botón solo después de confirmar
      this.setButtonLoading(transaccionId, true);
      try {
        // 1. Asignar cajero a la transacción via HTTP API
        const asignacionResponse = await API.asignarCajero(
          transaccionId,
          token
        );

        if (!asignacionResponse.ok) {
          const errorData = await asignacionResponse.json();
          UI.showAlert(
            `❌ Error: ${
              errorData.mensaje || MESSAGES.ERROR.ASSIGN_TRANSACTION
            }`
          );
          return;
        }

        // 2. Obtener detalles de la transacción asignada
        const transaccionResponse = await API.getTransaccionDetalle(
          transaccionId,
          token
        );

        if (transaccionResponse.ok) {
          const transaccionData = await transaccionResponse.json();

          // 3. Enviar aceptación via WebSocket
          if (
            window.cajeroWebSocket &&
            window.cajeroWebSocket.isConnected &&
            window.cajeroWebSocket.isAuthenticated
          ) {
            // Enviando aceptación via WebSocket
            window.cajeroWebSocket.aceptarSolicitud(
              transaccionId,
              transaccionData.transaccion
            );
          }

          this.showTransactionDetailsModal(transaccionData.transaccion);
        } else {
          UI.showAlert("✅ " + MESSAGES.SUCCESS.ASSIGN_TRANSACTION);

          // Ejecutar callback para recargar transacciones
          if (this.callbacks.onTransactionAssigned) {
            this.callbacks.onTransactionAssigned();
          }
        }
      } catch (error) {
        console.error("Error aceptando transacción:", error);
        UI.showAlert("❌ Error de conexión al aceptar transacción");

        if (this.callbacks.onTransactionError) {
          this.callbacks.onTransactionError(error);
        }
      } finally {
        // Ocultar estado de loading
        this.setButtonLoading(transaccionId, false);
      }
    });
  }

  /**
   * Establecer estado de loading en botón
   */
  setButtonLoading(transaccionId, loading) {
    const button = document.querySelector(
      `[data-transaction-id="${transaccionId}"]`
    );
    if (button) {
      const textSpan = button.querySelector(".btn-text");
      const loadingSpan = button.querySelector(".btn-loading");

      if (loading) {
        button.disabled = true;
        if (textSpan) textSpan.style.display = "none";
        if (loadingSpan) loadingSpan.style.display = "inline";
      } else {
        button.disabled = false;
        if (textSpan) textSpan.style.display = "inline";
        if (loadingSpan) loadingSpan.style.display = "none";
      }
    }
  }

  /**
   * Mostrar modal de detalles de transacción aceptada
   */
  showTransactionDetailsModal(transaccion) {
    const tipoInfo = this.getTransactionTypeInfo(transaccion.categoria);

    const modalHTML = `
      <div class="transaction-details-modal">
        <div class="modal-header">
          <h2><span class="modal-icon">✅</span> Transacción Aceptada</h2>
          <button onclick="closeTransactionDetails()" class="close-btn">&times;</button>
        </div>
        
        <div class="transaction-info">
          <div class="transaction-header ${tipoInfo.class}">
            <div class="transaction-type">
              ${tipoInfo.icon} ${tipoInfo.label}
            </div>
            <div class="transaction-amount">
              ${this.formatAmount(transaccion.monto)} Bs
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <strong>ID Transacción:</strong>
              <span>${this.formatReference(
                transaccion._id
              )}</span>
            </div>
            
            <div class="detail-item">
              <strong>Jugador:</strong>
              <span>${
                transaccion.jugadorId?.username ||
                transaccion.jugadorId?.nickname ||
                "N/A"
              }</span>
            </div>
            
            <div class="detail-item">
              <strong>Estado:</strong>
              <span class="status-en-proceso">En Proceso</span>
            </div>
            
            <div class="detail-item">
              <strong>Fecha Asignación:</strong>
              <span>${new Date().toLocaleString("es-VE")}</span>
            </div>
          </div>
          
          <div class="payment-info highlighted">
            <div class="payment-header">
              <h3>${transaccion.categoria === "retiro" ? "📤 Datos donde enviar (jugador)" : "📱 Información de Pago Móvil"}</h3>
              <button class="btn-copy-all" onclick="window.transactionManager?.copyAllPaymentData('${transaccion._id}')" title="Copiar todos los datos">
                📋 Copiar Todo
              </button>
            </div>
            <div class="payment-details">
              <div class="payment-item">
                <div class="payment-label-value">
                  <strong>Banco:</strong>
                  <span class="payment-value" id="payment-banco-${transaccion._id}">${
                  transaccion.categoria === "retiro"
                    ? transaccion.infoPago?.bancoDestino || "N/A"
                    : window.CajerosApp?.getCajeroInfo()?.datosPagoMovil?.banco || "N/A"
                }</span>
                </div>
                <button class="btn-copy-item" onclick="window.transactionManager?.copyPaymentItem('${transaccion._id}', 'banco')" title="Copiar banco">
                  📋
                </button>
              </div>
              <div class="payment-item">
                <div class="payment-label-value">
                  <strong>Cédula:</strong>
                  <span class="payment-value" id="payment-cedula-${transaccion._id}">${
                  transaccion.categoria === "retiro"
                    ? transaccion.infoPago?.cedulaOrigen || "N/A"
                    : (window.CajerosApp?.getCajeroInfo()?.datosPagoMovil?.cedula?.prefijo || "") +
                      "-" +
                      (window.CajerosApp?.getCajeroInfo()?.datosPagoMovil?.cedula?.numero || "N/A")
                }</span>
                </div>
                <button class="btn-copy-item" onclick="window.transactionManager?.copyPaymentItem('${transaccion._id}', 'cedula')" title="Copiar cédula">
                  📋
                </button>
              </div>
              <div class="payment-item">
                <div class="payment-label-value">
                  <strong>Teléfono:</strong>
                  <span class="payment-value" id="payment-telefono-${transaccion._id}">${
                  transaccion.categoria === "retiro"
                    ? transaccion.infoPago?.telefonoOrigen || "N/A"
                    : window.CajerosApp?.getCajeroInfo()?.datosPagoMovil?.telefono || "N/A"
                }</span>
                </div>
                <button class="btn-copy-item" onclick="window.transactionManager?.copyPaymentItem('${transaccion._id}', 'telefono')" title="Copiar teléfono">
                  📋
                </button>
              </div>
            </div>
          </div>
          
          <div class="status-message">
            ${transaccion.categoria === "retiro"
              ? '<p>🔄 <strong>Estado:</strong> Envía el dinero al jugador y haz clic en "Reportar Transferencia" para confirmar.</p>'
              : '<p>🔄 <strong>Estado:</strong> Esperando pago del jugador</p><p>Los datos bancarios han sido enviados al jugador. Recibirás una notificación cuando realice el pago.</p>'
            }
          </div>
        </div>
        
        <div class="modal-actions">
          ${transaccion.categoria === "retiro"
            ? `<button onclick="reportarTransferenciaRetiro('${transaccion._id}')" class="btn btn-primary">💸 Reportar Transferencia</button>
               <button onclick="refreshTransactions(); closeTransactionDetails();" class="btn btn-secondary">Cerrar</button>`
            : `<button onclick="refreshTransactions(); closeTransactionDetails();" class="btn btn-primary">Cerrar</button>`
          }
        </div>
      </div>
    `;

    UI.showTransactionDetailsModal(modalHTML);
  }

  /**
   * Refrescar transacciones (método estático para uso global)
   */
  static async refreshTransactions() {
    const token = window.CajerosApp?.getToken();
    if (token && window.transactionManager) {
      await window.transactionManager.loadTransactions(token);
    }
  }

  /**
   * Aceptar transacción (método estático para uso global)
   */
  static async acceptTransaction(transaccionId) {
    const token = window.CajerosApp?.getToken();
    if (token && window.transactionManager) {
      await window.transactionManager.acceptTransaction(transaccionId, token);
    }
  }

  /**
   * Obtener transacciones actuales
   */
  getTransactions() {
    return this.transactions;
  }

  /**
   * Limpiar transacciones
   */
  clearTransactions() {
    this.transactions = [];
    UI.clearTransactionsList();
    UI.showNoTransactions();
  }
}

// Crear instancia única del gestor de transacciones
const transactionManagerInstance = new TransactionManager();

// Exportar la instancia como TransactionManager
export { transactionManagerInstance as TransactionManager };

// Exportar también la clase para uso global
export { TransactionManager as TransactionManagerClass };
