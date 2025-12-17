// Setup global test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JSON_WEB_TOKEN_SECRET = 'test_secret_key_for_jwt_tokens';
process.env.PORT = '3001';