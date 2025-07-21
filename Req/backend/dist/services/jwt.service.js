"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtService {
    /**
     * Genera un par de tokens (access y refresh) para un usuario
     */
    static generateTokenPair(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, this.ACCESS_TOKEN_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN });
        const refreshToken = jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, this.REFRESH_TOKEN_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN });
        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60, // 15 minutes in seconds
        };
    }
    /**
     * Verifica y decodifica un access token
     */
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.ACCESS_TOKEN_SECRET);
            if (decoded.type !== 'access') {
                throw new Error('Token inválido: tipo incorrecto');
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Token inválido');
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Token expirado');
            }
            throw error;
        }
    }
    /**
     * Verifica y decodifica un refresh token
     */
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.REFRESH_TOKEN_SECRET);
            if (decoded.type !== 'refresh') {
                throw new Error('Token inválido: tipo incorrecto');
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Refresh token inválido');
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Refresh token expirado');
            }
            throw error;
        }
    }
    /**
     * Extrae el token del header Authorization
     */
    static extractTokenFromHeader(authHeader) {
        if (!authHeader) {
            return null;
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        return parts[1];
    }
    /**
     * Genera un nuevo access token usando un refresh token válido
     */
    static refreshAccessToken(refreshToken) {
        const decoded = this.verifyRefreshToken(refreshToken);
        const newPayload = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            type: 'access',
        };
        return jsonwebtoken_1.default.sign(newPayload, this.ACCESS_TOKEN_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
        });
    }
    /**
     * Decodifica un token sin verificar (útil para debugging)
     */
    static decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch {
            return null;
        }
    }
    /**
     * Verifica si un token está próximo a expirar
     */
    static isTokenExpiringSoon(token, thresholdMinutes = 5) {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const thresholdTime = thresholdMinutes * 60 * 1000; // Convert minutes to milliseconds
        return expirationTime - currentTime <= thresholdTime;
    }
}
exports.JwtService = JwtService;
// JWT Service for handling authentication tokens
JwtService.ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
JwtService.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
JwtService.ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
JwtService.REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days
