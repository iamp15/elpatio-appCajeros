/**
 * Módulo de inicialización y gestión de referencias a elementos DOM
 */

import { DOM_SELECTORS } from "../config.js";

/**
 * Clase para gestionar referencias a elementos DOM
 */
export class ElementsManager {
  constructor() {
    this.elements = {};
  }

  /**
   * Inicializar todas las referencias a elementos del DOM
   */
  initElements() {
    // Pantallas
    this.elements.loginScreen = document.querySelector(
      DOM_SELECTORS.LOGIN_SCREEN
    );
    this.elements.dashboardScreen = document.querySelector(
      DOM_SELECTORS.DASHBOARD_SCREEN
    );
    this.elements.perfilScreen = document.querySelector(
      DOM_SELECTORS.PERFIL_SCREEN
    );

    // Menú lateral
    this.elements.sidebarOverlay = document.querySelector(
      DOM_SELECTORS.SIDEBAR_OVERLAY
    );
    this.elements.sidebarMenu = document.querySelector(
      DOM_SELECTORS.SIDEBAR_MENU
    );
    this.elements.menuToggleBtn = document.querySelector(
      DOM_SELECTORS.MENU_TOGGLE_BTN
    );
    this.elements.sidebarCloseBtn = document.querySelector(
      DOM_SELECTORS.SIDEBAR_CLOSE_BTN
    );
    this.elements.sidebarNavItems = document.querySelectorAll(
      DOM_SELECTORS.SIDEBAR_NAV_ITEMS
    );
    this.elements.sidebarLogoutBtn = document.querySelector(
      DOM_SELECTORS.SIDEBAR_LOGOUT_BTN
    );
    this.elements.sidebarUserName = document.querySelector(
      DOM_SELECTORS.SIDEBAR_USER_NAME
    );
    this.elements.sidebarUserEmail = document.querySelector(
      DOM_SELECTORS.SIDEBAR_USER_EMAIL
    );

    // Formulario de login
    this.elements.loginForm = document.querySelector(DOM_SELECTORS.LOGIN_FORM);
    this.elements.loginBtn = document.querySelector(DOM_SELECTORS.LOGIN_BTN);
    this.elements.loginText = document.querySelector(DOM_SELECTORS.LOGIN_TEXT);
    this.elements.loginLoading = document.querySelector(
      DOM_SELECTORS.LOGIN_LOADING
    );
    this.elements.errorMessage = document.querySelector(
      DOM_SELECTORS.ERROR_MESSAGE
    );

    // Botones de acción
    this.elements.refreshBtn = document.querySelector(
      DOM_SELECTORS.REFRESH_BTN
    );

    // Información del cajero (dashboard)
    this.elements.cajeroName = document.querySelector(
      DOM_SELECTORS.CAJERO_NAME
    );

    // Perfil
    this.elements.perfilNombre = document.querySelector(
      DOM_SELECTORS.PERFIL_NOMBRE
    );
    this.elements.perfilEmail = document.querySelector(
      DOM_SELECTORS.PERFIL_EMAIL
    );
    this.elements.perfilTelefono = document.querySelector(
      DOM_SELECTORS.PERFIL_TELEFONO
    );
    this.elements.perfilBanco = document.querySelector(
      DOM_SELECTORS.PERFIL_BANCO
    );
    this.elements.perfilCedula = document.querySelector(
      DOM_SELECTORS.PERFIL_CEDULA
    );
    this.elements.perfilTelefonoPago = document.querySelector(
      DOM_SELECTORS.PERFIL_TELEFONO_PAGO
    );
    this.elements.perfilWsStatus = document.querySelector(
      DOM_SELECTORS.PERFIL_WS_STATUS
    );

    // Transacciones
    this.elements.loadingTransactions = document.querySelector(
      DOM_SELECTORS.LOADING_TRANSACTIONS
    );
    this.elements.transactionsList = document.querySelector(
      DOM_SELECTORS.TRANSACTIONS_LIST
    );
    this.elements.noTransactions = document.querySelector(
      DOM_SELECTORS.NO_TRANSACTIONS
    );

    // Pestañas
    this.elements.tabButtons = document.querySelectorAll(".tab-btn");
    this.elements.tabPanels = document.querySelectorAll(".tab-panel");

    // Historial
    this.elements.historialScreen = document.querySelector(
      DOM_SELECTORS.HISTORIAL_SCREEN
    );
    this.elements.loadingHistory = document.querySelector(
      DOM_SELECTORS.LOADING_HISTORY
    );
    this.elements.historyList = document.querySelector(DOM_SELECTORS.HISTORY_LIST);
    this.elements.noHistory = document.querySelector(DOM_SELECTORS.NO_HISTORY);
    this.elements.historyInitialState = document.querySelector(
      DOM_SELECTORS.HISTORY_INITIAL_STATE
    );
    this.elements.historyCount = document.querySelector(DOM_SELECTORS.HISTORY_COUNT);
    this.elements.historyShowing = document.querySelector(DOM_SELECTORS.HISTORY_SHOWING);
    this.elements.historyTotal = document.querySelector(DOM_SELECTORS.HISTORY_TOTAL);
    this.elements.loadMoreContainer = document.querySelector(
      DOM_SELECTORS.LOAD_MORE_CONTAINER
    );
    this.elements.loadMoreBtn = document.querySelector(DOM_SELECTORS.LOAD_MORE_BTN);
    this.elements.filterEstado = document.querySelector(DOM_SELECTORS.FILTER_ESTADO);
    this.elements.filterTipo = document.querySelector(DOM_SELECTORS.FILTER_TIPO);
    this.elements.filterFechaInicio = document.querySelector(
      DOM_SELECTORS.FILTER_FECHA_INICIO
    );
    this.elements.filterFechaFin = document.querySelector(
      DOM_SELECTORS.FILTER_FECHA_FIN
    );
  }

  /**
   * Obtener todos los elementos
   */
  getElements() {
    return this.elements;
  }

  /**
   * Obtener un elemento específico
   */
  getElement(key) {
    return this.elements[key];
  }
}
