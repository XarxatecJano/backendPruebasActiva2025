import { sessionParser, isAdmin } from '../../../src/middleware/authMiddleware.js';
import { getCookie } from 'hono/cookie';
import * as jwt from 'jsonwebtoken';
import { Context } from 'hono';

// Mock dependencies
jest.mock('hono/cookie');
jest.mock('jsonwebtoken');

const mockGetCookie = getCookie as jest.MockedFunction<typeof getCookie>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Mock Hono Context and Next function
const createMockContext = (overrides = {}): Context => {
  const mockContext = {
    req: {
      header: jest.fn(),
    },
    set: jest.fn(),
    get: jest.fn(),
    status: jest.fn(),
    header: jest.fn(),
    body: jest.fn(),
    ...overrides,
  } as unknown as Context;
  
  return mockContext;
};

const mockNext = jest.fn();

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JSON_WEB_TOKEN_SECRET = 'test_secret';
  });

  describe('sessionParser', () => {
    it('should parse valid token and set user data', async () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        username: 'testuser',
        role: 'admin'
      };

      const mockContext = createMockContext();
      mockContext.req.header = jest.fn().mockReturnValue('token=valid.jwt.token');
      mockGetCookie.mockReturnValue(mockToken);
      mockJwt.verify.mockReturnValue(mockDecodedToken as any);

      await sessionParser(mockContext, mockNext);

      expect(mockGetCookie).toHaveBeenCalledWith(mockContext, 'token');
      expect(mockJwt.verify).toHaveBeenCalledWith(mockToken, 'test_secret');
      expect(mockContext.set).toHaveBeenCalledWith('username', 'testuser');
      expect(mockContext.set).toHaveBeenCalledWith('role', 'admin');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without setting user data when no cookie header', async () => {
      const mockContext = createMockContext();
      mockContext.req.header = jest.fn().mockReturnValue(undefined);

      await sessionParser(mockContext, mockNext);

      expect(mockGetCookie).not.toHaveBeenCalled();
      expect(mockJwt.verify).not.toHaveBeenCalled();
      expect(mockContext.set).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle invalid token gracefully', async () => {
      const mockToken = 'invalid.jwt.token';

      const mockContext = createMockContext();
      mockContext.req.header = jest.fn().mockReturnValue('token=invalid.jwt.token');
      mockGetCookie.mockReturnValue(mockToken);
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Should not throw, but continue execution
      await expect(sessionParser(mockContext, mockNext)).resolves.not.toThrow();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should allow access for admin users', async () => {
      const mockContext = createMockContext();
      mockContext.get = jest.fn().mockReturnValue('admin');

      await isAdmin(mockContext, mockNext);

      expect(mockContext.get).toHaveBeenCalledWith('role');
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.status).not.toHaveBeenCalled();
    });

    it('should deny access when no role is set (not authenticated)', async () => {
      const mockContext = createMockContext();
      mockContext.get = jest.fn().mockReturnValue(undefined);

      const result = await isAdmin(mockContext, mockNext);

      expect(mockContext.get).toHaveBeenCalledWith('role');
      expect(mockContext.status).toHaveBeenCalledWith(401);
      expect(mockContext.header).toHaveBeenCalledWith('Location', '/login.html?error=sesion');
      expect(mockContext.body).toHaveBeenCalledWith(null);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin users', async () => {
      const mockContext = createMockContext();
      mockContext.get = jest.fn().mockReturnValue('user');

      const result = await isAdmin(mockContext, mockNext);

      expect(mockContext.get).toHaveBeenCalledWith('role');
      expect(mockContext.status).toHaveBeenCalledWith(403);
      expect(mockContext.header).toHaveBeenCalledWith('Location', '/home.html?error=permisos');
      expect(mockContext.body).toHaveBeenCalledWith(null);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for empty string role', async () => {
      const mockContext = createMockContext();
      mockContext.get = jest.fn().mockReturnValue('');

      const result = await isAdmin(mockContext, mockNext);

      expect(mockContext.status).toHaveBeenCalledWith(401);
      expect(mockContext.header).toHaveBeenCalledWith('Location', '/login.html?error=sesion');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});