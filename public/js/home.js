// Aplicación principal de gestión de usuarios
const HomeApp = {
    elements: {
        welcomeSection: null,
        btnListUsers: null
    },
    
    currentUsers: [],

    // Inicializar aplicación
    init() {
        this.initElements();
        this.initModules();
        this.setupEventListeners();
    },

    // Inicializar elementos DOM
    initElements() {
        this.elements.welcomeSection = DOMUtils.getElementById('welcome-section');
        this.elements.btnListUsers = DOMUtils.getElementById('btn-list-users');
    },

    // Inicializar módulos
    initModules() {
        MessageHandler.init();
        UserTable.init();
        UserModal.init();
        UserForm.init();
    },

    // Configurar event listeners principales
    setupEventListeners() {
        if (this.elements.btnListUsers) {
            this.elements.btnListUsers.addEventListener('click', (e) => {
                this.handleListUsersClick(e);
            });
        }
    },

    // Manejar click en "Listar Usuarios"
    async handleListUsersClick(e) {
        e.preventDefault();
        
        // Ocultar mensajes y secciones
        MessageHandler.hideAllMessages();
        this.hideWelcomeSection();
        UserTable.hide();

        // Obtener usuarios del servicio
        const response = await UserService.fetchUsers();
        
        if (MessageHandler.handleServiceResponse(response)) {
            if (response.success) {
                this.currentUsers = response.data;
                UserTable.render(this.currentUsers);
                UserTable.show();
                this.setListUsersActive();
            }
        }
    },

    // Ocultar sección de bienvenida
    hideWelcomeSection() {
        if (this.elements.welcomeSection) {
            DOMUtils.addClass(this.elements.welcomeSection, 'hidden');
        }
    },

    // Marcar botón "Listar Usuarios" como activo
    setListUsersActive() {
        if (this.elements.btnListUsers) {
            DOMUtils.addClass(this.elements.btnListUsers, 'active');
        }
    },

    // Obtener usuario actual por ID
    getCurrentUser(userId) {
        return this.currentUsers.find(u => u.id === userId);
    },

    // Actualizar usuario en memoria
    updateCurrentUser(userId, userData) {
        const userIndex = this.currentUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.currentUsers[userIndex] = { 
                ...this.currentUsers[userIndex], 
                ...userData 
            };
        }
    }
};

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    HomeApp.init();
});