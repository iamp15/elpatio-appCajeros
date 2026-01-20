/**
 * Módulo de actualización de información del cajero en la UI
 */

/**
 * Clase para gestionar la visualización de información del cajero
 */
export class CajeroDisplayManager {
  constructor(elements) {
    this.elements = elements;
  }

  /**
   * Actualizar información del cajero en la UI
   */
  updateCajeroDisplay(cajeroInfo) {
    if (!cajeroInfo) return;

    const nombreCompleto = cajeroInfo.nombreCompleto || "-";
    const email = cajeroInfo.email || "-";
    const telefono = cajeroInfo.telefonoContacto || "-";
    const banco = cajeroInfo.datosPagoMovil?.banco || "-";
    const cedula = cajeroInfo.datosPagoMovil?.cedula;
    const cedulaFormateada = cedula && cedula.prefijo && cedula.numero
      ? `${cedula.prefijo}-${cedula.numero}`
      : "-";
    const telefonoPago = cajeroInfo.datosPagoMovil?.telefono || "-";

    // Dashboard
    if (this.elements.cajeroName) {
      this.elements.cajeroName.textContent = nombreCompleto;
    }

    // Perfil
    if (this.elements.perfilNombre) {
      this.elements.perfilNombre.textContent = nombreCompleto;
    }
    if (this.elements.perfilEmail) {
      this.elements.perfilEmail.textContent = email;
    }
    if (this.elements.perfilTelefono) {
      this.elements.perfilTelefono.textContent = telefono;
    }
    if (this.elements.perfilBanco) {
      this.elements.perfilBanco.textContent = banco;
    }
    if (this.elements.perfilCedula) {
      this.elements.perfilCedula.textContent = cedulaFormateada;
    }
    if (this.elements.perfilTelefonoPago) {
      this.elements.perfilTelefonoPago.textContent = telefonoPago;
    }
  }

  /**
   * Actualizar estado de conexión WebSocket en el perfil
   */
  updateConnectionStatus(connected) {
    if (this.elements.perfilWsStatus) {
      const statusText = this.elements.perfilWsStatus.querySelector(".status-text");
      
      if (connected) {
        this.elements.perfilWsStatus.classList.add("connected");
        this.elements.perfilWsStatus.classList.remove("disconnected");
        if (statusText) statusText.textContent = "Conectado";
      } else {
        this.elements.perfilWsStatus.classList.remove("connected");
        this.elements.perfilWsStatus.classList.add("disconnected");
        if (statusText) statusText.textContent = "Desconectado";
      }
    }
  }

  /**
   * Obtener información del cajero para sidebar (solo nombre y email)
   */
  getCajeroInfoForSidebar(cajeroInfo) {
    if (!cajeroInfo) return { nombreCompleto: "-", email: "-" };
    
    return {
      nombreCompleto: cajeroInfo.nombreCompleto || "-",
      email: cajeroInfo.email || "-"
    };
  }
}
