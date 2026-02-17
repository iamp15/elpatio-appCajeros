/**
 * Módulo de gestión del historial de transacciones para cajeros
 */

import { TRANSACTION_CONFIG, TRANSACTION_TYPES, FINALIZED_STATES } from "./config.js";
import { API } from "./api.js";
import { UI } from "./ui.js";

// Configuración de carga de historial
const HISTORY_CONFIG = {
  ITEMS_PER_PAGE: 15, // Transacciones por carga
  MAX_ITEMS: 100, // Máximo total de transacciones a cargar
};

class HistoryManager {
  constructor() {
    this.transactions = [];
    this.allTransactions = []; // Todas las transacciones sin paginar
    this.currentPage = 0;
    this.hasMore = false;
    this.isInitialState = true; // Estado inicial sin búsqueda
    this.currentFilters = {
      estado: "",
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
    };
  }

  /**
   * Mostrar estado inicial del historial (sin transacciones cargadas)
   */
  showInitialState() {
    this.isInitialState = true;
    this.transactions = [];
    this.allTransactions = [];
    this.currentPage = 0;
    this.hasMore = false;
    UI.showHistoryInitialState();
  }

  /**
   * Cargar historial de transacciones con filtros
   * @param {string} token - Token de autenticación
   * @param {Object} filters - Filtros opcionales
   * @param {boolean} reset - Si es true, reinicia la paginación
   */
  async loadHistory(token, filters = {}, reset = true) {
    if (!token) return;

    try {
      UI.showLoadingHistory(true);
      UI.hideNoHistory();
      UI.hideHistoryInitialState();

      // Si es reset, reiniciar paginación
      if (reset) {
        this.currentPage = 0;
        this.allTransactions = [];
        this.transactions = [];
      }

      this.isInitialState = false;

      // Combinar filtros actuales con nuevos filtros
      const activeFilters = { ...this.currentFilters, ...filters };
      this.currentFilters = activeFilters;

      // Determinar estados a consultar
      let estadosAConsultar = FINALIZED_STATES;
      
      // Si hay filtro de estado específico, solo consultar ese
      if (activeFilters.estado) {
        estadosAConsultar = [activeFilters.estado];
      }

      // Preparar filtros para la API
      const apiFilters = {};
      if (activeFilters.tipo) {
        apiFilters.tipo = activeFilters.tipo;
      }
      if (activeFilters.fechaInicio) {
        apiFilters.fechaInicio = activeFilters.fechaInicio;
      }
      if (activeFilters.fechaFin) {
        apiFilters.fechaFin = activeFilters.fechaFin;
      }

      // Obtener todas las transacciones del historial (hasta el máximo)
      const todasTransacciones = await API.getHistorialTransacciones(
        estadosAConsultar,
        token,
        apiFilters
      );

      // Guardar todas las transacciones
      this.allTransactions = todasTransacciones.slice(0, HISTORY_CONFIG.MAX_ITEMS);

      // Calcular paginación
      const inicio = 0;
      const fin = HISTORY_CONFIG.ITEMS_PER_PAGE;
      this.transactions = this.allTransactions.slice(inicio, fin);
      this.currentPage = 1;
      this.hasMore = this.allTransactions.length > fin;

      // Mostrar transacciones en la UI
      this.displayHistory();
    } catch (error) {
      console.error("Error cargando historial:", error);
      UI.showNoHistory();
      UI.showAlert("Error al cargar el historial de transacciones");
    } finally {
      UI.showLoadingHistory(false);
    }
  }

  /**
   * Cargar más transacciones (siguiente página)
   */
  loadMore() {
    if (!this.hasMore) return;

    const inicio = this.currentPage * HISTORY_CONFIG.ITEMS_PER_PAGE;
    const fin = inicio + HISTORY_CONFIG.ITEMS_PER_PAGE;
    
    // Agregar más transacciones a las ya mostradas
    const nuevasTransacciones = this.allTransactions.slice(inicio, fin);
    this.transactions = [...this.transactions, ...nuevasTransacciones];
    this.currentPage++;
    this.hasMore = fin < this.allTransactions.length;

    // Actualizar la UI
    this.displayHistory();
  }

  /**
   * Aplicar filtros y recargar historial
   * @param {Object} filters - Nuevos filtros a aplicar
   * @param {string} token - Token de autenticación
   */
  async applyFilters(filters, token) {
    this.currentFilters = { ...this.currentFilters, ...filters };
    await this.loadHistory(token, this.currentFilters);
  }

  /**
   * Limpiar filtros y volver al estado inicial
   */
  clearFilters() {
    this.currentFilters = {
      estado: "",
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
    };
    
    // Resetear UI de filtros
    UI.clearHistoryFilters();
    
    // Volver al estado inicial (sin transacciones)
    this.showInitialState();
  }

  /**
   * Mostrar transacciones en el historial
   */
  displayHistory() {
    if (!this.transactions || this.transactions.length === 0) {
      UI.showNoHistory();
      UI.hideLoadMoreButton();
      UI.updateHistoryCount(0, 0);
      return;
    }

    UI.displayHistoryTransactions(this.transactions);
    
    // Mostrar/ocultar botón de cargar más
    if (this.hasMore) {
      UI.showLoadMoreButton();
    } else {
      UI.hideLoadMoreButton();
    }

    // Actualizar contador
    UI.updateHistoryCount(this.transactions.length, this.allTransactions.length);
  }

  /**
   * Formatear transacción para mostrar en historial
   * @param {Object} transaccion - Transacción a formatear
   * @returns {HTMLElement} - Elemento HTML de la tarjeta
   */
  formatHistoryTransaction(transaccion) {
    const card = document.createElement("div");
    card.className = "transaction-card history-transaction";
    card.dataset.transactionId = transaccion._id;
    card.dataset.status = transaccion.estado || "completada";

    const tipoInfo = this.getTransactionTypeInfo(transaccion.categoria);
    const estado = transaccion.estado || "completada";
    const fechaCreacion = new Date(
      transaccion.createdAt || transaccion.fechaCreacion
    ).toLocaleString("es-VE");
    const fechaProcesamiento = transaccion.fechaProcesamiento
      ? new Date(transaccion.fechaProcesamiento).toLocaleString("es-VE")
      : "N/A";

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
        <p><strong>Estado:</strong> <span class="history-status ${this.getStatusClass(
          estado
        )}">${this.formatEstado(estado)}</span></p>
        <p><strong>Fecha Creación:</strong> ${fechaCreacion}</p>
        ${
          fechaProcesamiento !== "N/A"
            ? `<p><strong>Fecha Procesamiento:</strong> ${fechaProcesamiento}</p>`
            : ""
        }
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
        ${this.renderPaymentDetails(transaccion.infoPago || transaccion.datosPago)}
        ${this.renderMotivoRechazo(transaccion.motivoRechazo)}
        ${this.renderAjusteMonto(transaccion.ajusteMonto)}
      </div>
      
      <div class="transaction-actions">
        <button class="btn-action btn-view" onclick="viewTransactionDetails('${transaccion._id}')">
          👁️ Ver Detalles
        </button>
      </div>
    `;

    return card;
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
   * Formatear estado para mostrar
   */
  formatEstado(estado) {
    const estados = {
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
   * Obtener clase CSS para el estado
   */
  getStatusClass(estado) {
    const classes = {
      completada: "status-completed",
      completada_con_ajuste: "status-completed-adjusted",
      rechazada: "status-rejected",
      cancelada: "status-cancelled",
      fallida: "status-failed",
      revertida: "status-reverted",
      requiere_revision_admin: "status-admin-review",
    };
    return classes[estado] || "";
  }

  /**
   * Renderizar detalles de pago
   */
  renderPaymentDetails(datosPago) {
    if (!datosPago) return "";

    return `
      <div class="payment-details-section">
        <p><strong>Método:</strong> ${datosPago.metodo || "N/A"}</p>
        ${
          datosPago.banco || datosPago.bancoOrigen
            ? `<p><strong>Banco:</strong> ${
                datosPago.banco || datosPago.bancoOrigen
              }</p>`
            : ""
        }
        ${
          datosPago.telefono || datosPago.telefonoOrigen
            ? `<p><strong>Teléfono:</strong> ${
                datosPago.telefono || datosPago.telefonoOrigen
              }</p>`
            : ""
        }
        ${
          datosPago.referencia || datosPago.numeroReferencia
            ? `<p><strong>Referencia:</strong> ${this.formatReference(
                datosPago.referencia || datosPago.numeroReferencia
              )}</p>`
            : ""
        }
      </div>
    `;
  }

  /**
   * Renderizar motivo de rechazo si existe
   */
  renderMotivoRechazo(motivoRechazo) {
    if (!motivoRechazo || !motivoRechazo.descripcionDetallada) return "";

    return `
      <div class="rejection-details-section">
        <p><strong>Motivo de Rechazo:</strong></p>
        <p class="rejection-reason">${motivoRechazo.descripcionDetallada}</p>
        ${
          motivoRechazo.imagenRechazoUrl
            ? `<p><strong>Evidencia:</strong> <a href="${
                motivoRechazo.imagenRechazoUrl
              }" target="_blank">Ver imagen</a></p>`
            : ""
        }
      </div>
    `;
  }

  /**
   * Renderizar ajuste de monto si existe
   */
  renderAjusteMonto(ajusteMonto) {
    if (!ajusteMonto || !ajusteMonto.montoOriginal) return "";

    const imagenHtml = ajusteMonto.imagenAjusteUrl
      ? `<p><strong>Soporte:</strong> <a href="${ajusteMonto.imagenAjusteUrl}" target="_blank" rel="noopener noreferrer">Ver imagen</a></p>`
      : "";

    return `
      <div class="adjustment-details-section">
        <p><strong>Ajuste de Monto:</strong></p>
        <p><strong>Original:</strong> ${this.formatAmount(
          ajusteMonto.montoOriginal
        )} Bs</p>
        <p><strong>Real:</strong> ${this.formatAmount(ajusteMonto.montoReal)} Bs</p>
        ${
          ajusteMonto.razon
            ? `<p><strong>Razón:</strong> ${ajusteMonto.razon}</p>`
            : ""
        }
        ${imagenHtml}
      </div>
    `;
  }

  /**
   * Obtener filtros actuales
   */
  getCurrentFilters() {
    return { ...this.currentFilters };
  }

  /**
   * Limpiar historial
   */
  clearHistory() {
    this.transactions = [];
    this.allTransactions = [];
    this.currentPage = 0;
    this.hasMore = false;
    this.isInitialState = true;
    UI.clearHistoryList();
  }

  /**
   * Verificar si hay más transacciones para cargar
   */
  hasMoreTransactions() {
    return this.hasMore;
  }

  /**
   * Verificar si está en estado inicial
   */
  isInInitialState() {
    return this.isInitialState;
  }

  /**
   * Obtener información de paginación
   */
  getPaginationInfo() {
    return {
      showing: this.transactions.length,
      total: this.allTransactions.length,
      hasMore: this.hasMore,
      currentPage: this.currentPage,
    };
  }
}

// Crear instancia única del gestor de historial
const historyManagerInstance = new HistoryManager();

// Exportar la instancia como HistoryManager
export { historyManagerInstance as HistoryManager };