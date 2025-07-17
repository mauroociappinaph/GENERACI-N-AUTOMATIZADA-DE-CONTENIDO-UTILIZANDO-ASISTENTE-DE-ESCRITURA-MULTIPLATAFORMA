import { Application } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../config';

/**
 * Configura todos los middlewares de la aplicación
 * Responsabilidad: Configuración centralizada de middlewares
 */
export const setupMiddleware = (app: Application): void => {
  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors(config.cors));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
