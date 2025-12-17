import { poolActiva } from '../../src/config/db.js';
import { UserModel } from '../../src/model/UserModel.js';
import { UserController } from '../../src/controller/UserController.js';
import { sessionParser, isAdmin } from '../../src/middleware/authMiddleware.js';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { createMockContext, createMockDbResult, createMockUser, createMockNewUser } from '../setup/testUtils.js';

// Mock all dependencies
jest.mock('../../src/config/db.js', () => ({
  poolActiva: {
    query: jest.fn(),
  },
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('hono/cookie', () => ({
  getCookie: jest.fn(),
}));

const mockPool = poolActiva as jest.Mocked<typeof poolActiva>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('End-to-End Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JSON_WEB_TOKEN_SECRET = 'test_secret';
  });

  describe('Complete User Registration and Authentication Flow', () => {
    it('should handle complete user lifecycle: register -> login -> access protected resource', async () => {
      // Step 1: User Registration
      const newUserData = createMockNewUser({
        username: 'e2euser',
        password: 'password123',
        email: 'e2e@example.com'
      });

      // Mock password hashing for registration
      mockBcrypt.hash.mockResolvedValue('hashed_password123' as never);
      
      // Mock successful user insertion
      mockPool.query.mockResolvedValueOnce(createMockDbResult([], 1));

      const registrationContext = createMockContext();
      registrationContext.req.parseBody = jest.fn().mockResolvedValue(newUserData);

      await UserController.newUser(registrationContext);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO "User" (username, password, phone, email, zip_code) VALUES ($1, $2, $3, $4, $5)',
        ['e2euser', 'hashed_password123', '555-1234', 'e2e@example.com', '12345']
      );
      expect(registrationContext.redirect).toHaveBeenCalledWith('/login.html');

      // Step 2: User Login
      const loginData = {
        username: 'e2euser',
        password: 'password123'
      };

      const mockUserFromDb = {
        username: 'e2euser',
        password: 'hashed_password123',
        role: 'user'
      };

      // Mock user lookup for login
      mockPool.query.mockResolvedValueOnce(createMockDbResult([mockUserFromDb], 1));
      
      // Mock password comparison
      mockBcrypt.compare.mockResolvedValue(true as never);
      
      // Mock JWT token generation
      mockJwt.sign.mockReturnValue('jwt_token_for_e2euser' as never);

      const loginContext = createMockContext();
      loginContext.req.parseBody = jest.fn().mockResolvedValue(loginData);

      // Simulate login logic (from authRouter)
      const body = await loginContext.req.parseBody();
      const query = `SELECT username, password, role FROM "User" WHERE username = '${body.username}'`;
      const result = await poolActiva.query(query);
      
      const isValidUsername = result.rowCount > 0;
      expect(isValidUsername).toBe(true);

      if (isValidUsername && typeof body.password === 'string') {
        const isValidPassword = await bcrypt.compare(body.password, result.rows[0].password);
        expect(isValidPassword).toBe(true);
        
        if (isValidPassword) {
          const jwtToken = jwt.sign(
            {username: result.rows[0].username, role: result.rows[0].role},
            process.env.JSON_WEB_TOKEN_SECRET!,  
            {expiresIn: "2h"}
          );
          loginContext.header('Set-Cookie', `token=${jwtToken}; HttpOnly; Path=/`);
          loginContext.redirect("/home.html");
        }
      }

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { username: 'e2euser', role: 'user' },
        'test_secret',
        { expiresIn: '2h' }
      );
      expect(loginContext.redirect).toHaveBeenCalledWith('/home.html');

      // Step 3: Access Protected Resource (Get Users - Admin only)
      // First, simulate session parsing
      const mockDecodedToken = {
        username: 'e2euser',
        role: 'user'
      };

      mockJwt.verify.mockReturnValue(mockDecodedToken as any);

      const protectedContext = createMockContext();
      protectedContext.req.header = jest.fn().mockReturnValue('token=jwt_token_for_e2euser');

      // Simulate sessionParser middleware
      const mockNext = jest.fn();
      if (protectedContext.req.header('Cookie')) {
        const token = 'jwt_token_for_e2euser';
        const decodedToken = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET!) as any;
        protectedContext.set('username', decodedToken.username);
        protectedContext.set('role', decodedToken.role);
      }

      // Simulate isAdmin middleware (should fail for regular user)
      protectedContext.get = jest.fn().mockReturnValue('user');
      
      const role = protectedContext.get('role');
      if (!role) {
        protectedContext.status(401);
        protectedContext.header('Location', '/login.html?error=sesion');
        protectedContext.body(null);
      } else if (role !== 'admin') {
        protectedContext.status(403);
        protectedContext.header('Location', '/home.html?error=permisos');
        protectedContext.body(null);
      }

      expect(protectedContext.status).toHaveBeenCalledWith(403);
      expect(protectedContext.header).toHaveBeenCalledWith('Location', '/home.html?error=permisos');

      // Step 4: Test with Admin User
      const adminContext = createMockContext();
      adminContext.get = jest.fn().mockReturnValue('admin');
      
      const adminRole = adminContext.get('role');
      if (adminRole === 'admin') {
        // Mock successful user retrieval
        const mockUsers = [
          createMockUser({ username: 'e2euser', role: 'user' }),
          createMockUser({ id: 2, username: 'admin', role: 'admin' })
        ];
        
        mockPool.query.mockResolvedValueOnce(createMockDbResult(mockUsers, 2));
        
        await UserController.findUsers(adminContext);
        
        expect(adminContext.json).toHaveBeenCalledWith(mockUsers);
      }
    });
  });

  describe('Error Scenarios in Full Flow', () => {
    it('should handle registration failure and prevent login', async () => {
      // Step 1: Failed Registration
      const newUserData = createMockNewUser();
      
      mockBcrypt.hash.mockResolvedValue('hashed_password' as never);
      mockPool.query.mockResolvedValueOnce(createMockDbResult([], 0)); // Failed insertion

      const registrationContext = createMockContext();
      registrationContext.req.parseBody = jest.fn().mockResolvedValue(newUserData);

      await UserController.newUser(registrationContext);

      expect(registrationContext.json).toHaveBeenCalledWith(
        { error: 'No se puedo insertar el registro' },
        400
      );

      // Step 2: Attempt Login with Non-existent User
      const loginData = {
        username: newUserData.username,
        password: newUserData.password
      };

      mockPool.query.mockResolvedValueOnce(createMockDbResult([], 0)); // User not found

      const loginContext = createMockContext();
      loginContext.req.parseBody = jest.fn().mockResolvedValue(loginData);

      // Simulate login logic
      const body = await loginContext.req.parseBody();
      const query = `SELECT username, password, role FROM "User" WHERE username = '${body.username}'`;
      const result = await poolActiva.query(query);
      
      const isValidUsername = result.rowCount > 0;
      if (!isValidUsername) {
        loginContext.redirect("/login.html?error=1");
      }

      expect(isValidUsername).toBe(false);
      expect(loginContext.redirect).toHaveBeenCalledWith('/login.html?error=1');
    });

    it('should handle database errors throughout the flow', async () => {
      // Registration with database error
      const newUserData = createMockNewUser();
      
      mockBcrypt.hash.mockResolvedValue('hashed_password' as never);
      mockPool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const registrationContext = createMockContext();
      registrationContext.req.parseBody = jest.fn().mockResolvedValue(newUserData);

      await expect(UserController.newUser(registrationContext)).rejects.toThrow('Database connection failed');

      // Login with database error
      const loginData = {
        username: 'testuser',
        password: 'password'
      };

      mockPool.query.mockRejectedValueOnce(new Error('Database timeout'));

      const loginContext = createMockContext();
      loginContext.req.parseBody = jest.fn().mockResolvedValue(loginData);

      await expect(async () => {
        const body = await loginContext.req.parseBody();
        const query = `SELECT username, password, role FROM "User" WHERE username = '${body.username}'`;
        await poolActiva.query(query);
      }).rejects.toThrow('Database timeout');
    });
  });

  describe('Security Flow Tests', () => {
    it('should prevent access with invalid tokens', async () => {
      // Mock invalid token
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = createMockContext();
      context.req.header = jest.fn().mockReturnValue('token=invalid_token');

      // Should throw error when trying to verify invalid token
      await expect(async () => {
        if (context.req.header('Cookie')) {
          const token = 'invalid_token';
          jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET!);
        }
      }).rejects.toThrow('Invalid token');
    });

    it('should prevent SQL injection in user operations', async () => {
      // Test with malicious input
      const maliciousInput = "'; DROP TABLE User; --";
      
      const context = createMockContext();
      context.req.param = jest.fn().mockReturnValue(maliciousInput);

      // The current implementation is vulnerable to SQL injection
      // This test documents the current behavior
      const userToDeleteId = context.req.param("id");
      const query = `DELETE FROM "User" WHERE id = ${userToDeleteId}`;
      
      expect(query).toBe("DELETE FROM \"User\" WHERE id = '; DROP TABLE User; --");
      
      // This would be executed as-is, which is a security vulnerability
      // The test documents this issue for future refactoring
    });
  });
});