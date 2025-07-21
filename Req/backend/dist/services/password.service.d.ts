export declare class PasswordService {
    private static readonly SALT_ROUNDS;
    /**
     * Encripta una contraseña usando bcrypt
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Verifica si una contraseña coincide con su hash
     */
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * Valida la fortaleza de una contraseña
     */
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    };
}
