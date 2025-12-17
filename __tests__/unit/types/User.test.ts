import { User, newUserDTO } from '../../../src/types/User.js';

describe('User Types', () => {
  describe('User interface', () => {
    it('should define User interface with all required properties', () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-02'),
        zip_code: '12345',
        phone: '555-1234',
        email: 'test@example.com',
        role: 'user'
      };

      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');
      expect(user.password).toBe('hashedpassword');
      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
      expect(user.zip_code).toBe('12345');
      expect(user.phone).toBe('555-1234');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user');
    });

    it('should allow different role values', () => {
      const adminUser: User = {
        id: 2,
        username: 'admin',
        password: 'hashedpassword',
        created_at: new Date(),
        updated_at: new Date(),
        zip_code: '54321',
        phone: '555-5678',
        email: 'admin@example.com',
        role: 'admin'
      };

      expect(adminUser.role).toBe('admin');
    });
  });

  describe('newUserDTO interface', () => {
    it('should define newUserDTO interface with required properties for user creation', () => {
      const newUser: newUserDTO = {
        username: 'newuser',
        password: 'plainpassword',
        zip_code: '67890',
        phone: '555-9999',
        email: 'newuser@example.com'
      };

      expect(newUser.username).toBe('newuser');
      expect(newUser.password).toBe('plainpassword');
      expect(newUser.zip_code).toBe('67890');
      expect(newUser.phone).toBe('555-9999');
      expect(newUser.email).toBe('newuser@example.com');
    });

    it('should not include id, timestamps, or role in newUserDTO', () => {
      const newUser: newUserDTO = {
        username: 'testuser',
        password: 'password123',
        zip_code: '12345',
        phone: '555-1234',
        email: 'test@example.com'
      };

      // TypeScript compilation will fail if these properties exist
      expect('id' in newUser).toBe(false);
      expect('created_at' in newUser).toBe(false);
      expect('updated_at' in newUser).toBe(false);
      expect('role' in newUser).toBe(false);
    });
  });

  describe('Type compatibility', () => {
    it('should allow User to be created from newUserDTO with additional properties', () => {
      const newUserData: newUserDTO = {
        username: 'testuser',
        password: 'hashedpassword',
        zip_code: '12345',
        phone: '555-1234',
        email: 'test@example.com'
      };

      const user: User = {
        id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        role: 'user',
        ...newUserData
      };

      expect(user.username).toBe(newUserData.username);
      expect(user.password).toBe(newUserData.password);
      expect(user.zip_code).toBe(newUserData.zip_code);
      expect(user.phone).toBe(newUserData.phone);
      expect(user.email).toBe(newUserData.email);
      expect(user.id).toBe(1);
      expect(user.role).toBe('user');
    });
  });
});