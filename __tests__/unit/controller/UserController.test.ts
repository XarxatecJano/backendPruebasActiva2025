import { UserController } from '../../../src/controller/UserController.js';
import { UserModel } from '../../../src/model/UserModel.js';
import { poolActiva } from '../../../src/config/db.js';
import * as bcrypt from 'bcrypt';
import { Context } from 'hono';

// Mock dependencies
jest.mock('../../../src/model/UserModel.js');
jest.mock('../../../src/config/db.js', () => ({
  poolActiva: {
    query: jest.fn(),
  },
}));
jest.mock('bcrypt');

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockPool = poolActiva as any;
const mockBcrypt = bcrypt as any;

// Mock Hono Context
const createMockContext = (overrides = {}): Context => {
  const mockContext = {
    req: {
      parseBody: jest.fn(),
      json: jest.fn(),
      param: jest.fn(),
    },
    json: jest.fn(),
    redirect: jest.fn(),
    ...overrides,
  } as unknown as Context;
  
  return mockContext;
};

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUsers', () => {
    it('should return users when UserModel.findUsers succeeds', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'testuser',
          password: 'hashedpassword',
          created_at: new Date(),
          updated_at: new Date(),
          zip_code: '12345',
          phone: '555-1234',
          email: 'test@example.com',
          role: 'user'
        }
      ];

      mockUserModel.findUsers.mockResolvedValue(mockUsers);
      const mockContext = createMockContext();

      await UserController.findUsers(mockContext);

      expect(mockUserModel.findUsers).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return error when UserModel.findUsers fails', async () => {
      mockUserModel.findUsers.mockResolvedValue(null as any);
      const mockContext = createMockContext();

      await UserController.findUsers(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'Error al obtener usuarios' },
        500
      );
    });
  });

  describe('newUser', () => {
    it('should create new user successfully', async () => {
      const mockBody = {
        username: 'newuser',
        password: 'plainpassword',
        zip_code: '12345',
        phone: '555-1234',
        email: 'test@example.com'
      };

      const mockContext = createMockContext();
      mockContext.req.parseBody = jest.fn().mockResolvedValue(mockBody);
      mockBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      mockUserModel.newUser.mockResolvedValue({ rowCount: 1 } as any);

      await UserController.newUser(mockContext);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
      expect(mockUserModel.newUser).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'hashedpassword',
        zip_code: '12345',
        phone: '555-1234',
        email: 'test@example.com'
      });
      expect(mockContext.redirect).toHaveBeenCalledWith('/login.html');
    });

    it('should return error when user creation fails', async () => {
      const mockBody = {
        username: 'newuser',
        password: 'plainpassword',
        zip_code: '12345',
        phone: '555-1234',
        email: 'test@example.com'
      };

      const mockContext = createMockContext();
      mockContext.req.parseBody = jest.fn().mockResolvedValue(mockBody);
      mockBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      mockUserModel.newUser.mockResolvedValue({ rowCount: 0 } as any);

      await UserController.newUser(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { error: 'No se puedo insertar el registro' },
        400
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockContext = createMockContext();
      mockContext.req.param = jest.fn().mockReturnValue('1');
      
      // Mock UserModel.deleteUser instead of direct pool query
      mockUserModel.deleteUser = jest.fn().mockResolvedValue({ rowCount: 1 });

      await UserController.deleteUser(mockContext);

      expect(mockUserModel.deleteUser).toHaveBeenCalledWith(1);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    });

    it('should return 404 when user not found', async () => {
      const mockContext = createMockContext();
      mockContext.req.param = jest.fn().mockReturnValue('999');
      
      // Mock UserModel.deleteUser to return no rows affected
      mockUserModel.deleteUser = jest.fn().mockResolvedValue({ rowCount: 0 });

      await UserController.deleteUser(mockContext);

      expect(mockUserModel.deleteUser).toHaveBeenCalledWith(999);
      expect(mockContext.json).toHaveBeenCalledWith(
        { success: false, message: 'No se pudo borrar el usuario' },
        404
      );
    });

    it('should handle database errors', async () => {
      const mockContext = createMockContext();
      mockContext.req.param = jest.fn().mockReturnValue('1');
      
      // Mock UserModel.deleteUser to throw an error
      mockUserModel.deleteUser = jest.fn().mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await UserController.deleteUser(mockContext);

      expect(mockUserModel.deleteUser).toHaveBeenCalledWith(1);
      expect(mockContext.json).toHaveBeenCalledWith(
        { success: false, message: 'Error interno del servidor' },
        500
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockBody = {
        username: 'updateduser',
        zip_code: '54321',
        phone: '555-9876',
        email: 'updated@example.com',
        role: 'admin'
      };

      const mockContext = createMockContext();
      mockContext.req.parseBody = jest.fn().mockResolvedValue(mockBody);
      mockContext.req.param = jest.fn().mockReturnValue('1');
      mockUserModel.updateUser = jest.fn().mockResolvedValue({ rowCount: 1 });

      await UserController.updateUser(mockContext);

      expect(mockUserModel.updateUser).toHaveBeenCalledWith(
        expect.arrayContaining(['updateduser', '54321', '555-9876', 'updated@example.com', 'admin', expect.any(String), '1'])
      );
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario actualizado correctamente'
      });
    });

    it('should return 404 when user not found for update', async () => {
      const mockBody = {
        username: 'updateduser',
        zip_code: '54321',
        phone: '555-9876',
        email: 'updated@example.com',
        role: 'admin'
      };

      const mockContext = createMockContext();
      mockContext.req.parseBody = jest.fn().mockResolvedValue(mockBody);
      mockContext.req.param = jest.fn().mockReturnValue('999');
      mockUserModel.updateUser = jest.fn().mockResolvedValue({ rowCount: 0 });

      await UserController.updateUser(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { success: false, message: 'Usuario no encontrado' },
        404
      );
    });

    it('should handle database errors during update', async () => {
      const mockBody = {
        username: 'updateduser',
        zip_code: '54321',
        phone: '555-9876',
        email: 'updated@example.com',
        role: 'admin'
      };

      const mockContext = createMockContext();
      mockContext.req.parseBody = jest.fn().mockResolvedValue(mockBody);
      mockContext.req.param = jest.fn().mockReturnValue('1');
      mockUserModel.updateUser = jest.fn().mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await UserController.updateUser(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { success: false, message: 'Error interno del servidor' },
        500
      );

      consoleSpy.mockRestore();
    });

    it('should return 400 when required fields are missing', async () => {
      const mockBody = {
        username: 'updateduser',
        // Faltan campos requeridos
        zip_code: '54321'
      };

      const mockContext = createMockContext();
      mockContext.req.parseBody = jest.fn().mockResolvedValue(mockBody);
      mockContext.req.param = jest.fn().mockReturnValue('1');

      await UserController.updateUser(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith(
        { success: false, message: 'Faltan campos requeridos' },
        400
      );
    });
  });
});