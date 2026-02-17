/**
 * Módulo de modales de rechazo de depósito
 */

import { ModalsManager } from "./modals.js";

/**
 * Clase para gestionar modales de rechazo
 */
export class RejectionModalsManager extends ModalsManager {
  constructor(showAlertCallback) {
    super();
    this.showAlert = showAlertCallback;
    this.processingPayment = null;
  }

  /**
   * Manejar rechazo de pago
   */
  handleRejectPayment(transaccionId) {
    // Verificar si ya se está procesando esta transacción
    if (this.processingPayment === transaccionId) {
      return;
    }

    // Mostrar modal de rechazo estructurado
    this.showModalRechazoDeposito(transaccionId);
  }

  /**
   * Mostrar modal de rechazo estructurado
   */
  showModalRechazoDeposito(transaccionId) {
    const modalHTML = `
      <div class="modal-rechazo-deposito">
        <div class="modal-header error">
          <h2>❌ Rechazar Depósito</h2>
          <button class="close-btn" onclick="closeTransactionDetails()">&times;</button>
        </div>
        
        <div class="modal-content">
          <div class="form-group">
            <label class="form-label">Motivo del rechazo: *</label>
            <textarea 
              id="descripcion-rechazo" 
              class="form-textarea" 
              rows="4" 
              placeholder="Describe el motivo del rechazo con detalle..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Evidencia (imagen opcional):</label>
            <div class="file-upload-container">
              <input 
                type="file" 
                id="imagen-rechazo" 
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                class="file-input"
              />
              <label for="imagen-rechazo" class="file-input-label">
                <span class="file-input-icon">📷</span>
                <span class="file-input-text">Seleccionar imagen (máx. 5MB)</span>
              </label>
              <div id="imagen-preview-container" class="imagen-preview-container" style="display: none;">
                <img id="imagen-preview" class="imagen-preview" alt="Preview" />
                <button type="button" id="btn-eliminar-imagen" class="btn-eliminar-imagen">✕</button>
                <div class="imagen-info">
                  <span id="imagen-nombre"></span>
                  <span id="imagen-tamaño"></span>
                </div>
              </div>
            </div>
            <small class="form-help-text">Formatos permitidos: JPG, PNG, WEBP, GIF. Tamaño máximo: 5MB</small>
          </div>

          <div class="info-message">
            <p>ℹ️ Esta información será enviada al jugador.</p>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeTransactionDetails()">Cancelar</button>
          <button class="btn btn-danger" id="btn-confirmar-rechazo">Confirmar Rechazo</button>
        </div>
      </div>
    `;

    this.showTransactionDetailsModal(modalHTML);

    // Configurar event listeners para el input de archivo
    const imagenInput = document.getElementById('imagen-rechazo');
    const imagenPreview = document.getElementById('imagen-preview');
    const imagenPreviewContainer = document.getElementById('imagen-preview-container');
    const imagenNombre = document.getElementById('imagen-nombre');
    const imagenTamaño = document.getElementById('imagen-tamaño');
    const btnEliminarImagen = document.getElementById('btn-eliminar-imagen');

    imagenInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validar tamaño (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB en bytes
        if (file.size > maxSize) {
          this.showAlert('La imagen no puede ser mayor a 5MB');
          e.target.value = '';
          return;
        }

        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!tiposPermitidos.includes(file.type)) {
          this.showAlert('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WEBP, GIF)');
          e.target.value = '';
          return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (event) => {
          imagenPreview.src = event.target.result;
          imagenNombre.textContent = file.name;
          imagenTamaño.textContent = this.formatearTamaño(file.size);
          imagenPreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    // Botón para eliminar imagen seleccionada
    btnEliminarImagen.addEventListener('click', () => {
      imagenInput.value = '';
      imagenPreviewContainer.style.display = 'none';
      imagenPreview.src = '';
    });

    // Botón de confirmar rechazo
    document.getElementById('btn-confirmar-rechazo').addEventListener('click', () => {
      this.procesarRechazoDeposito(transaccionId);
    });
  }

  /**
   * Formatear tamaño de archivo para mostrar
   */
  formatearTamaño(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Procesar rechazo de depósito con datos simplificados
   */
  async procesarRechazoDeposito(transaccionId) {
    // Obtener descripción (obligatoria)
    const descripcion = document.getElementById('descripcion-rechazo')?.value.trim();
    if (!descripcion) {
      this.showAlert('Debes proporcionar un motivo de rechazo');
      return;
    }

    // Obtener imagen (opcional)
    const imagenInput = document.getElementById('imagen-rechazo');
    const imagenFile = imagenInput?.files[0];

    let imagenRechazoUrl = null;

    // Si hay imagen, subirla primero
    if (imagenFile) {
      try {
        // Mostrar indicador de carga
        const btnConfirmar = document.getElementById('btn-confirmar-rechazo');
        const textoOriginal = btnConfirmar.textContent;
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = 'Subiendo imagen...';

        // Subir imagen al backend
        imagenRechazoUrl = await this.subirImagenRechazo(imagenFile);

        // Restaurar botón
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = textoOriginal;
      } catch (error) {
        console.error('❌ Error subiendo imagen:', error);
        this.showAlert(`Error al subir imagen: ${error.message || 'Error desconocido'}`);
        return;
      }
    }

    // Marcar como procesando
    this.processingPayment = transaccionId;

    // Cerrar el modal
    this.closeTransactionDetailsModal();

    // Enviar rechazo via WebSocket con estructura simplificada
    if (
      window.cajeroWebSocket &&
      window.cajeroWebSocket.isConnected &&
      window.cajeroWebSocket.isAuthenticated
    ) {
      window.cajeroWebSocket.rechazarPagoCajero(transaccionId, {
        descripcionDetallada: descripcion,
        imagenRechazoUrl: imagenRechazoUrl
      });
    } else {
      console.error('No hay conexión WebSocket disponible');
      this.showAlert('Error: No hay conexión disponible');
      this.processingPayment = null;
    }
  }

  /**
   * Subir imagen de rechazo al backend
   */
  async subirImagenRechazo(archivo) {
    const formData = new FormData();
    formData.append('imagen', archivo);

    // Obtener token de autenticación
    let token = null;
    
    // Intentar obtener del WebSocket primero
    if (window.cajeroWebSocket && window.cajeroWebSocket.lastAuthToken) {
      token = window.cajeroWebSocket.lastAuthToken;
    }
    
    // Si no está en WebSocket, intentar obtener del AuthManager o localStorage
    if (!token && window.AuthManager && window.AuthManager.getToken) {
      token = window.AuthManager.getToken();
    }
    
    // Fallback: intentar obtener de localStorage directamente
    if (!token) {
      token = localStorage.getItem('cajeroToken') || 
              localStorage.getItem('token') || 
              sessionStorage.getItem('cajeroToken');
    }

    if (!token) {
      throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
    }
    
    // Obtener URL del backend
    const backendUrl = this.getBackendUrl();

    const response = await fetch(`${backendUrl}/api/upload/imagen-rechazo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || errorData.mensaje || 'Error al subir imagen');
    }

    const data = await response.json();
    return data.imagen.url;
  }

  /**
   * Obtener URL del backend.
   * Usa la misma URL que el resto de la app (API_CONFIG). La app de cajeros
   * siempre debe hablar con el backend en Fly.io; en local no hay backend local.
   */
  getBackendUrl() {
    return window.API_CONFIG?.BASE_URL || 'https://elpatio-backend.fly.dev';
  }

  /**
   * Referir transacción a administrador
   */
  referirAAdmin(transaccionId, descripcion) {
    console.log('⚠️ Refiriendo transacción a admin:', transaccionId);

    // Marcar como procesando
    this.processingPayment = transaccionId;

    // Cerrar el modal
    this.closeTransactionDetailsModal();

    // Enviar evento de referir a admin
    if (
      window.cajeroWebSocket &&
      window.cajeroWebSocket.isConnected &&
      window.cajeroWebSocket.isAuthenticated
    ) {
      window.cajeroWebSocket.referirAAdmin(transaccionId, descripcion);
    } else {
      console.error('No hay conexión WebSocket disponible');
      this.showAlert('Error: No hay conexión disponible');
      this.processingPayment = null;
    }
  }

  /**
   * Establecer estado de procesamiento
   */
  setProcessingPayment(transaccionId) {
    this.processingPayment = transaccionId;
  }

  /**
   * Limpiar estado de procesamiento
   */
  clearProcessingPayment() {
    this.processingPayment = null;
  }

  /**
   * Obtener estado de procesamiento
   */
  getProcessingPayment() {
    return this.processingPayment;
  }
}
