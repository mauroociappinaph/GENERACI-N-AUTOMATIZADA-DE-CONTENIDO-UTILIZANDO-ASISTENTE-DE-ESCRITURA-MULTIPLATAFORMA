'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NotificationType } from '@/types';
import { notificationService } from '@/lib/notification-service';
import { useNotifications } from '@/hooks/use-notifications';

export function NotificationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, stats } = useNotifications();

  const sendTestNotification = async (type: NotificationType) => {
    setIsLoading(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = notificationService['getToken'](); // Acceso al método privado para testing

      const testNotifications = {
        [NotificationType.INFO]: {
          title: 'Información de prueba',
          message:
            'Esta es una notificación de información para probar el sistema.',
          data: { testType: 'info', timestamp: new Date().toISOString() },
        },
        [NotificationType.SUCCESS]: {
          title: 'Operación exitosa',
          message: 'La operación se completó correctamente.',
          data: { testType: 'success', timestamp: new Date().toISOString() },
        },
        [NotificationType.WARNING]: {
          title: 'Advertencia del sistema',
          message: 'Se detectó una situación que requiere atención.',
          data: { testType: 'warning', timestamp: new Date().toISOString() },
        },
        [NotificationType.ERROR]: {
          title: 'Error en el sistema',
          message: 'Se produjo un error que necesita ser revisado.',
          data: { testType: 'error', timestamp: new Date().toISOString() },
        },
        [NotificationType.SYSTEM]: {
          title: 'Notificación del sistema',
          message: 'El sistema ha realizado una actualización automática.',
          data: { testType: 'system', timestamp: new Date().toISOString() },
        },
        [NotificationType.USER_ACTION]: {
          title: 'Acción de usuario',
          message: 'Un usuario ha realizado una acción importante.',
          data: {
            testType: 'user_action',
            timestamp: new Date().toISOString(),
          },
        },
        [NotificationType.DATA_UPDATE]: {
          title: 'Actualización de datos',
          message: 'Los datos del sistema han sido actualizados.',
          data: {
            testType: 'data_update',
            timestamp: new Date().toISOString(),
          },
        },
        [NotificationType.REPORT_READY]: {
          title: 'Reporte disponible',
          message: 'Su reporte solicitado está listo para descargar.',
          data: {
            testType: 'report_ready',
            timestamp: new Date().toISOString(),
          },
        },
      };

      const payload = {
        type,
        ...testNotifications[type],
      };

      const response = await fetch(`${backendUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`✅ Test notification sent: ${type}`);
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testWebSocketConnection = () => {
    if (notificationService.isSocketConnected()) {
      console.log('✅ WebSocket is connected');
      // Solicitar notificaciones via WebSocket
      notificationService.requestNotifications({ limit: 5 });
    } else {
      console.log('❌ WebSocket is not connected');
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Panel de Pruebas de Notificaciones
          </h3>
          <p className="text-sm text-gray-600">
            Utiliza este panel para probar el sistema de notificaciones en
            tiempo real.
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-50">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium">
            WebSocket: {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={testWebSocketConnection}
            className="ml-auto"
          >
            Probar Conexión
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-blue-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-blue-800">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.unread}
            </div>
            <div className="text-sm text-red-800">Sin leer</div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            Enviar Notificaciones de Prueba:
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => sendTestNotification(NotificationType.INFO)}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              ℹ️ Información
            </Button>

            <Button
              onClick={() => sendTestNotification(NotificationType.SUCCESS)}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              ✅ Éxito
            </Button>

            <Button
              onClick={() => sendTestNotification(NotificationType.WARNING)}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              ⚠️ Advertencia
            </Button>

            <Button
              onClick={() => sendTestNotification(NotificationType.ERROR)}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              ❌ Error
            </Button>

            <Button
              onClick={() => sendTestNotification(NotificationType.SYSTEM)}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              🔧 Sistema
            </Button>

            <Button
              onClick={() => sendTestNotification(NotificationType.USER_ACTION)}
              disabled={isLoading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              👤 Usuario
            </Button>

            <Button
              onClick={() => sendTestNotification(NotificationType.DATA_UPDATE)}
              disabled={isLoading}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              📝 Datos
            </Button>

            <Button
              onClick={() =>
                sendTestNotification(NotificationType.REPORT_READY)
              }
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              📊 Reporte
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Instrucciones:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Haz clic en cualquier botón para enviar una notificación de
              prueba
            </li>
            <li>
              • Las notificaciones aparecerán como toast en la esquina superior
              derecha
            </li>
            <li>
              • También se mostrarán en el centro de notificaciones (icono de
              campana)
            </li>
            <li>
              • El contador de notificaciones sin leer se actualizará
              automáticamente
            </li>
            <li>
              • Verifica que el WebSocket esté conectado para recibir
              notificaciones en tiempo real
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
