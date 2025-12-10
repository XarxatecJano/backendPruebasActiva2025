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

    // Añadir event listeners a los botones de eliminar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', showDeleteModal);
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

// Event listener para cerrar mensaje de éxito
document.getElementById('close-success').addEventListener('click', () => {
    document.getElementById('success-message').classList.add('hidden');
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
                    
                    // Mostrar mensaje de éxito
                    const successMessage = document.getElementById('success-message');
                    successMessage.classList.remove('hidden');
                    
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
