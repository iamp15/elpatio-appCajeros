/**
 * Módulo de gestión del menú lateral (sidebar)
 */

/**
 * Clase para gestionar el menú lateral
 */
export class SidebarManager {
  constructor(elements) {
    this.elements = elements;
  }

  /**
   * Configurar event listeners para el menú lateral
   */
  setupEventListeners(eventHandlers) {
    // Botones para abrir el menú (pueden haber múltiples)
    const menuToggleBtns = document.querySelectorAll(".menu-toggle-btn");
    menuToggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.openSidebar());
    });

    // Botón para cerrar el menú
    if (this.elements.sidebarCloseBtn) {
      this.elements.sidebarCloseBtn.addEventListener("click", () =>
        this.closeSidebar()
      );
    }

    // Click en overlay para cerrar
    if (this.elements.sidebarOverlay) {
      this.elements.sidebarOverlay.addEventListener("click", () =>
        this.closeSidebar()
      );
    }

    // Navegación del sidebar
    this.elements.sidebarNavItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const screen = e.currentTarget.dataset.screen;
        if (eventHandlers.onNavigate) {
          eventHandlers.onNavigate(screen);
        }
        this.closeSidebar();
      });
    });

    // Logout desde sidebar
    if (this.elements.sidebarLogoutBtn && eventHandlers.onLogout) {
      this.elements.sidebarLogoutBtn.addEventListener("click", () => {
        this.closeSidebar();
        eventHandlers.onLogout();
      });
    }
  }

  /**
   * Abrir menú lateral
   */
  openSidebar() {
    if (this.elements.sidebarMenu) {
      this.elements.sidebarMenu.classList.add("active");
    }
    if (this.elements.sidebarOverlay) {
      this.elements.sidebarOverlay.classList.add("active");
    }
    document.body.style.overflow = "hidden";
  }

  /**
   * Cerrar menú lateral
   */
  closeSidebar() {
    if (this.elements.sidebarMenu) {
      this.elements.sidebarMenu.classList.remove("active");
    }
    if (this.elements.sidebarOverlay) {
      this.elements.sidebarOverlay.classList.remove("active");
    }
    document.body.style.overflow = "";
  }

  /**
   * Actualizar item activo en el sidebar
   */
  updateActiveItem(screenName) {
    this.elements.sidebarNavItems.forEach((item) => {
      if (item.dataset.screen === screenName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  /**
   * Actualizar información del usuario en el sidebar
   */
  updateUserInfo(nombreCompleto, email) {
    if (this.elements.sidebarUserName) {
      this.elements.sidebarUserName.textContent = nombreCompleto;
    }
    if (this.elements.sidebarUserEmail) {
      this.elements.sidebarUserEmail.textContent = email;
    }
  }
}
