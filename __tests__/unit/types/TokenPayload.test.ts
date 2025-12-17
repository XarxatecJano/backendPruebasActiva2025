import { TokenPayload } from '../../../src/types/TokenPayload.js';
import { JwtPayload } from 'jsonwebtoken';

describe('TokenPayload Type', () => {
  describe('TokenPayload interface', () => {
    it('should extend JwtPayload with username and role properties', () => {
      const tokenPayload: TokenPayload = {
        username: 'string', // Note: the type definition has literal 'string', not string type
        role: 'string',     // Note: the type definition has literal 'string', not string type
        iat: 1234567890,
        exp: 1234567890
      };

      expect(tokenPayload.username).toBe('string');
      expect(tokenPayload.role).toBe('string');
      expect(tokenPayload.iat).toBe(1234567890);
      expect(tokenPayload.exp).toBe(1234567890);
    });

    it('should be compatible with JwtPayload', () => {
      const jwtPayload: JwtPayload = {
        iat: 1234567890,
        exp: 1234567890,
        sub: 'user123'
      };

      const tokenPayload: TokenPayload = {
        ...jwtPayload,
        username: 'string',
        role: 'string'
      };

      expect(tokenPayload.iat).toBe(jwtPayload.iat);
      expect(tokenPayload.exp).toBe(jwtPayload.exp);
      expect(tokenPayload.sub).toBe(jwtPayload.sub);
    });

    it('should allow optional JwtPayload properties', () => {
      const minimalTokenPayload: TokenPayload = {
        username: 'string',
        role: 'string'
      };

      expect(minimalTokenPayload.username).toBe('string');
      expect(minimalTokenPayload.role).toBe('string');
      expect(minimalTokenPayload.iat).toBeUndefined();
      expect(minimalTokenPayload.exp).toBeUndefined();
    });

    it('should support all standard JWT claims', () => {
      const fullTokenPayload: TokenPayload = {
        username: 'string',
        role: 'string',
        iss: 'issuer',
        sub: 'subject',
        aud: 'audience',
        exp: 1234567890,
        nbf: 1234567890,
        iat: 1234567890,
        jti: 'jwt-id'
      };

      expect(fullTokenPayload.iss).toBe('issuer');
      expect(fullTokenPayload.sub).toBe('subject');
      expect(fullTokenPayload.aud).toBe('audience');
      expect(fullTokenPayload.jti).toBe('jwt-id');
      expect(fullTokenPayload.nbf).toBe(1234567890);
    });
  });

  describe('Type validation', () => {
    it('should enforce username and role as literal string type', () => {
      // Note: The original type definition uses literal 'string' type
      // This is likely a mistake in the original code, but we test what's defined
      const tokenPayload: TokenPayload = {
        username: 'string', // Must be literal 'string'
        role: 'string'      // Must be literal 'string'
      };

      expect(typeof tokenPayload.username).toBe('string');
      expect(typeof tokenPayload.role).toBe('string');
    });
  });
});