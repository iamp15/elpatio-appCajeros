/**
 * Módulo de gestión de saldo para cajeros
 */

import { API } from "./api.js";
import { formatearMontoVenezolano } from "./config.js";

// Configuración de carga de historial
const SALDO_CONFIG = {
  ITEMS_PER_PAGE: 20, // Registros por carga
  MAX_ITEMS: 100, // Máximo total de registros a cargar
};

class SaldoManager {
  constructor() {
    this.saldoActual = 0;
    this.historial = [];
    this.allHistorial = []; // Todos los registros sin paginar
    this.currentPage = 0;
    this.hasMore = false;
    this.isInitialState = true; // Estado inicial sin búsqueda
    this.currentFilters = {
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
    };
    this.saldoCargado = false; // Flag para saber si el saldo ya fue cargado
  }

  /**
   * Formatear monto de centavos a Bs con formato venezolano
   * @param {number} monto - Monto en centavos
   * @returns {string} - Monto formateado en Bs (formato venezolano: coma para decimales, punto para miles)
   */
  formatearSaldo(monto) {
    return formatearMontoVenezolano(monto);
  }

  /**
   * Formatear fecha
   * @param {string|Date} fecha - Fecha a formatear
   * @returns {string} - Fecha formateada
   */
  formatearFecha(fecha) {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleString("es-VE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Cargar saldo actual del cajero
   * @param {string} token - Token de autenticación
   */
  async cargarSaldoActual(token) {
    if (!token) return;

    try {
      // Mostrar spinner de carga
      this.mostrarCargaSaldo(true);

      const response = await API.getSaldo(token);
      const data = await API.processResponse(response);

      if (data.saldo !== undefined) {
        this.saldoActual = data.saldo;
        this.saldoCargado = true;
      }
    } catch (error) {
      console.error("Error cargando saldo:", error);
      // En caso de error, mantener saldo en 0 pero marcar como cargado para mostrar
      this.saldoCargado = true;
    } finally {
      // Ocultar spinner y mostrar saldo cuando termine la carga
      this.mostrarCargaSaldo(false);
      this.mostrarSaldoActual();
    }
  }

  /**
   * Mostrar u ocultar spinner de carga del saldo
   * @param {boolean} mostrar - Si es true, muestra el spinner; si es false, lo oculta
   */
  mostrarCargaSaldo(mostrar) {
    const loadingElement = document.getElementById("saldo-loading");
    const saldoElement = document.getElementById("saldo-amount");

    if (loadingElement) {
      loadingElement.style.display = mostrar ? "flex" : "none";
    }

    if (saldoElement) {
      // Ocultar el saldo mientras se carga
      if (mostrar) {
        saldoElement.style.display = "none";
      }
      // El saldo se mostrará explícitamente en mostrarSaldoActual() cuando termine la carga
    }
  }

  /**
   * Mostrar saldo actual en la UI
   */
  mostrarSaldoActual() {
    const saldoElement = document.getElementById("saldo-amount");
    const loadingElement = document.getElementById("saldo-loading");
    
    if (saldoElement) {
      saldoElement.textContent = `${this.formatearSaldo(this.saldoActual)} Bs`;
      // Mostrar el saldo solo si ya se cargó
      if (this.saldoCargado) {
        saldoElement.style.display = "block";
        // Asegurar que el spinner esté oculto
        if (loadingElement) {
          loadingElement.style.display = "none";
        }
      }
    }
  }

  /**
   * Mostrar estado inicial del historial (sin registros cargados)
   */
  showInitialState() {
    this.isInitialState = true;
    this.historial = [];
    this.allHistorial = [];
    this.currentPage = 0;
    this.hasMore = false;
    this.mostrarEstadoInicial();
  }

  /**
   * Mostrar estado inicial en la UI
   */
  mostrarEstadoInicial() {
    const initialState = document.getElementById("saldo-history-initial-state");
    const loading = document.getElementById("loading-saldo-history");
    const table = document.getElementById("saldo-history-table");
    const noHistory = document.getElementById("no-saldo-history");
    const count = document.getElementById("saldo-history-count");
    const loadMore = document.getElementById("saldo-load-more-container");

    if (initialState) initialState.style.display = "block";
    if (loading) loading.style.display = "none";
    if (table) table.style.display = "none";
    if (noHistory) noHistory.style.display = "none";
    if (count) count.style.display = "none";
    if (loadMore) loadMore.style.display = "none";
  }

  /**
   * Cargar historial de cambios de saldo
   * @param {string} token - Token de autenticación
   * @param {Object} filters - Filtros opcionales
   * @param {boolean} reset - Si es true, reinicia la paginación
   */
  async cargarHistorialSaldo(token, filters = {}, reset = true) {
    if (!token) return;

    try {
      this.mostrarCarga(true);
      this.ocultarNoHistorial();
      this.ocultarEstadoInicial();

      // Si es reset, reiniciar paginación
      if (reset) {
        this.currentPage = 0;
        this.allHistorial = [];
        this.historial = [];
      }

      this.isInitialState = false;

      // Combinar filtros actuales con nuevos filtros
      const activeFilters = { ...this.currentFilters, ...filters };
      this.currentFilters = activeFilters;

      // Preparar filtros para la API
      const apiFilters = {
        limit: SALDO_CONFIG.MAX_ITEMS,
        skip: 0,
      };
      if (activeFilters.tipo) {
        apiFilters.tipo = activeFilters.tipo;
      }
      if (activeFilters.fechaInicio) {
        apiFilters.fechaInicio = activeFilters.fechaInicio;
      }
      if (activeFilters.fechaFin) {
        apiFilters.fechaFin = activeFilters.fechaFin;
      }

      // Obtener historial de saldo
      const response = await API.getHistorialSaldo(token, apiFilters);
      const data = await API.processResponse(response);

      // Guardar todos los registros
      this.allHistorial = data.historial || [];

      // Calcular paginación
      const inicio = this.currentPage * SALDO_CONFIG.ITEMS_PER_PAGE;
      const fin = inicio + SALDO_CONFIG.ITEMS_PER_PAGE;
      this.historial = this.allHistorial.slice(inicio, fin);
      this.hasMore = fin < this.allHistorial.length;

      // Mostrar resultados
      this.mostrarCarga(false);
      this.mostrarHistorial();
      this.mostrarContador(data.total || 0);
      this.mostrarBotonCargarMas();
    } catch (error) {
      console.error("Error cargando historial de saldo:", error);
      this.mostrarCarga(false);
      this.mostrarNoHistorial();
    }
  }

  /**
   * Cargar más registros (paginación)
   * @param {string} token - Token de autenticación
   */
  async cargarMas(token) {
    if (!this.hasMore || !token) return;

    this.currentPage++;
    const inicio = this.currentPage * SALDO_CONFIG.ITEMS_PER_PAGE;
    const fin = inicio + SALDO_CONFIG.ITEMS_PER_PAGE;
    const nuevosRegistros = this.allHistorial.slice(inicio, fin);

    this.historial = [...this.historial, ...nuevosRegistros];
    this.hasMore = fin < this.allHistorial.length;

    this.mostrarHistorial();
    this.mostrarBotonCargarMas();
  }

  /**
   * Mostrar historial en la tabla
   */
  mostrarHistorial() {
    const tbody = document.getElementById("saldo-history-tbody");
    const table = document.getElementById("saldo-history-table");
    const noHistory = document.getElementById("no-saldo-history");
    const initialState = document.getElementById("saldo-history-initial-state");

    if (!tbody) return;

    if (this.historial.length === 0) {
      if (table) table.style.display = "none";
      if (noHistory) noHistory.style.display = "block";
      if (initialState) initialState.style.display = "none";
      return;
    }

    if (table) table.style.display = "table";
    if (noHistory) noHistory.style.display = "none";
    if (initialState) initialState.style.display = "none";

    tbody.innerHTML = this.historial
      .map((registro) => {
        const tipoClass = `tipo-${registro.tipo}`;
        const montoClass = registro.monto >= 0 ? "monto-positivo" : "monto-negativo";
        const montoFormateado = this.formatearSaldo(Math.abs(registro.monto));
        const signo = registro.monto >= 0 ? "+" : "-";

        return `
          <tr>
            <td>${this.formatearFecha(registro.fechaCreacion)}</td>
            <td><span class="${tipoClass}">${this.formatearTipo(registro.tipo)}</span></td>
            <td><span class="${montoClass}">${signo}${montoFormateado} Bs</span></td>
            <td class="saldo-anterior">${this.formatearSaldo(registro.saldoAnterior)} Bs</td>
            <td class="saldo-nuevo">${this.formatearSaldo(registro.saldoNuevo)} Bs</td>
            <td>${registro.descripcion || "-"}</td>
          </tr>
        `;
      })
      .join("");
  }

  /**
   * Formatear tipo de operación
   * @param {string} tipo - Tipo de operación
   * @returns {string} - Tipo formateado
   */
  formatearTipo(tipo) {
    const tipos = {
      deposito: "Depósito",
      retiro: "Retiro",
      ajuste_manual: "Ajuste Manual",
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Mostrar estado de carga
   */
  mostrarCarga(mostrar) {
    const loading = document.getElementById("loading-saldo-history");
    if (loading) {
      loading.style.display = mostrar ? "block" : "none";
    }
  }

  /**
   * Mostrar contador de resultados
   */
  mostrarContador(total) {
    const count = document.getElementById("saldo-history-count");
    const showing = document.getElementById("saldo-history-showing");
    const totalSpan = document.getElementById("saldo-history-total");

    if (count) {
      count.style.display = "block";
      if (showing) showing.textContent = this.historial.length;
      if (totalSpan) totalSpan.textContent = total;
    }
  }

  /**
   * Mostrar botón de cargar más
   */
  mostrarBotonCargarMas() {
    const loadMore = document.getElementById("saldo-load-more-container");
    if (loadMore) {
      loadMore.style.display = this.hasMore ? "block" : "none";
    }
  }

  /**
   * Ocultar mensaje de no hay historial
   */
  ocultarNoHistorial() {
    const noHistory = document.getElementById("no-saldo-history");
    if (noHistory) noHistory.style.display = "none";
  }

  /**
   * Mostrar mensaje de no hay historial
   */
  mostrarNoHistorial() {
    const noHistory = document.getElementById("no-saldo-history");
    if (noHistory) noHistory.style.display = "block";
  }

  /**
   * Ocultar estado inicial
   */
  ocultarEstadoInicial() {
    const initialState = document.getElementById("saldo-history-initial-state");
    if (initialState) initialState.style.display = "none";
  }

  /**
   * Obtener filtros del formulario
   * @returns {Object} - Filtros actuales
   */
  obtenerFiltros() {
    const tipo = document.getElementById("saldo-filter-tipo")?.value || "";
    const fechaInicio = document.getElementById("saldo-filter-fecha-inicio")?.value || "";
    const fechaFin = document.getElementById("saldo-filter-fecha-fin")?.value || "";

    return {
      tipo,
      fechaInicio,
      fechaFin,
    };
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros() {
    const tipoSelect = document.getElementById("saldo-filter-tipo");
    const fechaInicioInput = document.getElementById("saldo-filter-fecha-inicio");
    const fechaFinInput = document.getElementById("saldo-filter-fecha-fin");

    if (tipoSelect) tipoSelect.value = "";
    if (fechaInicioInput) fechaInicioInput.value = "";
    if (fechaFinInput) fechaFinInput.value = "";

    this.currentFilters = {
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
    };
  }
}

// Crear instancia única del gestor de saldo
export const saldoManager = new SaldoManager();
