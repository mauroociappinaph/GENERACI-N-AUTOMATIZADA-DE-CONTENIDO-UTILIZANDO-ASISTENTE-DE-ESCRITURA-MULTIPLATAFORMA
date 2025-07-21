import { UserResponse } from '@/types/user';
export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    type: 'access' | 'refresh';
    exp?: number;
    iat?: number;
    nbf?: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class JwtService {
    private static readonly ACCESS_TOKEN_SECRET;
    private static readonly REFRESH_TOKEN_SECRET;
    private static readonly ACCESS_TOKEN_EXPIRES_IN;
    private static readonly REFRESH_TOKEN_EXPIRES_IN;
    /**
     * Genera un par de tokens (access y refresh) para un usuario
     */
    static generateTokenPair(user: UserResponse): TokenPair;
    /**
     * Verifica y decodifica un access token
     */
    static verifyAccessToken(token: string): JwtPayload;
    /**
     * Verifica y decodifica un refresh token
     */
    static verifyRefreshToken(token: string): JwtPayload;
    /**
     * Extrae el token del header Authorization
     */
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
    /**
     * Genera un nuevo access token usando un refresh token válido
     */
    static refreshAccessToken(refreshToken: string): string;
    /**
     * Decodifica un token sin verificar (útil para debugging)
     */
    static decodeToken(token: string): JwtPayload | null;
    /**
     * Verifica si un token está próximo a expirar
     */
    static isTokenExpiringSoon(token: string, thresholdMinutes?: number): boolean;
}
