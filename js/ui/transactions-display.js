/**
 * Módulo de visualización de transacciones
 */

/**
 * Clase para gestionar la visualización de transacciones
 */
export class TransactionsDisplayManager {
  constructor(elements) {
    this.elements = elements;
  }

  /**
   * Configurar event listeners para pestañas
   */
  setupTabEventListeners(eventHandlers) {
    this.elements.tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const tabName = e.currentTarget.dataset.tab;
        if (eventHandlers.onTabSwitch) {
          eventHandlers.onTabSwitch(tabName);
        }
      });
    });
  }

  /**
   * Mostrar estado de carga de transacciones
   */
  showLoadingTransactions(show) {
    if (this.elements.loadingTransactions) {
      this.elements.loadingTransactions.style.display = show ? "block" : "none";
    }
  }

  /**
   * Mostrar mensaje de no transacciones
   */
  showNoTransactions() {
    if (this.elements.noTransactions) {
      this.elements.noTransactions.style.display = "block";
    }
    if (this.elements.transactionsList) {
      this.elements.transactionsList.innerHTML = "";
    }
  }

  /**
   * Ocultar mensaje de no transacciones
   */
  hideNoTransactions() {
    if (this.elements.noTransactions) {
      this.elements.noTransactions.style.display = "none";
    }
  }

  /**
   * Limpiar lista de transacciones
   */
  clearTransactionsList() {
    if (this.elements.transactionsList) {
      this.elements.transactionsList.innerHTML = "";
    }
  }

  /**
   * Limpiar lista de transacciones de una pestaña específica
   */
  clearTransactionsListForTab(tabName) {
    const listElement = document.querySelector(`#transactions-list-${tabName}`);
    if (listElement) {
      listElement.innerHTML = "";
    }
  }

  /**
   * Agregar transacción a la lista
   */
  addTransactionToList(transactionElement) {
    if (this.elements.transactionsList) {
      this.elements.transactionsList.appendChild(transactionElement);
    }
  }

  /**
   * Agregar transacción a la lista de una pestaña específica
   */
  addTransactionToListForTab(tabName, transactionElement) {
    const listElement = document.querySelector(`#transactions-list-${tabName}`);
    if (listElement) {
      listElement.appendChild(transactionElement);
    }
  }

  /**
   * Mostrar transacciones para una pestaña específica
   */
  displayTransactionsForTab(tabName, transactions) {
    this.clearTransactionsListForTab(tabName);
    this.hideNoTransactionsForTab(tabName);

    if (!transactions || transactions.length === 0) {
      this.showNoTransactionsForTab(tabName);
      return;
    }

    transactions.forEach((transaccion) => {
      // Crear tarjeta usando TransactionManager
      if (window.transactionManager) {
        const transactionCard =
          window.transactionManager.createTransactionCard(transaccion);
        this.addTransactionToListForTab(tabName, transactionCard);
      }
    });
  }

  /**
   * Cambiar pestaña activa
   */
  switchTab(tabName) {
    // Remover clase active de todos los botones y paneles
    this.elements.tabButtons.forEach((btn) => btn.classList.remove("active"));
    this.elements.tabPanels.forEach((panel) =>
      panel.classList.remove("active")
    );

    // Agregar clase active al botón y panel correspondientes
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activePanel = document.querySelector(`#tab-${tabName}`);

    if (activeButton) {
      activeButton.classList.add("active");
      // Remover notificaciones cuando se activa la pestaña
      activeButton.classList.remove("has-notifications");
    }
    if (activePanel) activePanel.classList.add("active");
  }

  /**
   * Actualizar contador de pestaña
   */
  updateTabCount(tabName, count) {
    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);

    if (tabButton) {
      // Mostrar indicador solo si hay transacciones y la pestaña NO está activa
      if (count > 0 && !tabButton.classList.contains("active")) {
        tabButton.classList.add("has-notifications");
      } else {
        tabButton.classList.remove("has-notifications");
      }
    }
  }

  /**
   * Mostrar mensaje de no transacciones para una pestaña específica
   */
  showNoTransactionsForTab(tabName) {
    const noTransactionsElement = document.querySelector(
      `#no-transactions-${tabName}`
    );
    if (noTransactionsElement) {
      noTransactionsElement.style.display = "block";
    }
  }

  /**
   * Ocultar mensaje de no transacciones para una pestaña específica
   */
  hideNoTransactionsForTab(tabName) {
    const noTransactionsElement = document.querySelector(
      `#no-transactions-${tabName}`
    );
    if (noTransactionsElement) {
      noTransactionsElement.style.display = "none";
    }
  }
}
