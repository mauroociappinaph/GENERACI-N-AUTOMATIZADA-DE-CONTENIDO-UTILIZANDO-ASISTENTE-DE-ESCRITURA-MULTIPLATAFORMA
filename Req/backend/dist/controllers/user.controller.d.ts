import { Request, Response } from 'express';
export declare class UserController {
    private static userService;
    /**
     * Obtener todos los usuarios con paginación y filtros
     */
    static getUsers(req: Request, res: Response): Promise<void>;
    /**
     * Obtener un usuario por ID
     */
    static getUserById(req: Request, res: Response): Promise<void>;
    /**
     * Crear un nuevo usuario
     */
    static createUser(req: Request, res: Response): Promise<void>;
    /**
     * Actualizar un usuario
     */
    static updateUser(req: Request, res: Response): Promise<void>;
    /**
     * Cambiar contraseña de un usuario
     */
    static changePassword(req: Request, res: Response): Promise<void>;
    /**
     * Activar/desactivar un usuario
     */
    static toggleUserStatus(req: Request, res: Response): Promise<void>;
    /**
     * Eliminar un usuario (soft delete)
     */
    static deleteUser(req: Request, res: Response): Promise<void>;
    /**
     * Obtener perfil del usuario actual
     */
    static getProfile(req: Request, res: Response): Promise<void>;
    /**
     * Actualizar perfil del usuario actual
     */
    static updateProfile(req: Request, res: Response): Promise<void>;
    /**
     * Obtener roles disponibles
     */
    static getRoles(req: Request, res: Response): Promise<void>;
    /**
     * Obtener permisos de un rol específico
     */
    static getRolePermissions(req: Request, res: Response): Promise<void>;
    /**
     * Obtener información completa de todos los roles
     */
    static getAllRolesInfo(req: Request, res: Response): Promise<void>;
    /**
     * Obtener información completa de todos los permisos
     */
    static getAllPermissionsInfo(req: Request, res: Response): Promise<void>;
    /**
     * Verificar si el usuario actual tiene un permiso específico
     */
    static checkUserPermission(req: Request, res: Response): Promise<void>;
}
