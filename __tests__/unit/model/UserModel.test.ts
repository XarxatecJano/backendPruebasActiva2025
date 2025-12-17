import { UserModel } from '../../../src/model/UserModel.js';
import { poolActiva } from '../../../src/config/db.js';
import { newUserDTO, User } from '../../../src/types/User.js';

// Mock the database pool
jest.mock('../../../src/config/db.js', () => ({
  poolActiva: {
    query: jest.fn(),
  },
}));

const mockPool = poolActiva as jest.Mocked<typeof poolActiva>;

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUsers', () => {
    it('should return users when query is successful', async () => {
      const mockUsers: User[] = [
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

      mockPool.query.mockResolvedValue({
        rows: mockUsers,
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await UserModel.findUsers();

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM "User"');
      expect(result).toEqual(mockUsers);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      mockPool.query.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await UserModel.findUsers();

      expect(consoleSpy).toHaveBeenCalledWith('Error en findUsers: Database connection failed');
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it('should return empty array when no users found', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await UserModel.findUsers();

      expect(result).toEqual([]);
    });
  });

  describe('newUser', () => {
    it('should insert new user successfully', async () => {
      const newUserData: newUserDTO = {
        username: 'newuser',
        password: 'hashedpassword',
        phone: '555-5678',
        email: 'newuser@example.com',
        zip_code: '54321'
      };

      const mockResult = {
        rows: [],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: []
      };

      mockPool.query.mockResolvedValue(mockResult);

      const result = await UserModel.newUser(newUserData);

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO "User" (username, password, phone, email, zip_code) VALUES ($1, $2, $3, $4, $5)',
        [newUserData.username, newUserData.password, newUserData.phone, newUserData.email, newUserData.zip_code]
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle database errors during insertion', async () => {
      const newUserData: newUserDTO = {
        username: 'newuser',
        password: 'hashedpassword',
        phone: '555-5678',
        email: 'newuser@example.com',
        zip_code: '54321'
      };

      const mockError = new Error('Duplicate key violation');
      mockPool.query.mockRejectedValue(mockError);

      await expect(UserModel.newUser(newUserData)).rejects.toThrow('Duplicate key violation');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 1;
      const mockResult = {
        rows: [],
        rowCount: 1,
        command: 'DELETE',
        oid: 0,
        fields: []
      };

      mockPool.query.mockResolvedValue(mockResult);

      const result = await UserModel.deleteUser(userId);

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM "User" WHERE id = $1',
        [userId]
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle user not found during deletion', async () => {
      const userId = 999;
      const mockResult = {
        rows: [],
        rowCount: 0,
        command: 'DELETE',
        oid: 0,
        fields: []
      };

      mockPool.query.mockResolvedValue(mockResult);

      const result = await UserModel.deleteUser(userId);

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM "User" WHERE id = $1',
        [userId]
      );
      expect(result.rowCount).toBe(0);
    });

    it('should handle database errors during deletion', async () => {
      const userId = 1;
      const mockError = new Error('Database connection failed');
      
      mockPool.query.mockRejectedValue(mockError);

      await expect(UserModel.deleteUser(userId)).rejects.toThrow('Database connection failed');
    });
  });
});