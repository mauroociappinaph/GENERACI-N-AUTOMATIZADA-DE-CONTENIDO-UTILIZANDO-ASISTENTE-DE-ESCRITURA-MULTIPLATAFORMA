import { z } from 'zod';
import { $Enums } from '@prisma/client';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  role: z.nativeEnum($Enums.UserRole).optional().default($Enums.UserRole.USER),
});

export const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  firstName: z.string().min(1, 'El nombre es requerido').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').optional(),
  role: z.nativeEnum($Enums.UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

// User response types (without sensitive data)
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: $Enums.UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User creation and update types
export type CreateUserInput = z.input<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Extend Express's Request interface
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserResponse;
  }
}
