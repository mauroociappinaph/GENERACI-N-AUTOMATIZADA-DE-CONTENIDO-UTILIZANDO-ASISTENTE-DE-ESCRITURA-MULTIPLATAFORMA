"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const routes_1 = require("../routes");
/**
 * Crea y configura la aplicación Express
 * Responsabilidad: Configuración de la aplicación Express
 */
const createApp = () => {
    const app = (0, express_1.default)();
    // Setup middleware
    (0, middleware_1.setupMiddleware)(app);
    // Setup routes
    (0, routes_1.setupRoutes)(app);
    return app;
};
exports.createApp = createApp;
