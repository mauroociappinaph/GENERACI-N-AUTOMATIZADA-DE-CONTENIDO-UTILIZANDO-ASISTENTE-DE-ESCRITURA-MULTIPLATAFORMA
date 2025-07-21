"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
require("tsconfig-paths/register");
const server_1 = require("./server");
Object.defineProperty(exports, "createApp", { enumerable: true, get: function () { return server_1.createApp; } });
/**
 * Punto de entrada principal de la aplicación
 * Responsabilidad: Inicialización y arranque del sistema
 */
async function main() {
    try {
        // Create Express application
        const app = (0, server_1.createApp)();
        // Create and start server
        const server = new server_1.Server(app);
        await server.start();
    }
    catch (error) {
        console.error('❌ Failed to initialize application:', error);
        process.exit(1);
    }
}
// Start the application
main();
