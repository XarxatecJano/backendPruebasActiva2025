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
        `;
        tbody.appendChild(row);
    });
}
