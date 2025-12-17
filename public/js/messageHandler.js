// Manejador de mensajes de éxito y error
const MessageHandler = {
    elements: {
        errorMessage: null,
        deleteSuccessMessage: null,
        updateSuccessMessage: null
    },

    // Inicializar elementos DOM
    init() {
        this.elements.errorMessage = DOMUtils.getElementById('error-message');
        this.elements.deleteSuccessMessage = DOMUtils.getElementById('delete-success-message');
        this.elements.updateSuccessMessage = DOMUtils.getElementById('update-success-message');
        
        // Event listeners para cerrar mensajes
        this.setupCloseListeners();
        
        // Verificar parámetros URL para errores
        this.checkUrlParams();
    },

    // Configurar listeners para cerrar mensajes
    setupCloseListeners() {
        const closeDeleteSuccess = DOMUtils.getElementById('close-delete-success');
        const closeUpdateSuccess = DOMUtils.getElementById('close-update-success');
        
        if (closeDeleteSuccess) {
            closeDeleteSuccess.addEventListener('click', () => {
                this.hideMessage('delete-success');
            });
        }
        
        if (closeUpdateSuccess) {
            closeUpdateSuccess.addEventListener('click', () => {
                this.hideMessage('update-success');
            });
        }
    },

    // Verificar parámetros URL
    checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'permisos') {
            this.showErrorMessage('No tienes permisos para realizar esta acción');
        } else if (params.get('error') === 'sesion') {
            this.showErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }
    },

    // Mostrar mensaje de error
    showErrorMessage(message = 'Ha ocurrido un error') {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
            DOMUtils.removeClass(this.elements.errorMessage, 'hidden');
        }
    },

    // Ocultar mensaje de error
    hideErrorMessage() {
        if (this.elements.errorMessage) {
            DOMUtils.addClass(this.elements.errorMessage, 'hidden');
        }
    },

    // Mostrar mensaje de éxito
    showSuccessMessage(type) {
        const messageElement = type === 'delete' 
            ? this.elements.deleteSuccessMessage 
            : this.elements.updateSuccessMessage;
            
        if (messageElement) {
            DOMUtils.removeClass(messageElement, 'hidden');
        }
    },

    // Ocultar mensaje específico
    hideMessage(type) {
        let element;
        switch (type) {
            case 'error':
                element = this.elements.errorMessage;
                break;
            case 'delete-success':
                element = this.elements.deleteSuccessMessage;
                break;
            case 'update-success':
                element = this.elements.updateSuccessMessage;
                break;
        }
        
        if (element) {
            DOMUtils.addClass(element, 'hidden');
        }
    },

    // Ocultar todos los mensajes
    hideAllMessages() {
        this.hideErrorMessage();
        this.hideMessage('delete-success');
        this.hideMessage('update-success');
    },

    // Manejar respuesta de servicio
    handleServiceResponse(response) {
        if (!response.success) {
            switch (response.error) {
                case 'unauthorized':
                    // Mostrar mensaje antes de redirigir
                    this.showErrorMessage('Tu sesión ha expirado. Redirigiendo al login...');
                    setTimeout(() => {
                        if (response.redirectUrl) {
                            window.location.href = response.redirectUrl;
                        } else {
                            window.location.href = '/login.html?error=sesion';
                        }
                    }, 2000);
                    break;
                case 'forbidden':
                    this.showErrorMessage('No tienes permisos para realizar esta acción');
                    break;
                default:
                    this.showErrorMessage(response.message || 'Ha ocurrido un error');
            }
            return false;
        }
        return true;
    }
};