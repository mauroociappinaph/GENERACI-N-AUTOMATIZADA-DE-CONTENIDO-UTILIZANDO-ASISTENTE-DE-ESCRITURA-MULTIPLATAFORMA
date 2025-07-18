import { PasswordService } from '../../src/services/password.service';

describe('PasswordService', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await PasswordService.hashPassword(password);
      const hash2 = await PasswordService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hash = await PasswordService.hashPassword('');
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const password = 'TestPassword123!';
      const invalidHash = 'invalid-hash';

      const result = await PasswordService.verifyPassword(password, invalidHash);
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const strongPassword = 'StrongPass123!';
      const result = PasswordService.validatePasswordStrength(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password too short', () => {
      const shortPassword = 'Short1!';
      const result = PasswordService.validatePasswordStrength(shortPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'La contraseña debe tener al menos 8 caracteres'
      );
    });

    it('should reject password without uppercase', () => {
      const password = 'lowercase123!';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'La contraseña debe contener al menos una letra mayúscula'
      );
    });

    it('should reject password without lowercase', () => {
      const password = 'UPPERCASE123!';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'La contraseña debe contener al menos una letra minúscula'
      );
    });

    it('should reject password without numbers', () => {
      const password = 'NoNumbers!';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'La contraseña debe contener al menos un número'
      );
    });

    it('should reject password without special characters', () => {
      const password = 'NoSpecial123';
      const result = PasswordService.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'La contraseña debe contener al menos un carácter especial'
      );
    });

    it('should return multiple errors for weak password', () => {
      const weakPassword = 'weak';
      const result = PasswordService.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
