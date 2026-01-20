/**
 * Módulo de gestión de historial en la UI
 */

import { APP_STATES } from "../config.js";

/**
 * Clase para gestionar la interfaz del historial
 */
export class HistoryUIManager {
  constructor(elements) {
    this.elements = elements;
  }

  /**
   * Configurar event listeners para historial
   */
  setupHistoryEventListeners(eventHandlers) {
    const applyFiltersBtn = document.querySelector(
      "#apply-filters-btn"
    );
    const clearFiltersBtn = document.querySelector(
      "#clear-filters-btn"
    );
    const loadMoreBtn = document.querySelector("#load-more-btn");

    if (applyFiltersBtn && eventHandlers.onApplyHistoryFilters) {
      applyFiltersBtn.addEventListener("click", eventHandlers.onApplyHistoryFilters);
    }

    if (clearFiltersBtn && eventHandlers.onClearHistoryFilters) {
      clearFiltersBtn.addEventListener("click", eventHandlers.onClearHistoryFilters);
    }

    if (loadMoreBtn && eventHandlers.onLoadMoreHistory) {
      loadMoreBtn.addEventListener("click", eventHandlers.onLoadMoreHistory);
    }
  }

  /**
   * Mostrar pantalla de historial
   */
  showHistoryScreen() {
    if (this.elements.historialScreen) {
      this.elements.historialScreen.classList.add("active");
    }
    if (this.elements.dashboardScreen) {
      this.elements.dashboardScreen.classList.remove("active");
    }
    if (this.elements.loginScreen) {
      this.elements.loginScreen.classList.remove("active");
    }
  }

  /**
   * Ocultar pantalla de historial
   */
  hideHistoryScreen() {
    if (this.elements.historialScreen) {
      this.elements.historialScreen.classList.remove("active");
    }
  }

  /**
   * Mostrar estado de carga del historial
   */
  showLoadingHistory(show) {
    if (this.elements.loadingHistory) {
      this.elements.loadingHistory.style.display = show ? "block" : "none";
    }
  }

  /**
   * Mostrar mensaje de no historial
   */
  showNoHistory() {
    if (this.elements.noHistory) {
      this.elements.noHistory.style.display = "block";
    }
    if (this.elements.historyList) {
      this.elements.historyList.innerHTML = "";
    }
  }

  /**
   * Ocultar mensaje de no historial
   */
  hideNoHistory() {
    if (this.elements.noHistory) {
      this.elements.noHistory.style.display = "none";
    }
  }

  /**
   * Limpiar lista de historial
   */
  clearHistoryList() {
    if (this.elements.historyList) {
      this.elements.historyList.innerHTML = "";
    }
  }

  /**
   * Mostrar transacciones en el historial
   */
  displayHistoryTransactions(transacciones) {
    this.clearHistoryList();
    this.hideNoHistory();

    if (!transacciones || transacciones.length === 0) {
      this.showNoHistory();
      return;
    }

    transacciones.forEach((transaccion) => {
      if (window.historyManager) {
        const transactionCard =
          window.historyManager.formatHistoryTransaction(transaccion);
        if (this.elements.historyList) {
          this.elements.historyList.appendChild(transactionCard);
        }
      }
    });
  }

  /**
   * Limpiar filtros del historial en la UI
   */
  clearHistoryFilters() {
    if (this.elements.filterEstado) {
      this.elements.filterEstado.value = "";
    }
    if (this.elements.filterTipo) {
      this.elements.filterTipo.value = "";
    }
    if (this.elements.filterFechaInicio) {
      this.elements.filterFechaInicio.value = "";
    }
    if (this.elements.filterFechaFin) {
      this.elements.filterFechaFin.value = "";
    }
  }

  /**
   * Obtener filtros actuales del historial desde la UI
   */
  getHistoryFilters() {
    return {
      estado: this.elements.filterEstado?.value || "",
      tipo: this.elements.filterTipo?.value || "",
      fechaInicio: this.elements.filterFechaInicio?.value || "",
      fechaFin: this.elements.filterFechaFin?.value || "",
    };
  }

  /**
   * Mostrar estado inicial del historial
   */
  showHistoryInitialState() {
    if (this.elements.historyInitialState) {
      this.elements.historyInitialState.style.display = "block";
    }
    this.hideNoHistory();
    this.clearHistoryList();
    this.hideLoadMoreButton();
    this.hideHistoryCount();
  }

  /**
   * Ocultar estado inicial del historial
   */
  hideHistoryInitialState() {
    if (this.elements.historyInitialState) {
      this.elements.historyInitialState.style.display = "none";
    }
  }

  /**
   * Mostrar botón de cargar más
   */
  showLoadMoreButton() {
    if (this.elements.loadMoreContainer) {
      this.elements.loadMoreContainer.style.display = "block";
    }
  }

  /**
   * Ocultar botón de cargar más
   */
  hideLoadMoreButton() {
    if (this.elements.loadMoreContainer) {
      this.elements.loadMoreContainer.style.display = "none";
    }
  }

  /**
   * Actualizar contador de historial
   */
  updateHistoryCount(showing, total) {
    if (this.elements.historyCount) {
      if (total > 0) {
        this.elements.historyCount.style.display = "block";
        if (this.elements.historyShowing) {
          this.elements.historyShowing.textContent = showing;
        }
        if (this.elements.historyTotal) {
          this.elements.historyTotal.textContent = total;
        }
      } else {
        this.elements.historyCount.style.display = "none";
      }
    }
  }

  /**
   * Ocultar contador de historial
   */
  hideHistoryCount() {
    if (this.elements.historyCount) {
      this.elements.historyCount.style.display = "none";
    }
  }
}
