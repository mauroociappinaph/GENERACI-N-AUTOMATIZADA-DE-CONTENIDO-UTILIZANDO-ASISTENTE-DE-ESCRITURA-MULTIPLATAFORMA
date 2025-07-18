import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemConfig } from '@/hooks/use-system-config';

export function SystemConfigForm() {
  const { config, loading, error, fetchSystemConfig, updateSystemConfig } =
    useSystemConfig();
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    allowRegistration: true,
    maxFileUploadSize: 10,
    sessionTimeout: 60,
    emailNotifications: true,
    backupRetentionDays: 30,
    logLevel: 'info' as 'error' | 'warn' | 'info' | 'debug',
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requirePasswordComplexity: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemConfig();
  }, [fetchSystemConfig]);

  useEffect(() => {
    if (config) {
      setFormData({
        siteName: config.siteName || '',
        siteDescription: config.siteDescription || '',
        maintenanceMode: config.maintenanceMode || false,
        allowRegistration: config.allowRegistration ?? true,
        maxFileUploadSize: config.maxFileUploadSize || 10,
        sessionTimeout: config.sessionTimeout || 60,
        emailNotifications: config.emailNotifications ?? true,
        backupRetentionDays: config.backupRetentionDays || 30,
        logLevel: config.logLevel || 'info',
        maxLoginAttempts: config.maxLoginAttempts || 5,
        passwordMinLength: config.passwordMinLength || 8,
        requirePasswordComplexity: config.requirePasswordComplexity ?? true,
      });
    }
  }, [config]);

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaveMessage(null);
      await updateSystemConfig(formData);
      setSaveMessage('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {saveMessage}
        </div>
      )}

      {/* Configuración General */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Configuración General
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="siteName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Sitio
            </label>
            <Input
              id="siteName"
              type="text"
              value={formData.siteName}
              onChange={e => handleInputChange('siteName', e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="siteDescription"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción del Sitio
            </label>
            <Input
              id="siteDescription"
              type="text"
              value={formData.siteDescription}
              onChange={e =>
                handleInputChange('siteDescription', e.target.value)
              }
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="maintenanceMode"
              type="checkbox"
              checked={formData.maintenanceMode}
              onChange={e =>
                handleInputChange('maintenanceMode', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="maintenanceMode"
              className="ml-2 block text-sm text-gray-900"
            >
              Modo de Mantenimiento
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="allowRegistration"
              type="checkbox"
              checked={formData.allowRegistration}
              onChange={e =>
                handleInputChange('allowRegistration', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="allowRegistration"
              className="ml-2 block text-sm text-gray-900"
            >
              Permitir Registro de Usuarios
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="emailNotifications"
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={e =>
                handleInputChange('emailNotifications', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="emailNotifications"
              className="ml-2 block text-sm text-gray-900"
            >
              Notificaciones por Email
            </label>
          </div>
        </div>
      </div>

      {/* Configuración de Archivos y Sesiones */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Archivos y Sesiones
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="maxFileUploadSize"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tamaño Máximo de Archivo (MB)
            </label>
            <Input
              id="maxFileUploadSize"
              type="number"
              min="1"
              max="100"
              value={formData.maxFileUploadSize}
              onChange={e =>
                handleInputChange('maxFileUploadSize', parseInt(e.target.value))
              }
              required
            />
          </div>

          <div>
            <label
              htmlFor="sessionTimeout"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tiempo de Sesión (minutos)
            </label>
            <Input
              id="sessionTimeout"
              type="number"
              min="5"
              max="1440"
              value={formData.sessionTimeout}
              onChange={e =>
                handleInputChange('sessionTimeout', parseInt(e.target.value))
              }
              required
            />
          </div>

          <div>
            <label
              htmlFor="backupRetentionDays"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Retención de Respaldos (días)
            </label>
            <Input
              id="backupRetentionDays"
              type="number"
              min="1"
              max="365"
              value={formData.backupRetentionDays}
              onChange={e =>
                handleInputChange(
                  'backupRetentionDays',
                  parseInt(e.target.value)
                )
              }
              required
            />
          </div>
        </div>
      </div>

      {/* Configuración de Seguridad */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Seguridad</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="maxLoginAttempts"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Máximo Intentos de Login
            </label>
            <Input
              id="maxLoginAttempts"
              type="number"
              min="1"
              max="10"
              value={formData.maxLoginAttempts}
              onChange={e =>
                handleInputChange('maxLoginAttempts', parseInt(e.target.value))
              }
              required
            />
          </div>

          <div>
            <label
              htmlFor="passwordMinLength"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Longitud Mínima de Contraseña
            </label>
            <Input
              id="passwordMinLength"
              type="number"
              min="6"
              max="50"
              value={formData.passwordMinLength}
              onChange={e =>
                handleInputChange('passwordMinLength', parseInt(e.target.value))
              }
              required
            />
          </div>

          <div>
            <label
              htmlFor="logLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nivel de Logs
            </label>
            <select
              id="logLevel"
              value={formData.logLevel}
              onChange={e => handleInputChange('logLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="requirePasswordComplexity"
            type="checkbox"
            checked={formData.requirePasswordComplexity}
            onChange={e =>
              handleInputChange('requirePasswordComplexity', e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="requirePasswordComplexity"
            className="ml-2 block text-sm text-gray-900"
          >
            Requerir Complejidad en Contraseñas
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
