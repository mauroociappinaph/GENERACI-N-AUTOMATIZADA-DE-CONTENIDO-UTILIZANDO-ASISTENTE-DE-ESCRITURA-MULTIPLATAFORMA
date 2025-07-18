'use client';

import { ProtectedPage } from '@/components/auth/protected-page';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';
import { useState } from 'react';
// Button import removed as it's not used

type DashboardView = 'analytics' | 'widgets' | 'overview';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<DashboardView>('analytics');

  const views = [
    { id: 'analytics' as DashboardView, label: 'Analytics', icon: '📊' },
    { id: 'widgets' as DashboardView, label: 'Widgets', icon: '🔧' },
    { id: 'overview' as DashboardView, label: 'Resumen', icon: '📋' },
  ];

  const renderContent = () => {
    switch (activeView) {
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
      case 'overview':
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">Vista de Resumen</h3>
            <p className="text-gray-600">Resumen ejecutivo próximamente</p>
          </div>
        );
      default:
        return <AnalyticsDashboard />;
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
