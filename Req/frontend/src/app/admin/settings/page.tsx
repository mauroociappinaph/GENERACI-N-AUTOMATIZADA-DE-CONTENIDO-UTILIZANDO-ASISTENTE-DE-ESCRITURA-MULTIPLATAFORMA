'use client';

import React, { useState } from 'react';
import { ProtectedPage } from '@/components/auth/protected-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types';
import { SystemConfigForm } from '@/components/admin/system-config-form';
import { DatabaseBackupManager } from '@/components/admin/database-backup-manager';
import { SystemLogsViewer } from '@/components/admin/system-logs-viewer';
import { SystemMetricsDisplay } from '@/components/admin/system-metrics-display';
import { useSystemConfig } from '@/hooks/use-system-config';
import { Loading } from '@/components/ui/loading';

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'config' | 'backups' | 'logs' | 'metrics'
  >('config');
  const { loading, error } = useSystemConfig();

  const tabs = [
    { id: 'config', label: 'Configuración General', icon: '⚙️' },
    { id: 'backups', label: 'Respaldos', icon: '💾' },
    { id: 'logs', label: 'Logs del Sistema', icon: '📋' },
    { id: 'metrics', label: 'Métricas', icon: '📊' },
  ];

  if (loading) {
    return (
      <ProtectedPage
        title="Configuración del Sistema"
        allowedRoles={[UserRole.ADMIN]}
      >
        <Loading />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage
      title="Configuración del Sistema"
      allowedRoles={[UserRole.ADMIN]}
    >
      <div className="space-y-6">
        {/* Navegación por pestañas */}
        <Card>
          <CardContent className="p-0">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as 'config' | 'backups' | 'logs' | 'metrics'
                      )
                    }
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </CardContent>
        </Card>

        {/* Contenido de las pestañas */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {activeTab === 'config' && (
          <Card>
            <CardHeader>
              <CardTitle>Configuración General del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemConfigForm />
            </CardContent>
          </Card>
        )}

        {activeTab === 'backups' && (
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Respaldos</CardTitle>
            </CardHeader>
            <CardContent>
              <DatabaseBackupManager />
            </CardContent>
          </Card>
        )}

        {activeTab === 'logs' && (
          <Card>
            <CardHeader>
              <CardTitle>Logs del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemLogsViewer />
            </CardContent>
          </Card>
        )}

        {activeTab === 'metrics' && (
          <Card>
            <CardHeader>
              <CardTitle>Métricas del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemMetricsDisplay />
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedPage>
  );
}
