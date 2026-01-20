/**
 * Módulo principal de UI que orquesta todos los submódulos
 * Mantiene la misma API pública que el UIManager original
 */

import { APP_STATES } from "../config.js";
import { ElementsManager } from "./elements.js";
import { ScreensManager } from "./screens.js";
import { SidebarManager } from "./sidebar.js";
import { AlertsManager } from "./alerts.js";
import { CajeroDisplayManager } from "./cajero-display.js";
import { TransactionsDisplayManager } from "./transactions-display.js";
import { ModalsManager } from "./modals.js";
import { VerificationModalsManager } from "./modals-verification.js";
import { PaymentModalsManager } from "./modals-payment.js";
import { RejectionModalsManager } from "./modals-rejection.js";
import { HistoryUIManager } from "./history.js";

/**
 * Clase principal UIManager que orquesta todos los módulos de UI
 */
class UIManager {
  constructor() {
    // Inicializar gestor de elementos DOM
    this.elementsManager = new ElementsManager();
    this.elementsManager.initElements();
    this.elements = this.elementsManager.getElements();
    
    // Inicializar gestores de módulos
    this.screens = new ScreensManager(this.elements);
    this.sidebar = new SidebarManager(this.elements);
    this.alerts = new AlertsManager(this.elements);
    this.cajeroDisplay = new CajeroDisplayManager(this.elements);
    this.transactionsDisplay = new TransactionsDisplayManager(this.elements);
    this.historyUI = new HistoryUIManager(this.elements);
    
    // Inicializar gestores de modales con callbacks
    this.modals = new ModalsManager();
    this.rejectionModals = new RejectionModalsManager(
      (message, type) => this.alerts.showAlert(message, type)
    );
    this.verificationModals = new VerificationModalsManager(
      (message, type) => this.alerts.showAlert(message, type),
      () => this.modals.closeTransactionDetailsModal(),
      (transaccionId) => this.handleRejectPayment(transaccionId) // Callback para rechazo
    );
    this.paymentModals = new PaymentModalsManager();
    
    // Sincronizar referencias de modales
    this.paymentModals.showTransactionDetailsModal = this.modals.showTransactionDetailsModal.bind(this.modals);
    this.paymentModals.closeTransactionDetailsModal = this.modals.closeTransactionDetailsModal.bind(this.modals);
    this.rejectionModals.showTransactionDetailsModal = this.modals.showTransactionDetailsModal.bind(this.modals);
    this.rejectionModals.closeTransactionDetailsModal = this.modals.closeTransactionDetailsModal.bind(this.modals);
    this.verificationModals.showTransactionDetailsModal = this.modals.showTransactionDetailsModal.bind(this.modals);
    this.verificationModals.closeTransactionDetailsModal = this.modals.closeTransactionDetailsModal.bind(this.modals);
    
    // Estado de procesamiento (compartido entre módulos)
    this.processingPayment = null;
    
    // Estado actual
    this.currentState = APP_STATES.LOGIN;
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners(eventHandlers) {
    // Event listeners de login y refresh
    if (this.elements.loginForm && eventHandlers.onLogin) {
      this.elements.loginForm.addEventListener("submit", eventHandlers.onLogin);
    }

    if (this.elements.refreshBtn && eventHandlers.onRefresh) {
      this.elements.refreshBtn.addEventListener(
        "click",
        eventHandlers.onRefresh
      );
    }

    // Event listeners para pestañas
    this.transactionsDisplay.setupTabEventListeners(eventHandlers);

    // Event listeners para historial
    this.historyUI.setupHistoryEventListeners(eventHandlers);

    // Event listeners para menú lateral
    this.sidebar.setupEventListeners(eventHandlers);
  }

  // ===== MÉTODOS DE PANTALLAS =====

  showLoginScreen() {
    this.screens.showLoginScreen();
    this.alerts.hideError();
    this.currentState = this.screens.getCurrentState();
  }

  showDashboard() {
    this.screens.showDashboard();
    this.currentState = this.screens.getCurrentState();
  }

  navigateToScreen(screenName) {
    this.screens.navigateToScreen(screenName);
    this.sidebar.updateActiveItem(screenName);
    this.currentState = this.screens.getCurrentState();
  }

  // ===== MÉTODOS DE ALERTAS Y FORMULARIOS =====

  setLoading(loading) {
    this.alerts.setLoading(loading);
  }

  showError(message) {
    this.alerts.showError(message);
  }

  hideError() {
    this.alerts.hideError();
  }

  showAlert(message, type) {
    this.alerts.showAlert(message, type);
  }

  async showConfirmDialog(message, callback) {
    await this.alerts.showConfirmDialog(message, callback);
  }

  getLoginFormData() {
    return this.alerts.getLoginFormData();
  }

  // ===== MÉTODOS DE CAJERO DISPLAY =====

  updateCajeroDisplay(cajeroInfo) {
    this.cajeroDisplay.updateCajeroDisplay(cajeroInfo);
    
    // Actualizar también el sidebar
    const info = this.cajeroDisplay.getCajeroInfoForSidebar(cajeroInfo);
    this.sidebar.updateUserInfo(info.nombreCompleto, info.email);
  }

  updateConnectionStatus(connected) {
    this.cajeroDisplay.updateConnectionStatus(connected);
  }

  // ===== MÉTODOS DE SIDEBAR =====

  openSidebar() {
    this.sidebar.openSidebar();
  }

  closeSidebar() {
    this.sidebar.closeSidebar();
  }

  updateSidebarActiveItem(screenName) {
    this.sidebar.updateActiveItem(screenName);
  }

  // ===== MÉTODOS DE TRANSACCIONES =====

  showLoadingTransactions(show) {
    this.transactionsDisplay.showLoadingTransactions(show);
  }

  showNoTransactions() {
    this.transactionsDisplay.showNoTransactions();
  }

  hideNoTransactions() {
    this.transactionsDisplay.hideNoTransactions();
  }

  clearTransactionsList() {
    this.transactionsDisplay.clearTransactionsList();
  }

  clearTransactionsListForTab(tabName) {
    this.transactionsDisplay.clearTransactionsListForTab(tabName);
  }

  addTransactionToList(transactionElement) {
    this.transactionsDisplay.addTransactionToList(transactionElement);
  }

  addTransactionToListForTab(tabName, transactionElement) {
    this.transactionsDisplay.addTransactionToListForTab(tabName, transactionElement);
  }

  displayTransactionsForTab(tabName, transactions) {
    this.transactionsDisplay.displayTransactionsForTab(tabName, transactions);
  }

  switchTab(tabName) {
    this.transactionsDisplay.switchTab(tabName);
  }

  updateTabCount(tabName, count) {
    this.transactionsDisplay.updateTabCount(tabName, count);
  }

  showNoTransactionsForTab(tabName) {
    this.transactionsDisplay.showNoTransactionsForTab(tabName);
  }

  hideNoTransactionsForTab(tabName) {
    this.transactionsDisplay.hideNoTransactionsForTab(tabName);
  }

  // ===== MÉTODOS DE MODALES =====

  showTransactionDetailsModal(modalHTML) {
    this.modals.showTransactionDetailsModal(modalHTML);
  }

  closeTransactionDetailsModal() {
    this.modals.closeTransactionDetailsModal();
  }

  // ===== MÉTODOS DE VERIFICACIÓN DE PAGO =====

  showVerificarPagoPopup(data) {
    this.verificationModals.showVerificarPagoPopup(data);
  }

  handleConfirmPayment(transaccionId) {
    this.verificationModals.handleConfirmPayment(transaccionId);
    this.processingPayment = this.verificationModals.getProcessingPayment();
  }

  handleRejectPayment(transaccionId) {
    this.rejectionModals.handleRejectPayment(transaccionId);
    this.processingPayment = this.rejectionModals.getProcessingPayment();
  }

  setPaymentButtonsDisabled(transaccionId, disabled) {
    this.verificationModals.setPaymentButtonsDisabled(transaccionId, disabled);
  }

  // ===== MÉTODOS DE PAGO COMPLETADO/RECHAZADO =====

  showDepositoCompletadoPopup(data) {
    this.paymentModals.showDepositoCompletadoPopup(data);
  }

  showDepositoRechazadoPopup(data) {
    this.paymentModals.showDepositoRechazadoPopup(data);
  }

  // ===== MÉTODOS DE RECHAZO =====

  referirAAdmin(transaccionId, descripcion) {
    this.rejectionModals.referirAAdmin(transaccionId, descripcion);
    this.processingPayment = this.rejectionModals.getProcessingPayment();
  }

  // ===== MÉTODOS DE HISTORIAL =====

  showHistoryScreen() {
    this.historyUI.showHistoryScreen();
    this.currentState = APP_STATES.HISTORIAL;
    this.screens.setCurrentState(APP_STATES.HISTORIAL);
  }

  hideHistoryScreen() {
    this.historyUI.hideHistoryScreen();
  }

  showLoadingHistory(show) {
    this.historyUI.showLoadingHistory(show);
  }

  showNoHistory() {
    this.historyUI.showNoHistory();
  }

  hideNoHistory() {
    this.historyUI.hideNoHistory();
  }

  clearHistoryList() {
    this.historyUI.clearHistoryList();
  }

  displayHistoryTransactions(transacciones) {
    this.historyUI.displayHistoryTransactions(transacciones);
  }

  clearHistoryFilters() {
    this.historyUI.clearHistoryFilters();
  }

  getHistoryFilters() {
    return this.historyUI.getHistoryFilters();
  }

  showHistoryInitialState() {
    this.historyUI.showHistoryInitialState();
  }

  hideHistoryInitialState() {
    this.historyUI.hideHistoryInitialState();
  }

  showLoadMoreButton() {
    this.historyUI.showLoadMoreButton();
  }

  hideLoadMoreButton() {
    this.historyUI.hideLoadMoreButton();
  }

  updateHistoryCount(showing, total) {
    this.historyUI.updateHistoryCount(showing, total);
  }

  hideHistoryCount() {
    this.historyUI.hideHistoryCount();
  }

  // ===== MÉTODOS DE UTILIDAD =====

  getCurrentState() {
    return this.currentState;
  }

  isLoading() {
    return this.screens.isLoading();
  }

  animateTransition(fromScreen, toScreen) {
    this.screens.animateTransition(fromScreen, toScreen);
  }
}

// Crear instancia única del gestor de UI
export const UI = new UIManager();
