import { Request, Response, NextFunction } from 'express';
/**
 * Middleware para logging automático de auditoría
 * Responsabilidad: Capturar automáticamente actividades de API para auditoría
 */
interface AuditConfig {
    action: string;
    resourceType: string;
    getResourceId?: (req: Request) => string | undefined;
    captureRequestBody?: boolean;
    captureResponseBody?: boolean;
    skipIf?: (req: Request) => boolean;
}
/**
 * Crea middleware de auditoría para endpoints específicos
 */
export declare const auditMiddleware: (config: AuditConfig) => (req: Request & {
    user?: {
        id: string;
    };
}, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware preconfigurado para operaciones CRUD comunes
 */
export declare const auditPresets: {
    userCreated: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    userUpdated: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    userDeleted: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    dataRecordCreated: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    dataRecordUpdated: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    dataRecordDeleted: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    dataRecordViewed: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    reportCreated: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    reportUpdated: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    reportDeleted: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    reportGenerated: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    userLogin: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
    userLogout: (req: Request & {
        user?: {
            id: string;
        };
    }, res: Response, next: NextFunction) => Promise<void>;
};
/**
 * Middleware para capturar intentos de acceso no autorizado
 */
export declare const auditUnauthorizedAccess: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Middleware para capturar actividad sospechosa
 */
export declare const auditSuspiciousActivity: (reason: string, additionalData?: Record<string, unknown>) => (req: Request & {
    user?: {
        id: string;
    };
}, _res: Response, next: NextFunction) => void;
export {};
