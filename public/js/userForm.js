// Gestión del formulario de edición de usuarios
const UserForm = {
    elements: {
        editSection: null,
        editForm: null,
        cancelEdit: null,
        usernameInput: null,
        emailInput: null,
        phoneInput: null,
        zipInput: null,
        roleInput: null
    },

    // Inicializar elementos DOM y event listeners
    init() {
        this.elements.editSection = DOMUtils.getElementById('edit-section');
        this.elements.editForm = DOMUtils.getElementById('edit-form');
        this.elements.cancelEdit = DOMUtils.getElementById('cancel-edit');
        
        // Inputs del formulario
        this.elements.usernameInput = DOMUtils.getElementById('edit-username');
        this.elements.emailInput = DOMUtils.getElementById('edit-email');
        this.elements.phoneInput = DOMUtils.getElementById('edit-phone');
        this.elements.zipInput = DOMUtils.getElementById('edit-zip');
        this.elements.roleInput = DOMUtils.getElementById('edit-role');
        
        this.setupEventListeners();
    },

    // Configurar event listeners
    setupEventListeners() {
        // Botón cancelar
        if (this.elements.cancelEdit) {
            this.elements.cancelEdit.addEventListener('click', () => {
                this.hideEditForm();
            });
        }

        // Submit del formulario
        if (this.elements.editForm) {
            this.elements.editForm.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }
    },

    // Mostrar formulario de edición con datos del usuario
    showEditForm(userId) {
        const user = HomeApp.getCurrentUser(userId);
        
        if (!user) {
            console.error('Usuario no encontrado:', userId);
            return;
        }

        // Cargar datos del usuario en el formulario
        this.loadUserData(user);
        
        // Guardar ID del usuario que se está editando
        if (this.elements.editForm) {
            this.elements.editForm.dataset.userId = userId;
        }
        
        // Mostrar formulario y ocultar lista
        UserTable.hide();
        this.show();
    },

    // Cargar datos del usuario en el formulario
    loadUserData(user) {
        if (this.elements.usernameInput) this.elements.usernameInput.value = user.username || '';
        if (this.elements.emailInput) this.elements.emailInput.value = user.email || '';
        if (this.elements.phoneInput) this.elements.phoneInput.value = user.phone || '';
        if (this.elements.zipInput) this.elements.zipInput.value = user.zip_code || '';
        if (this.elements.roleInput) this.elements.roleInput.value = user.role || 'user';
        
        // También actualizar el atributo user-id del botón submit si existe
        const submitBtn = DOMUtils.getElementById('submit-edit');
        if (submitBtn) {
            submitBtn.setAttribute("user-id", user.id);
        }
    },

    // Ocultar formulario de edición
    hideEditForm() {
        this.hide();
        UserTable.show();
        this.resetForm();
    },

    // Mostrar sección de edición
    show() {
        if (this.elements.editSection) {
            DOMUtils.removeClass(this.elements.editSection, 'hidden');
        }
    },

    // Ocultar sección de edición
    hide() {
        if (this.elements.editSection) {
            DOMUtils.addClass(this.elements.editSection, 'hidden');
        }
    },

    // Resetear formulario
    resetForm() {
        if (this.elements.editForm) {
            this.elements.editForm.reset();
            delete this.elements.editForm.dataset.userId;
        }
    },

    // Obtener datos del formulario
    getFormData() {
        return {
            username: this.elements.usernameInput?.value || '',
            email: this.elements.emailInput?.value || '',
            phone: this.elements.phoneInput?.value || '',
            zip_code: this.elements.zipInput?.value || '',
            role: this.elements.roleInput?.value || 'user'
        };
    },

    // Manejar envío del formulario
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const userToUpdateId = parseInt(this.elements.editForm?.dataset.userId);
        if (!userToUpdateId) {
            console.error('No se encontró ID de usuario para actualizar');
            return;
        }

        const formData = this.getFormData();
        
        // Validación básica
        if (!formData.username.trim()) {
            alert('El nombre de usuario es requerido');
            return;
        }

        const response = await UserService.updateUser(userToUpdateId, formData);
        
        if (MessageHandler.handleServiceResponse(response)) {
            if (response.success) {
                // Actualizar la fila en la tabla
                UserTable.updateRow(userToUpdateId, formData);
                
                // Actualizar datos en memoria
                HomeApp.updateCurrentUser(userToUpdateId, formData);
                
                // Mostrar mensaje de éxito
                MessageHandler.showSuccessMessage('update');
                
                // Cerrar formulario
                this.hideEditForm();
            } else {
                alert('Error: ' + response.message);
            }
        }
    }
};