import { Context } from 'hono';

/**
 * Utility functions for testing
 */

/**
 * Creates a mock Hono Context for testing
 */
export const createMockContext = (overrides: Partial<Context> = {}): Context => {
  const mockContext = {
    req: {
      parseBody: jest.fn(),
      json: jest.fn(),
      param: jest.fn(),
      header: jest.fn(),
      query: jest.fn(),
    },
    res: {
      headers: new Headers(),
    },
    json: jest.fn(),
    text: jest.fn(),
    html: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn(),
    header: jest.fn(),
    body: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    var: {},
    env: {},
    event: {},
    executionCtx: {},
    finalized: false,
    error: jest.fn(),
    ...overrides,
  } as unknown as Context;

  return mockContext;
};

/**
 * Creates a mock database result
 */
export const createMockDbResult = (rows: any[] = [], rowCount: number = 0) => ({
  rows,
  rowCount,
  command: 'SELECT',
  oid: 0,
  fields: [],
});

/**
 * Creates a mock user object
 */
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  password: 'hashedpassword',
  created_at: new Date('2023-01-01'),
  updated_at: new Date('2023-01-01'),
  zip_code: '12345',
  phone: '555-1234',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
});

/**
 * Creates a mock newUserDTO object
 */
export const createMockNewUser = (overrides = {}) => ({
  username: 'newuser',
  password: 'plainpassword',
  zip_code: '12345',
  phone: '555-1234',
  email: 'newuser@example.com',
  ...overrides,
});

/**
 * Mock next function for middleware testing
 */
export const mockNext = jest.fn();

/**
 * Resets all mocks
 */
export const resetAllMocks = () => {
  jest.clearAllMocks();
  mockNext.mockClear();
};

/**
 * Sets up test environment variables
 */
export const setupTestEnv = () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.JSON_WEB_TOKEN_SECRET = 'test_secret_key';
  process.env.PORT = '3001';
};

/**
 * Cleans up test environment
 */
export const cleanupTestEnv = () => {
  delete process.env.NODE_ENV;
  delete process.env.DATABASE_URL;
  delete process.env.JSON_WEB_TOKEN_SECRET;
  delete process.env.PORT;
};