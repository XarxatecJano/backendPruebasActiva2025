const params = new URLSearchParams(window.location.search);
const errorMessage = document.getElementById('error-message');
const welcomeSection = document.getElementById('welcome-section');
const usersSection = document.getElementById('users-section');
const btnListUsers = document.getElementById('btn-list-users');

if (params.get('error') === 'permisos') {
    errorMessage.classList.remove('hidden');
}

btnListUsers.addEventListener('click', async (e) => {
    e.preventDefault();
    
    errorMessage.classList.add('hidden');
    welcomeSection.classList.add('hidden');
    usersSection.classList.add('hidden');

    try {
        const response = await fetch('/api/v1/User');

        if (response.ok) {
            const users = await response.json();
            currentUsers = users; // Guardar usuarios para edición
            renderUsersTable(users);
            usersSection.classList.remove('hidden');
            btnListUsers.classList.add('active');
        } else if (response.status === 401) {
            window.location.href = response.headers.get('Location') || '/login.html?error=sesion';
        } else if (response.status === 403) {
            errorMessage.classList.remove('hidden');
        } else {
            errorMessage.textContent = 'Error al cargar los usuarios';
            errorMessage.classList.remove('hidden');
        }
    } catch (err) {
        errorMessage.textContent = 'Error al cargar los usuarios';
        errorMessage.classList.remove('hidden');
    }
});

function renderUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
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
        tbody.appendChild(row);
    });

    // Añadir event listeners a los botones de eliminar y editar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', showDeleteModal);
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', showEditForm);
    });
}

// Modal de confirmación
const deleteModal = document.getElementById('delete-modal');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');
let userToDelete = null;

function showDeleteModal(e) {
    userToDelete = parseInt(e.currentTarget.getAttribute("data-user-id"));
    deleteModal.classList.remove('hidden');
}

function hideDeleteModal() {
    deleteModal.classList.add('hidden');
    userToDelete = null;
}

// Event listeners del modal
cancelDelete.addEventListener('click', hideDeleteModal);
deleteModal.querySelector('.modal-overlay').addEventListener('click', hideDeleteModal);

// Event listener para cerrar mensaje de éxito de eliminación
document.getElementById('close-delete-success').addEventListener('click', () => {
    document.getElementById('delete-success-message').classList.add('hidden');
});

// Variables para edición
const editSection = document.getElementById('edit-section');
const cancelEdit = document.getElementById('cancel-edit');
const editForm = document.getElementById('edit-form');
let currentUsers = [];

// Función para mostrar formulario de edición
function showEditForm(e) {
    const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
    const user = currentUsers.find(u => u.id === userId);
    
    if (user) {
        // Cargar datos del usuario en el formulario
        document.getElementById('edit-username').value = user.username || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-zip').value = user.zip_code || '';
        document.getElementById('edit-role').value = user.role || 'user';
        document.getElementById('submit-edit').setAttribute("user-id", user.id);

        
        // Guardar ID del usuario que se está editando
        editForm.dataset.userId = userId;
        
        // Mostrar formulario y ocultar lista
        usersSection.classList.add('hidden');
        editSection.classList.remove('hidden');
    }
}

// Función para cancelar edición
function cancelEditForm() {
    editSection.classList.add('hidden');
    usersSection.classList.remove('hidden');
    editForm.reset();
    delete editForm.dataset.userId;
}

// Event listeners para edición
cancelEdit.addEventListener('click', cancelEditForm);

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userToUpdateId = parseInt(editForm.dataset.userId);
    const user = currentUsers.find(u => u.id === userToUpdateId);
    const updatedDate = new Date().toISOString();
    if (userToUpdateId){
         try{
       
            const response = await fetch(`/api/v1/User/${userToUpdateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: document.getElementById('edit-username').value,
                    zip_code: document.getElementById('edit-zip').value,
                    phone: document.getElementById('edit-phone').value,
                    role: document.getElementById('edit-role').value,
                    email: document.getElementById('edit-email').value,
                    updated_at: updatedDate
                })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Actualizar la fila de la tabla
                    const formData = new FormData(editForm);
                    const updatedUser = {
                        id: userToUpdateId,
                        username: formData.get('username'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        zip_code: formData.get('zip_code'),
                        role: formData.get('role')
                    };
                    
                    // Actualizar el array de usuarios
                    const userIndex = currentUsers.findIndex(u => u.id === userToUpdateId);
                    if (userIndex !== -1) {
                        currentUsers[userIndex] = { ...currentUsers[userIndex], ...updatedUser };
                    }
                    
                    // Actualizar la fila específica en la tabla
                    const rowToUpdate = document.querySelector(`[data-user-id="${userToUpdateId}"]`).closest('tr');
                    if (rowToUpdate) {
                        rowToUpdate.innerHTML = `
                            <td>${updatedUser.username}</td>
                            <td>${updatedUser.email || '-'}</td>
                            <td>${updatedUser.phone || '-'}</td>
                            <td>${updatedUser.zip_code || '-'}</td>
                            <td>${updatedUser.role || '-'}</td>
                            <td class="actions-cell">
                                <button class="btn-action btn-edit" data-user-id="${updatedUser.id}" title="Editar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                </button>
                                <button class="btn-action btn-delete" data-user-id="${updatedUser.id}" title="Eliminar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                    </svg>
                                </button>
                            </td>
                        `;
                        
                        // Re-añadir event listeners a los nuevos botones
                        rowToUpdate.querySelector('.btn-delete').addEventListener('click', showDeleteModal);
                        rowToUpdate.querySelector('.btn-edit').addEventListener('click', showEditForm);
                    }
                    
                    const updateSuccessMessage = document.getElementById('update-success-message');
                    updateSuccessMessage.classList.remove('hidden');
                    
                    cancelEditForm();
                } else {
                    alert('Error: ' + result.message);
                }
            } else if (response.status === 401) {
                window.location.href = response.headers.get('Location') || '/login.html?error=sesion';
            } else if (response.status === 403) {
                hideDeleteModal();
                errorMessage.classList.remove('hidden');
            } else {
                alert('Error al eliminar el usuario');
            }
  
         }catch (error){
            console.error('Error:', error);
            alert('Error de conexión, no se pudo completar el proceso');
        }
        
    }
    
    cancelEditForm();
});

confirmDelete.addEventListener('click', async () => {
    if (userToDelete) {
        try {
            const response = await fetch(`/api/v1/User/${userToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Eliminar la fila de la tabla
                    const rowToDelete = document.querySelector(`[data-user-id="${userToDelete}"]`).closest('tr');
                    rowToDelete.remove();
                    
                    // Mostrar mensaje de éxito de eliminación
                    const deleteSuccessMessage = document.getElementById('delete-success-message');
                    deleteSuccessMessage.classList.remove('hidden');
                    
                    hideDeleteModal();
                } else {
                    alert('Error: ' + result.message);
                }
            } else if (response.status === 401) {
                window.location.href = response.headers.get('Location') || '/login.html?error=sesion';
            } else if (response.status === 403) {
                hideDeleteModal();
                errorMessage.classList.remove('hidden');
            } else {
                alert('Error al eliminar el usuario');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión, no se pudo completar el proceso');
        }
    }
});
// Event listener para cerrar mensaje de éxito de actualización
document.getElementById('close-update-success').addEventListener('click', () => {
    document.getElementById('update-success-message').classList.add('hidden');
});