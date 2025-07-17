import { JwtService } from '../../src/services/jwt.service';
import { UserResponse } from '../../src/types/user';
import jwt from 'jsonwebtoken';

describe('JwtService', () => {
  const mockUser: UserResponse = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      const tokenPair = JwtService.generateTokenPair(mockUser);

      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.expiresIn).toBe(15 * 60); // 15 minutes
    });

    it('should generate different tokens each time', async () => {
      const tokenPair1 = JwtService.generateTokenPair(mockUser);
      // Wait a moment to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));
      const tokenPair2 = JwtService.generateTokenPair(mockUser);

      expect(tokenPair1.accessToken).not.toBe(tokenPair2.accessToken);
      expect(tokenPair1.refreshToken).not.toBe(tokenPair2.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const tokenPair = JwtService.generateTokenPair(mockUser);
      const decoded = JwtService.verifyAccessToken(tokenPair.accessToken);

      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.type).toBe('access');
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => JwtService.verifyAccessToken(invalidToken)).toThrow(
        'Token inválido'
      );
    });

    it('should reject refresh token as access token', () => {
      const tokenPair = JwtService.generateTokenPair(mockUser);

      expect(() => JwtService.verifyAccessToken(tokenPair.refreshToken)).toThrow(
        'Token inválido'
      );
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role, type: 'access' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '-1s' }
      );

      expect(() => JwtService.verifyAccessToken(expiredToken)).toThrow(
        'Token inválido'
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const tokenPair = JwtService.generateTokenPair(mockUser);
      const decoded = JwtService.verifyRefreshToken(tokenPair.refreshToken);

      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.type).toBe('refresh');
    });

    it('should reject access token as refresh token', () => {
      const tokenPair = JwtService.generateTokenPair(mockUser);

      expect(() => JwtService.verifyRefreshToken(tokenPair.accessToken)).toThrow(
        'Refresh token inválido'
      );
    });

    it('should reject invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => JwtService.verifyRefreshToken(invalidToken)).toThrow(
        'Refresh token inválido'
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'valid.jwt.token';
      const header = `Bearer ${token}`;
      const extracted = JwtService.extractTokenFromHeader(header);

      expect(extracted).toBe(token);
    });

    it('should return null for undefined header', () => {
      const extracted = JwtService.extractTokenFromHeader(undefined);

      expect(extracted).toBeNull();
    });

    it('should return null for invalid format', () => {
      const invalidHeader = 'InvalidFormat token';
      const extracted = JwtService.extractTokenFromHeader(invalidHeader);

      expect(extracted).toBeNull();
    });

    it('should return null for missing Bearer prefix', () => {
      const invalidHeader = 'valid.jwt.token';
      const extracted = JwtService.extractTokenFromHeader(invalidHeader);

      expect(extracted).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from valid refresh token', async () => {
      const tokenPair = JwtService.generateTokenPair(mockUser);
      // Wait a moment to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newAccessToken = JwtService.refreshAccessToken(tokenPair.refreshToken);

      expect(newAccessToken).toBeDefined();
      expect(newAccessToken).not.toBe(tokenPair.accessToken);

      const decoded = JwtService.verifyAccessToken(newAccessToken);
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.type).toBe('access');
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => JwtService.refreshAccessToken(invalidToken)).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('should decode valid token without verification', () => {
      const tokenPair = JwtService.generateTokenPair(mockUser);
      const decoded = JwtService.decodeToken(tokenPair.accessToken);

      expect(decoded).toBeDefined();
      expect(decoded!.userId).toBe(mockUser.id);
      expect(decoded!.email).toBe(mockUser.email);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token';
      const decoded = JwtService.decodeToken(invalidToken);

      expect(decoded).toBeNull();
    });
  });
});
