import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { z } from 'zod';

// Validation schemas
const WidgetConfigSchema = z.object({
  dataSource: z.string().optional(),
  refreshInterval: z.number().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  chartType: z.enum(['line', 'bar', 'pie', 'doughnut']).optional(),
});

const DashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['metrics', 'chart', 'table', 'activity']),
  title: z.string(),
  config: WidgetConfigSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
});

const SaveWidgetConfigurationSchema = z.object({
  widgets: z.array(DashboardWidgetSchema),
});

const AddWidgetSchema = z.object({
  type: z.enum(['metrics', 'chart', 'table', 'activity']),
  title: z.string(),
  config: WidgetConfigSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
});

export class DashboardController {
  /**
   * Get dashboard metrics
   */
  static async getDashboardMetrics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado',
          },
        });
      }

      const metrics = await dashboardService.getDashboardMetrics(userId);

      res.json({
        success: true,
        data: metrics,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
        },
      });
    }
  }

  /**
   * Get user's dashboard widgets
   */
  static async getUserWidgets(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado',
          },
        });
      }

      const widgets = await dashboardService.getUserWidgets(userId);

      res.json({
        success: true,
        data: widgets,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error fetching user widgets:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
        },
      });
    }
  }

  /**
   * Save user's dashboard widget configuration
   */
  static async saveWidgetConfiguration(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado',
          },
        });
      }

      // Validate request body
      const validation = SaveWidgetConfigurationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: validation.error.issues,
          },
        });
      }

      const { widgets } = validation.data;
      const success = await dashboardService.saveWidgetConfiguration(userId, widgets);

      res.json({
        success,
        data: success,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error saving widget configuration:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
        },
      });
    }
  }

  /**
   * Add a new widget to the dashboard
   */
  static async addWidget(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado',
          },
        });
      }

      // Validate request body
      const validation = AddWidgetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: validation.error.issues,
          },
        });
      }

      const widgetData = validation.data;
      const newWidget = await dashboardService.addWidget(userId, widgetData);

      res.status(201).json({
        success: true,
        data: newWidget,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error adding widget:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
        },
      });
    }
  }

  /**
   * Delete a widget from the dashboard
   */
  static async deleteWidget(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { widgetId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado',
          },
        });
      }

      if (!widgetId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID de widget requerido',
          },
        });
      }

      const success = await dashboardService.deleteWidget(userId, widgetId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Widget no encontrado',
          },
        });
      }

      res.json({
        success: true,
        data: success,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error deleting widget:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
        },
      });
    }
  }

  /**
   * Get data for a specific widget
   */
  static async getWidgetData(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { widgetId } = req.params;
      const { dataSource } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado',
          },
        });
      }

      if (!widgetId || !dataSource) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID de widget y fuente de datos requeridos',
          },
        });
      }

      const data = await dashboardService.getWidgetData(
        userId,
        widgetId,
        dataSource as string
      );

      res.json({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error fetching widget data:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
        },
      });
    }
  }
}
