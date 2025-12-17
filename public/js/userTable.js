// Gestión de la tabla de usuarios
const UserTable = {
    elements: {
        tbody: null,
        usersSection: null
    },

    // Inicializar elementos DOM
    init() {
        this.elements.tbody = document.querySelector('#users-table tbody');
        this.elements.usersSection = DOMUtils.getElementById('users-section');
    },

    // Template para fila de usuario
    createUserRowHTML(user) {
        return `
            <td>${user.username}</td>
            <td>${user.email || '-'}</td>
            <td>${user.phone || '-'}</td>
            <td>${user.zip_code || '-'}</td>
            <td>${user.role || '-'}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit" data-user-id="${user.id}" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="btn-action btn-delete" data-user-id="${user.id}" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </td>
        `;
    },

    // Renderizar tabla completa de usuarios
    render(users) {
        if (!this.elements.tbody) return;
        
        DOMUtils.clearContent(this.elements.tbody);
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = this.createUserRowHTML(user);
            this.elements.tbody.appendChild(row);
        });

        // Añadir event listeners a los botones
        this.attachEventListeners();
    },

    // Actualizar fila específica
    updateRow(userId, userData) {
        const button = document.querySelector(`[data-user-id="${userId}"]`);
        if (!button) return;
        
        const row = button.closest('tr');
        if (!row) return;
        
        row.innerHTML = this.createUserRowHTML({
            id: userId,
            ...userData
        });
        
        // Re-añadir event listeners a la fila actualizada
        this.attachRowEventListeners(row);
    },

    // Eliminar fila específica
    removeRow(userId) {
        const button = document.querySelector(`[data-user-id="${userId}"]`);
        if (!button) return;
        
        const row = button.closest('tr');
        if (row) {
            row.remove();
        }
    },

    // Mostrar sección de usuarios
    show() {
        if (this.elements.usersSection) {
            DOMUtils.removeClass(this.elements.usersSection, 'hidden');
        }
    },

    // Ocultar sección de usuarios
    hide() {
        if (this.elements.usersSection) {
            DOMUtils.addClass(this.elements.usersSection, 'hidden');
        }
    },

    // Añadir event listeners a todos los botones
    attachEventListeners() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
                UserModal.showDeleteModal(userId);
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
                UserForm.showEditForm(userId);
            });
        });
    },

    // Añadir event listeners a una fila específica
    attachRowEventListeners(row) {
        const deleteBtn = row.querySelector('.btn-delete');
        const editBtn = row.querySelector('.btn-edit');
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
                UserModal.showDeleteModal(userId);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
                UserForm.showEditForm(userId);
            });
        }
    }
};