"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const health_routes_1 = __importDefault(require("./health.routes"));
const data_record_routes_1 = __importDefault(require("./data-record.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const notification_routes_1 = require("./notification.routes");
const report_routes_1 = __importDefault(require("./report.routes"));
const system_config_routes_1 = __importDefault(require("./system-config.routes"));
const external_api_routes_1 = __importDefault(require("./external-api.routes"));
const audit_routes_1 = __importDefault(require("./audit.routes"));
const debug_routes_1 = __importDefault(require("./debug.routes"));
/**
 * Configura todas las rutas de la aplicación
 * Responsabilidad: Configuración centralizada de rutas
 */
const setupRoutes = (app) => {
    // Basic API info route
    app.get('/api', (_req, res) => {
        res.json({
            message: 'Welcome to Sistema de Gestión #040 API',
            version: '1.0.0',
            endpoints: {
                health: '/health',
                auth: '/api/auth',
                users: '/api/users',
                dataRecords: '/api/data-records',
                dashboard: '/api/dashboard',
                notifications: '/api/notifications',
                reports: '/api/reports',
                systemConfig: '/api/system-config',
                externalApi: '/api/external-api',
                audit: '/api/audit',
                debug: '/api/debug',
            },
        });
    });
    // Health check routes
    app.use('/health', health_routes_1.default);
    // API routes
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/users', user_routes_1.default);
    app.use('/api/data-records', data_record_routes_1.default);
    app.use('/api/dashboard', dashboard_routes_1.default);
    app.use('/api/notifications', notification_routes_1.notificationRoutes);
    app.use('/api/reports', report_routes_1.default);
    app.use('/api/system-config', system_config_routes_1.default);
    app.use('/api/external-api', external_api_routes_1.default);
    app.use('/api/audit', audit_routes_1.default);
    app.use('/api/debug', debug_routes_1.default);
};
exports.setupRoutes = setupRoutes;
