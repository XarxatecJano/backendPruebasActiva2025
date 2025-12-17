// Tests para UserService
describe('UserService', () => {
  let UserService;

  beforeEach(() => {
    delete require.cache[require.resolve('../../public/js/userService.js')];
    UserService = require('../../public/js/userService.js');
  });

  describe('fetchUsers', () => {
    it('should return success with users data when API responds OK', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@test.com' },
        { id: 2, username: 'user2', email: 'user2@test.com' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers)
      });

      const result = await UserService.fetchUsers();

      expect(fetch).toHaveBeenCalledWith('/api/v1/User');
      expect(result).toEqual({
        success: true,
        data: mockUsers
      });
    });

    it('should return unauthorized error when API responds 401', async () => {
      const mockHeaders = new Map();
      mockHeaders.set('Location', '/login.html?error=sesion');

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: {
          get: jest.fn().mockReturnValue('/login.html?error=sesion')
        }
      });

      const result = await UserService.fetchUsers();

      expect(result).toEqual({
        success: false,
        error: 'unauthorized',
        redirectUrl: '/login.html?error=sesion'
      });
    });

    it('should return forbidden error when API responds 403', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      const result = await UserService.fetchUsers();

      expect(result).toEqual({
        success: false,
        error: 'forbidden'
      });
    });

    it('should return fetch error for other HTTP errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await UserService.fetchUsers();

      expect(result).toEqual({
        success: false,
        error: 'fetch_error',
        message: 'Error al cargar los usuarios'
      });
    });

    it('should return network error when fetch throws', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await UserService.fetchUsers();

      expect(result).toEqual({
        success: false,
        error: 'network_error',
        message: 'Error de conexión al cargar usuarios'
      });
    });
  });

  describe('deleteUser', () => {
    it('should return success when user is deleted successfully', async () => {
      const mockResponse = { success: true, message: 'Usuario eliminado' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await UserService.deleteUser(1);

      expect(fetch).toHaveBeenCalledWith('/api/v1/User/1', {
        method: 'DELETE'
      });
      expect(result).toEqual({
        success: true,
        message: 'Usuario eliminado'
      });
    });

    it('should return unauthorized error when API responds 401', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: {
          get: jest.fn().mockReturnValue('/login.html?error=sesion')
        }
      });

      const result = await UserService.deleteUser(1);

      expect(result).toEqual({
        success: false,
        error: 'unauthorized',
        redirectUrl: '/login.html?error=sesion'
      });
    });

    it('should return network error when fetch throws', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await UserService.deleteUser(1);

      expect(result).toEqual({
        success: false,
        error: 'network_error',
        message: 'Error de conexión al eliminar usuario'
      });
    });
  });

  describe('updateUser', () => {
    const userData = {
      username: 'updated_user',
      email: 'updated@test.com',
      phone: '123456789',
      zip_code: '12345',
      role: 'user'
    };

    it('should return success when user is updated successfully', async () => {
      const mockResponse = { success: true, message: 'Usuario actualizado' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const result = await UserService.updateUser(1, userData);

      expect(fetch).toHaveBeenCalledWith('/api/v1/User/1', {
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
          updated_at: expect.any(String)
        })
      });
      expect(result).toEqual({
        success: true,
        message: 'Usuario actualizado'
      });
    });

    it('should return forbidden error when API responds 403', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      const result = await UserService.updateUser(1, userData);

      expect(result).toEqual({
        success: false,
        error: 'forbidden'
      });
    });

    it('should return network error when fetch throws', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await UserService.updateUser(1, userData);

      expect(result).toEqual({
        success: false,
        error: 'network_error',
        message: 'Error de conexión al actualizar usuario'
      });
    });
  });
});