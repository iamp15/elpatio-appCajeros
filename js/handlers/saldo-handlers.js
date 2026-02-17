/**
 * Handlers de saldo
 */

import { saldoManager } from "../saldo.js";
import { Auth } from "../auth.js";

/**
 * Crear handlers de saldo
 */
export function createSaldoHandlers(app) {
  return {
    /**
     * Manejar refresh de saldo
     */
    async handleRefreshSaldo() {
      if (Auth.isAuthenticated()) {
        const token = Auth.getToken();
        // Mostrar spinner al refrescar
        saldoManager.mostrarCargaSaldo(true);
        await saldoManager.cargarSaldoActual(token);
      }
    },

    /**
     * Manejar aplicar filtros del historial de saldo (buscar)
     */
    async handleApplySaldoFilters() {
      const filters = saldoManager.obtenerFiltros();
      const token = Auth.getToken();
      if (token) {
        await saldoManager.cargarHistorialSaldo(token, filters, true);
      }
    },

    /**
     * Manejar limpiar filtros del historial de saldo
     */
    handleClearSaldoFilters() {
      saldoManager.limpiarFiltros();
    },

    /**
     * Manejar cargar más registros del historial de saldo
     */
    async handleLoadMoreSaldo() {
      const token = Auth.getToken();
      if (token) {
        await saldoManager.cargarMas(token);
      }
    },

    /**
     * Manejar cambio de tab en la sección de saldo
     */
    handleSaldoTabChange(tabName) {
      // Ocultar todos los contenidos de tabs
      const tabContents = document.querySelectorAll(".saldo-tab-content");
      tabContents.forEach((content) => {
        content.style.display = "none";
      });

      // Remover clase active de todos los botones
      const tabButtons = document.querySelectorAll("[data-saldo-tab]");
      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      // Mostrar el contenido del tab seleccionado
      const selectedContent = document.getElementById(`saldo-tab-${tabName}`);
      if (selectedContent) {
        selectedContent.style.display = "block";
      }

      // Agregar clase active al botón seleccionado
      const selectedButton = document.querySelector(`[data-saldo-tab="${tabName}"]`);
      if (selectedButton) {
        selectedButton.classList.add("active");
      }
    }
  };
}
