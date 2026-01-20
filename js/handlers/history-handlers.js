/**
 * Handlers de historial
 */

import { HistoryManager } from "../history.js";

/**
 * Crear handlers de historial
 */
export function createHistoryHandlers(app) {
  return {
    /**
     * Manejar aplicar filtros del historial (buscar)
     */
    async handleApplyHistoryFilters() {
      const filters = app.getUI().getHistoryFilters();
      const token = app.getToken();
      if (token) {
        await HistoryManager.loadHistory(token, filters, true);
      }
    },

    /**
     * Manejar limpiar filtros del historial
     */
    handleClearHistoryFilters() {
      HistoryManager.clearFilters();
    },

    /**
     * Manejar cargar más transacciones del historial
     */
    handleLoadMoreHistory() {
      HistoryManager.loadMore();
    }
  };
}
