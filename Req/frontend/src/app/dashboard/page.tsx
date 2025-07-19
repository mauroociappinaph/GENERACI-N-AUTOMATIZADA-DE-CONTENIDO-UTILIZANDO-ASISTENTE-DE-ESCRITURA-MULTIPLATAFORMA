'use client';

import { ProtectedPage } from '@/components/auth/protected-page';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';
import { useState } from 'react';
// Button import removed as it's not used

type DashboardView = 'analytics' | 'widgets' | 'overview';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  const views = [
    { id: 'overview' as DashboardView, label: 'Resumen', icon: '📋' },
    { id: 'analytics' as DashboardView, label: 'Analytics', icon: '📊' },
    { id: 'widgets' as DashboardView, label: 'Widgets', icon: '🔧' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registros</p>
                  <p className="text-2xl font-bold text-gray-900">5,678</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reportes</p>
                  <p className="text-2xl font-bold text-gray-900">91</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sistema</p>
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'widgets':
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-lg font-medium mb-2">Vista de Widgets</h3>
            <p className="text-gray-600">
              Configuración de widgets personalizable próximamente
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">Dashboard</h3>
            <p className="text-gray-600">Bienvenido al sistema de gestión</p>
          </div>
        );
    }
  };

  return (
    <ProtectedPage>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Panel de control con visualización de datos y métricas
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    activeView === view.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span>{view.icon}</span>
                <span>{view.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </ProtectedPage>
  );
}
