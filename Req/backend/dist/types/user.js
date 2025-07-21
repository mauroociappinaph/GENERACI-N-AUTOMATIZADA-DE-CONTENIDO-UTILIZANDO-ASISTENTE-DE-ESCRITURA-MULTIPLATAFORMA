"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// User validation schemas
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    firstName: zod_1.z.string().min(1, 'El nombre es requerido'),
    lastName: zod_1.z.string().min(1, 'El apellido es requerido'),
    role: zod_1.z.nativeEnum(client_1.$Enums.UserRole).optional().default(client_1.$Enums.UserRole.USER),
});
exports.updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido').optional(),
    firstName: zod_1.z.string().min(1, 'El nombre es requerido').optional(),
    lastName: zod_1.z.string().min(1, 'El apellido es requerido').optional(),
    role: zod_1.z.nativeEnum(client_1.$Enums.UserRole).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: zod_1.z
        .string()
        .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});
