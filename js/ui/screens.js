/**
 * Módulo de gestión de pantallas y navegación
 */

import { APP_STATES } from "../config.js";

/**
 * Clase para gestionar pantallas y navegación
 */
export class ScreensManager {
  constructor(elements) {
    this.elements = elements;
    this.currentState = APP_STATES.LOGIN;
  }

  /**
   * Mostrar pantalla de login
   */
  showLoginScreen() {
    // Ocultar todas las pantallas principales
    this.elements.dashboardScreen?.classList.remove("active");
    this.elements.historialScreen?.classList.remove("active");
    this.elements.saldoScreen?.classList.remove("active");
    this.elements.perfilScreen?.classList.remove("active");
    
    // Mostrar pantalla de login
    this.elements.loginScreen?.classList.add("active");
    this.elements.loginForm?.reset();
    this.currentState = APP_STATES.LOGIN;
  }

  /**
   * Mostrar dashboard
   */
  showDashboard() {
    this.elements.loginScreen?.classList.remove("active");
    this.elements.dashboardScreen?.classList.add("active");
    this.currentState = APP_STATES.DASHBOARD;
  }

  /**
   * Navegar a una pantalla
   */
  navigateToScreen(screenName) {
    // Ocultar todas las pantallas principales
    this.elements.loginScreen?.classList.remove("active");
    this.elements.dashboardScreen?.classList.remove("active");
    this.elements.historialScreen?.classList.remove("active");
    this.elements.saldoScreen?.classList.remove("active");
    this.elements.perfilScreen?.classList.remove("active");

    // Mostrar la pantalla correspondiente
    switch (screenName) {
      case "dashboard":
        this.elements.dashboardScreen?.classList.add("active");
        this.currentState = APP_STATES.DASHBOARD;
        break;
      case "historial":
        this.elements.historialScreen?.classList.add("active");
        this.currentState = APP_STATES.HISTORIAL;
        break;
      case "saldo":
        this.elements.saldoScreen?.classList.add("active");
        this.currentState = APP_STATES.HISTORIAL; // Reutilizar estado similar
        break;
      case "perfil":
        this.elements.perfilScreen?.classList.add("active");
        break;
    }
  }

  /**
   * Obtener estado actual
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Establecer estado
   */
  setCurrentState(state) {
    this.currentState = state;
  }

  /**
   * Verificar si la UI está en estado de carga
   */
  isLoading() {
    return this.currentState === APP_STATES.LOADING;
  }

  /**
   * Animar transición entre pantallas
   */
  animateTransition(fromScreen, toScreen, duration = 300) {
    if (!fromScreen || !toScreen) return;

    fromScreen.style.opacity = "0";
    setTimeout(() => {
      fromScreen.classList.remove("active");
      toScreen.classList.add("active");
      toScreen.style.opacity = "0";
      setTimeout(() => {
        toScreen.style.opacity = "1";
      }, 50);
    }, duration);
  }
}
