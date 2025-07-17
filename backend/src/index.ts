import 'tsconfig-paths/register';
import { createApp, Server } from './server';

/**
 * Punto de entrada principal de la aplicación
 * Responsabilidad: Inicialización y arranque del sistema
 */
async function main(): Promise<void> {
  try {
    // Create Express application
    const app = createApp();

    // Create and start server
    const server = new Server(app);
    await server.start();
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the application
main();

// Export app for testing purposes
export { createApp };
