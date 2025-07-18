import { User, ApiResponse } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Servicio de autenticación para comunicarse con el backend
 */
export class AuthService {
  private static getBackendUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  /**
   * Inicia sesión con email y contraseña
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.getBackendUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al iniciar sesión');
      }

      const result: ApiResponse<LoginResponse> = await response.json();

      if (!result.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return result.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error
        ? error
        : new Error('Error al iniciar sesión');
    }
  }

  /**
   * Refresca el token de acceso
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    try {
      const response = await fetch(`${this.getBackendUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al refrescar token');
      }

      const result: ApiResponse<RefreshTokenResponse> = await response.json();

      if (!result.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      return result.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error instanceof Error
        ? error
        : new Error('Error al refrescar token');
    }
  }

  /**
   * Cierra sesión
   */
  static async logout(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.getBackendUrl()}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(
          'Logout request failed, but continuing with client-side logout'
        );
      }
    } catch (error) {
      console.warn('Logout error:', error);
      // No lanzamos error aquí porque el logout del cliente debe continuar
    }
  }

  /**
   * Obtiene información del usuario actual
   */
  static async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await fetch(`${this.getBackendUrl()}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 'Error al obtener información del usuario'
        );
      }

      const result: ApiResponse<{ user: User }> = await response.json();

      if (!result.data?.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      return result.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error instanceof Error
        ? error
        : new Error('Error al obtener información del usuario');
    }
  }

  /**
   * Verifica si un token es válido
   */
  static async verifyToken(token: string): Promise<boolean> {
    try {
      await this.getCurrentUser(token);
      return true;
    } catch (error) {
      return false;
    }
  }
}
