// Gestión de modales (confirmación de eliminación)
const UserModal = {
    elements: {
        deleteModal: null,
        cancelDelete: null,
        confirmDelete: null,
        modalOverlay: null
    },
    
    userToDelete: null,

    // Inicializar elementos DOM y event listeners
    init() {
        this.elements.deleteModal = DOMUtils.getElementById('delete-modal');
        this.elements.cancelDelete = DOMUtils.getElementById('cancel-delete');
        this.elements.confirmDelete = DOMUtils.getElementById('confirm-delete');
        
        if (this.elements.deleteModal) {
            this.elements.modalOverlay = this.elements.deleteModal.querySelector('.modal-overlay');
        }
        
        this.setupEventListeners();
    },

    // Configurar event listeners
    setupEventListeners() {
        // Botón cancelar
        if (this.elements.cancelDelete) {
            this.elements.cancelDelete.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }

        // Click en overlay para cerrar
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }

        // Botón confirmar eliminación
        if (this.elements.confirmDelete) {
            this.elements.confirmDelete.addEventListener('click', () => {
                this.handleDeleteConfirm();
            });
        }
    },

    // Mostrar modal de confirmación de eliminación
    showDeleteModal(userId) {
        this.userToDelete = userId;
        if (this.elements.deleteModal) {
            DOMUtils.removeClass(this.elements.deleteModal, 'hidden');
        }
    },

    // Ocultar modal de eliminación
    hideDeleteModal() {
        this.userToDelete = null;
        if (this.elements.deleteModal) {
            DOMUtils.addClass(this.elements.deleteModal, 'hidden');
        }
    },

    // Manejar confirmación de eliminación
    async handleDeleteConfirm() {
        if (!this.userToDelete) return;

        const response = await UserService.deleteUser(this.userToDelete);
        
        if (MessageHandler.handleServiceResponse(response)) {
            if (response.success) {
                // Eliminar fila de la tabla
                UserTable.removeRow(this.userToDelete);
                
                // Mostrar mensaje de éxito
                MessageHandler.showSuccessMessage('delete');
                
                // Cerrar modal
                this.hideDeleteModal();
            } else {
                alert('Error: ' + response.message);
            }
        } else {
            // Si hay error de permisos, cerrar modal
            if (response.error === 'forbidden') {
                this.hideDeleteModal();
            }
        }
    }
};