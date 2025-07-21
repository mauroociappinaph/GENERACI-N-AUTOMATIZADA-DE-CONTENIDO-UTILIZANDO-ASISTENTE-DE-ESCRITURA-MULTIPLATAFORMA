"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordService {
    /**
     * Encripta una contraseña usando bcrypt
     */
    static async hashPassword(password) {
        try {
            const salt = await bcrypt_1.default.genSalt(this.SALT_ROUNDS);
            return await bcrypt_1.default.hash(password, salt);
        }
        catch (error) {
            throw new Error('Error al encriptar la contraseña');
        }
    }
    /**
     * Verifica si una contraseña coincide con su hash
     */
    static async verifyPassword(password, hash) {
        try {
            return await bcrypt_1.default.compare(password, hash);
        }
        catch (error) {
            throw new Error('Error al verificar la contraseña');
        }
    }
    /**
     * Valida la fortaleza de una contraseña
     */
    static validatePasswordStrength(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra mayúscula');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra minúscula');
        }
        if (!/\d/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('La contraseña debe contener al menos un carácter especial');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
exports.PasswordService = PasswordService;
PasswordService.SALT_ROUNDS = 12;
