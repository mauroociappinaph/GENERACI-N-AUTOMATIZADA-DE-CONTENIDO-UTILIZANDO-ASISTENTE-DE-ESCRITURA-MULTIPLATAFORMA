import { PrismaClient, User, $Enums } from '../generated/prisma';
import { PasswordService } from './password.service';
import {
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
  UserResponse,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
} from '@/types/user';

export class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Convierte un usuario de Prisma a UserResponse (sin datos sensibles)
   */
  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(data: CreateUserInput): Promise<UserResponse> {
    // Validar datos de entrada
    const validatedData = createUserSchema.parse(data);

    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Validar fortaleza de la contraseña
    const passwordValidation = PasswordService.validatePasswordStrength(
      validatedData.password
    );

    if (!passwordValidation.isValid) {
      throw new Error(
        `Contraseña no válida: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Encriptar contraseña
    const passwordHash = await PasswordService.hashPassword(
      validatedData.password
    );

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
      },
    });

    return this.toUserResponse(user);
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toUserResponse(user) : null;
  }

  /**
   * Obtiene un usuario por email
   */
  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toUserResponse(user) : null;
  }

  /**
   * Obtiene un usuario con su hash de contraseña (para autenticación)
   */
  async getUserWithPasswordByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Obtiene todos los usuarios con paginación
   */
  async getUsers(
    page: number = 1,
    limit: number = 10,
    role?: $Enums.UserRole,
    isActive?: boolean
  ): Promise<{
    users: UserResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => this.toUserResponse(user)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<UserResponse> {
    // Validar datos de entrada
    const validatedData = updateUserSchema.parse(data);

    // Verificar que el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailInUse = await this.prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailInUse) {
        throw new Error('El email ya está registrado');
      }
    }

    // Actualizar usuario
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: validatedData,
    });

    return this.toUserResponse(updatedUser);
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async changePassword(
    userId: string,
    data: ChangePasswordInput
  ): Promise<void> {
    // Validar datos de entrada
    const validatedData = changePasswordSchema.parse(data);

    // Obtener usuario con contraseña
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await PasswordService.verifyPassword(
      validatedData.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Validar nueva contraseña
    const passwordValidation = PasswordService.validatePasswordStrength(
      validatedData.newPassword
    );

    if (!passwordValidation.isValid) {
      throw new Error(
        `Nueva contraseña no válida: ${passwordValidation.errors.join(', ')}`
      );
    }

    // Encriptar nueva contraseña
    const newPasswordHash = await PasswordService.hashPassword(
      validatedData.newPassword
    );

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  /**
   * Activa o desactiva un usuario
   */
  async toggleUserStatus(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return this.toUserResponse(updatedUser);
  }

  /**
   * Elimina un usuario (soft delete - lo desactiva)
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Soft delete - solo desactivar el usuario
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Verifica las credenciales de un usuario
   */
  async verifyCredentials(
    email: string,
    password: string
  ): Promise<UserResponse | null> {
    const user = await this.getUserWithPasswordByEmail(email);

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await PasswordService.verifyPassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return null;
    }

    return this.toUserResponse(user);
  }
}
