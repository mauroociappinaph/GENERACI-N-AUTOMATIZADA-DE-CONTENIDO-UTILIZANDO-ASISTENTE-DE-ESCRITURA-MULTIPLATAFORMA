"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const password_service_1 = require("./password.service");
const user_1 = require("../types/user");
class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Convierte un usuario de Prisma a UserResponse (sin datos sensibles)
     */
    toUserResponse(user) {
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
    async createUser(data) {
        // Validar datos de entrada
        const validatedData = user_1.createUserSchema.parse(data);
        // Verificar si el email ya existe
        const existingUser = await this.prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }
        // Validar fortaleza de la contraseña
        const passwordValidation = password_service_1.PasswordService.validatePasswordStrength(validatedData.password);
        if (!passwordValidation.isValid) {
            throw new Error(`Contraseña no válida: ${passwordValidation.errors.join(', ')}`);
        }
        // Encriptar contraseña
        const passwordHash = await password_service_1.PasswordService.hashPassword(validatedData.password);
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
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        return user ? this.toUserResponse(user) : null;
    }
    /**
     * Obtiene un usuario por email
     */
    async getUserByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        return user ? this.toUserResponse(user) : null;
    }
    /**
     * Obtiene un usuario con su hash de contraseña (para autenticación)
     */
    async getUserWithPasswordByEmail(email) {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }
    /**
     * Obtiene todos los usuarios con paginación
     */
    async getUsers(page = 1, limit = 10, role, isActive) {
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
            users: users.map(user => this.toUserResponse(user)),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    /**
     * Actualiza un usuario
     */
    async updateUser(id, data) {
        // Validar datos de entrada
        const validatedData = user_1.updateUserSchema.parse(data);
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
    async changePassword(userId, data) {
        // Validar datos de entrada
        const validatedData = user_1.changePasswordSchema.parse(data);
        // Obtener usuario con contraseña
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        // Verificar contraseña actual
        const isCurrentPasswordValid = await password_service_1.PasswordService.verifyPassword(validatedData.currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new Error('La contraseña actual es incorrecta');
        }
        // Validar nueva contraseña
        const passwordValidation = password_service_1.PasswordService.validatePasswordStrength(validatedData.newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(`Nueva contraseña no válida: ${passwordValidation.errors.join(', ')}`);
        }
        // Encriptar nueva contraseña
        const newPasswordHash = await password_service_1.PasswordService.hashPassword(validatedData.newPassword);
        // Actualizar contraseña
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
    }
    /**
     * Activa o desactiva un usuario
     */
    async toggleUserStatus(id) {
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
    async deleteUser(id) {
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
    async verifyCredentials(email, password) {
        const user = await this.getUserWithPasswordByEmail(email);
        if (!user || !user.isActive) {
            return null;
        }
        const isPasswordValid = await password_service_1.PasswordService.verifyPassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }
        return this.toUserResponse(user);
    }
}
exports.UserService = UserService;
