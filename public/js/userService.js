// Servicio para comunicación con la API de usuarios
const UserService = {
    // Obtener todos los usuarios
    async fetchUsers() {
        try {
            const response = await fetch('/api/v1/User');
            
            if (response.ok) {
                return {
                    success: true,
                    data: await response.json()
                };
            } else if (response.status === 401) {
                return {
                    success: false,
                    error: 'unauthorized',
                    redirectUrl: response.headers.get('Location') || '/login.html?error=sesion'
                };
            } else if (response.status === 403) {
                return {
                    success: false,
                    error: 'forbidden'
                };
            } else {
                return {
                    success: false,
                    error: 'fetch_error',
                    message: 'Error al cargar los usuarios'
                };
            }
        } catch (err) {
            return {
                success: false,
                error: 'network_error',
                message: 'Error de conexión al cargar usuarios'
            };
        }
    },

    // Eliminar usuario
    async deleteUser(userId) {
        try {
            const response = await fetch(`/api/v1/User/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                return {
                    success: result.success,
                    message: result.message
                };
            } else if (response.status === 401) {
                return {
                    success: false,
                    error: 'unauthorized',
                    redirectUrl: response.headers.get('Location') || '/login.html?error=sesion'
                };
            } else if (response.status === 403) {
                return {
                    success: false,
                    error: 'forbidden'
                };
            } else {
                return {
                    success: false,
                    error: 'delete_error',
                    message: 'Error al eliminar el usuario'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'network_error',
                message: 'Error de conexión al eliminar usuario'
            };
        }
    },

    // Actualizar usuario
    async updateUser(userId, userData) {
        try {
            const response = await fetch(`/api/v1/User/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userData.username,
                    zip_code: userData.zip_code,
                    phone: userData.phone,
                    role: userData.role,
                    email: userData.email,
                    updated_at: new Date().toISOString()
                })
            });

            if (response.ok) {
                const result = await response.json();
                return {
                    success: result.success,
                    message: result.message
                };
            } else if (response.status === 401) {
                return {
                    success: false,
                    error: 'unauthorized',
                    redirectUrl: response.headers.get('Location') || '/login.html?error=sesion'
                };
            } else if (response.status === 403) {
                return {
                    success: false,
                    error: 'forbidden'
                };
            } else {
                return {
                    success: false,
                    error: 'update_error',
                    message: 'Error al actualizar el usuario'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'network_error',
                message: 'Error de conexión al actualizar usuario'
            };
        }
    }
};