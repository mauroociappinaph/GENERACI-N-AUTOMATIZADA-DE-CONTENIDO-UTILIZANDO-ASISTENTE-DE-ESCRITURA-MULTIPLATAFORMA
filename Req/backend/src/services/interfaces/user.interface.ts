import { $Enums } from '@prisma/client';
import {
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
  UserResponse,
} from '@/types/user';

/**
 * Interface for UserService
 * Prevents "property does not exist" errors
 */
export interface IUserService {
  createUser(data: CreateUserInput): Promise<UserResponse>;
  getUserById(id: string): Promise<UserResponse | null>;
  getUserByEmail(email: string): Promise<UserResponse | null>;
  getUsers(
    page?: number,
    limit?: number,
    role?: $Enums.UserRole,
    isActive?: boolean
  ): Promise<{
    users: UserResponse[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  updateUser(id: string, data: UpdateUserInput): Promise<UserResponse>;
  changePassword(userId: string, data: ChangePasswordInput): Promise<void>;
  toggleUserStatus(id: string): Promise<UserResponse>;
  deleteUser(id: string): Promise<void>;
  verifyCredentials(email: string, password: string): Promise<UserResponse | null>;
}
