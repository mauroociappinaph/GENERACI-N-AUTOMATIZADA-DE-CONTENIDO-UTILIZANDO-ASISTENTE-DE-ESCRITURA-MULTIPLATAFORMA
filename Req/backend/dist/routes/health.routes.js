"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
/**
 * Health check básico del servidor
 * GET /health
 */
router.get('/', (_req, res) => {
    res.json({
        status: 'OK',
        message: 'Sistema de Gestión #040 API is running',
        timestamp: new Date().toISOString(),
    });
});
/**
 * Health check de la base de datos
 * GET /health/db
 */
router.get('/db', async (_req, res) => {
    try {
        const isConnected = await database_1.database.testConnection();
        res.json({
            status: isConnected ? 'OK' : 'ERROR',
            message: isConnected
                ? 'Database connection successful'
                : 'Database connection failed',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
exports.default = router;
