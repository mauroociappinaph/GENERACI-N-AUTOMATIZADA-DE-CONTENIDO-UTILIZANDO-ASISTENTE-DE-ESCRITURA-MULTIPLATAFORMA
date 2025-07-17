import { UserService } from '../../src/services/user.service';
import { PasswordService } from '../../src/services/password.service';
import { User, $Enums } from '../../src/generated/prisma';
import { CreateUserInput, UpdateUserInput, ChangePasswordInput } from '../../src/types/user';

// Mock Prisma Client
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
};

// Mock PasswordService
jest.mock('../../src/services/password.service');
const MockedPasswordService = PasswordService as jest.Mocked<typeof PasswordService>;

describe('UserService', () => {
  let userService: UserService;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    role: $Enums.UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserResponse = {
    id: mockUser.id,
    email: mockUser.email,
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    role: mockUser.role,
    isActive: mockUser.isActive,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(() => {
    userService = new UserService(mockPrismaClient as any);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserInput: CreateUserInput = {
      email: 'new@example.com',
      password: 'StrongPass123!',
      firstName: 'New',
      lastName: 'User',
      role: $Enums.UserRole.USER,
    };

    it('should create user successfully', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      MockedPasswordService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      MockedPasswordService.hashPassword.mockResolvedValue('hashed-password');
      mockPrismaClient.user.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserInput);

      expect(result).toEqual(mockUserResponse);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserInput.email },
      });
      expect(MockedPasswordService.validatePasswordStrength).toHaveBeenCalledWith(
        createUserInput.password
      );
      expect(MockedPasswordService.hashPassword).toHaveBeenCalledWith(
        createUserInput.password
      );
      expect(mockPrismaClient.user.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      await expect(userService.createUser(createUserInput)).rejects.toThrow(
        'El email ya está registrado'
      );
    });

    it('should throw error for weak password', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      MockedPasswordService.validatePasswordStrength.mockReturnValue({
        isValid: false,
        errors: ['Password too weak'],
      });

      await expect(userService.createUser(createUserInput)).rejects.toThrow(
        'Contraseña no válida: Password too weak'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-123');

      expect(result).toEqual(mockUserResponse);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUserResponse);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.getUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('getUserWithPasswordByEmail', () => {
    it('should return full user with password hash', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserWithPasswordByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [mockUser];
      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaClient.user.count.mockResolvedValue(1);

      const result = await userService.getUsers(1, 10);

      expect(result).toEqual({
        users: [mockUserResponse],
        total: 1,
        page: 1,
        totalPages: 1,
      });
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by role and active status', async () => {
      mockPrismaClient.user.findMany.mockResolvedValue([]);
      mockPrismaClient.user.count.mockResolvedValue(0);

      await userService.getUsers(1, 10, $Enums.UserRole.ADMIN, true);

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: { role: $Enums.UserRole.ADMIN, isActive: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateUser', () => {
    const updateInput: UpdateUserInput = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateInput };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('user-123', updateInput);

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateInput,
      });
    });

    it('should throw error if user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(userService.updateUser('nonexistent', updateInput)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('changePassword', () => {
    const changePasswordInput: ChangePasswordInput = {
      currentPassword: 'oldPassword',
      newPassword: 'NewStrongPass123!',
    };

    it('should change password successfully', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      MockedPasswordService.verifyPassword.mockResolvedValue(true);
      MockedPasswordService.validatePasswordStrength.mockReturnValue({
        isValid: true,
        errors: [],
      });
      MockedPasswordService.hashPassword.mockResolvedValue('new-hashed-password');
      mockPrismaClient.user.update.mockResolvedValue(mockUser);

      await userService.changePassword('user-123', changePasswordInput);

      expect(MockedPasswordService.verifyPassword).toHaveBeenCalledWith(
        'oldPassword',
        mockUser.passwordHash
      );
      expect(MockedPasswordService.hashPassword).toHaveBeenCalledWith('NewStrongPass123!');
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { passwordHash: 'new-hashed-password' },
      });
    });

    it('should throw error for incorrect current password', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      MockedPasswordService.verifyPassword.mockResolvedValue(false);

      await expect(
        userService.changePassword('user-123', changePasswordInput)
      ).rejects.toThrow('La contraseña actual es incorrecta');
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user status', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.user.update.mockResolvedValue(inactiveUser);

      const result = await userService.toggleUserStatus('user-123');

      expect(result.isActive).toBe(false);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: false },
      });
    });

    it('should throw error if user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(userService.toggleUserStatus('nonexistent')).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.user.update.mockResolvedValue({ ...mockUser, isActive: false });

      await userService.deleteUser('user-123');

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: false },
      });
    });

    it('should throw error if user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(userService.deleteUser('nonexistent')).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('verifyCredentials', () => {
    it('should verify valid credentials', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      MockedPasswordService.verifyPassword.mockResolvedValue(true);

      const result = await userService.verifyCredentials('test@example.com', 'password');

      expect(result).toEqual(mockUserResponse);
    });

    it('should return null for invalid password', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      MockedPasswordService.verifyPassword.mockResolvedValue(false);

      const result = await userService.verifyCredentials('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaClient.user.findUnique.mockResolvedValue(inactiveUser);

      const result = await userService.verifyCredentials('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null for nonexistent user', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.verifyCredentials('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });
  });
});
