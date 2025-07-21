import { PrismaClient, User, $Enums } from '@prisma/client';
import { CreateUserInput, UpdateUserInput, ChangePasswordInput, UserResponse } from '../types/user';
import { IUserService } from './interfaces/user.interface';
export declare class UserService implements IUserService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Convierte un usuario de Prisma a UserResponse (sin datos sensibles)
     */
    private toUserResponse;
    /**
     * Crea un nuevo usuario
     */
    createUser(data: CreateUserInput): Promise<UserResponse>;
    /**
     * Obtiene un usuario por ID
     */
    getUserById(id: string): Promise<UserResponse | null>;
    /**
     * Obtiene un usuario por email
     */
    getUserByEmail(email: string): Promise<UserResponse | null>;
    /**
     * Obtiene un usuario con su hash de contraseña (para autenticación)
     */
    getUserWithPasswordByEmail(email: string): Promise<User | null>;
    /**
     * Obtiene todos los usuarios con paginación
     */
    getUsers(page?: number, limit?: number, role?: $Enums.UserRole, isActive?: boolean): Promise<{
        users: UserResponse[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Actualiza un usuario
     */
    updateUser(id: string, data: UpdateUserInput): Promise<UserResponse>;
    /**
     * Cambia la contraseña de un usuario
     */
    changePassword(userId: string, data: ChangePasswordInput): Promise<void>;
    /**
     * Activa o desactiva un usuario
     */
    toggleUserStatus(id: string): Promise<UserResponse>;
    /**
     * Elimina un usuario (soft delete - lo desactiva)
     */
    deleteUser(id: string): Promise<void>;
    /**
     * Verifica las credenciales de un usuario
     */
    verifyCredentials(email: string, password: string): Promise<UserResponse | null>;
}
