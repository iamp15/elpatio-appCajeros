/**
 * Módulo de diálogos y notificaciones
 */

/**
 * Clase para gestionar alertas, confirmaciones y notificaciones
 */
export class AlertsManager {
  constructor(elements) {
    this.elements = elements;
  }

  /**
   * Mostrar estado de carga del login
   */
  setLoading(loading) {
    if (!this.elements.loginBtn || !this.elements.loginText || !this.elements.loginLoading) {
      return;
    }

    if (loading) {
      this.elements.loginBtn.disabled = true;
      this.elements.loginText.style.display = "none";
      this.elements.loginLoading.style.display = "inline";
    } else {
      this.elements.loginBtn.disabled = false;
      this.elements.loginText.style.display = "inline";
      this.elements.loginLoading.style.display = "none";
    }
  }

  /**
   * Mostrar mensaje de error
   */
  showError(message) {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.style.display = "block";
    }
  }

  /**
   * Ocultar mensaje de error
   */
  hideError() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.style.display = "none";
    }
  }

  /**
   * Mostrar modal de confirmación
   */
  async showConfirmDialog(message, callback) {
    // Detectar tipo de confirmación basado en el mensaje
    let title = "Confirmar acción";
    let icon = "❓";
    let type = "confirm";
    let confirmText = "Confirmar";
    let cancelText = "Cancelar";

    if (message.includes("aceptar") || message.includes("asignar")) {
      title = "Aceptar transacción";
      icon = "✅";
      confirmText = "Aceptar";
    } else if (message.includes("rechazar") || message.includes("eliminar")) {
      title = "Confirmar acción";
      icon = "⚠️";
      type = "danger";
      confirmText = "Sí, continuar";
    }

    try {
      const confirmed = await window.notificationManager.confirm(
        title,
        message,
        {
          confirmText,
          cancelText,
          type,
          icon,
        }
      );

      if (confirmed) {
        callback();
      }
    } catch (error) {
      console.error("Error en modal de confirmación:", error);
      // Fallback a confirm nativo si hay error
      if (confirm(message)) {
        callback();
      }
    }
  }

  /**
   * Mostrar notificación toast
   */
  showAlert(message, type = "info") {
    // Detectar tipo automáticamente basado en el mensaje
    if (
      message.includes("✅") ||
      message.includes("exitoso") ||
      message.includes("correctamente")
    ) {
      type = "success";
    } else if (
      message.includes("❌") ||
      message.includes("Error") ||
      message.includes("error")
    ) {
      type = "error";
    } else if (message.includes("⚠️") || message.includes("advertencia")) {
      type = "warning";
    }

    // Limpiar emojis del mensaje para el título
    const cleanMessage = message.replace(/[✅❌⚠️ℹ️]/g, "").trim();

    // Determinar título y mensaje
    let title, msg;
    if (cleanMessage.includes(":")) {
      [title, msg] = cleanMessage.split(":", 2);
      title = title.trim();
      msg = msg.trim();
    } else {
      title =
        type === "success"
          ? "Éxito"
          : type === "error"
          ? "Error"
          : type === "warning"
          ? "Advertencia"
          : "Información";
      msg = cleanMessage;
    }

    // Usar el sistema de notificaciones toast
    if (window.notificationManager) {
      window.notificationManager.show(type, title, msg);
    } else {
      // Fallback a alert si no está disponible
      alert(message);
    }
  }

  /**
   * Obtener datos del formulario de login
   */
  getLoginFormData() {
    if (!this.elements.loginForm) return null;

    const formData = new FormData(this.elements.loginForm);
    return {
      email: formData.get("email"),
      password: formData.get("password"),
    };
  }
}
