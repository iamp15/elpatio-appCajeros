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
    }
  };
}
