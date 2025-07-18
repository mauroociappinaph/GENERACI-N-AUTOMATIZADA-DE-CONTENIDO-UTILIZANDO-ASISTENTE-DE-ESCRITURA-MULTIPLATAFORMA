'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportGenerator } from '@/components/reports/report-generator';
import { ReportConfigurationPage } from '@/components/reports/report-configuration-page';
import { ScheduledReports } from '@/components/reports/scheduled-reports';
import { ReportHistory } from '@/components/reports/report-history';
import { ProtectedPage } from '@/components/auth/protected-page';
import { ReportTemplate } from '@/types';
import { reportService } from '@/lib/report-service';

type TabType = 'generate' | 'configure' | 'scheduled' | 'history';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReportTemplates();
      setTemplates(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load report templates'
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'generate' as TabType, label: 'Generate Reports', icon: '📊' },
    { id: 'configure' as TabType, label: 'Configure Reports', icon: '⚙️' },
    { id: 'scheduled' as TabType, label: 'Scheduled Reports', icon: '⏰' },
    { id: 'history' as TabType, label: 'Report History', icon: '📋' },
  ];

  return (
    <ProtectedPage>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">
            Generate, schedule, and manage your reports
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 p-4 border-red-200 bg-red-50">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">
                  Error loading reports
                </p>
                <p className="text-red-600 text-sm">{error}</p>
                <Button
                  onClick={loadTemplates}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading reports...</span>
            </div>
          </Card>
        )}

        {/* Tab Content */}
        {!loading && !error && (
          <>
            {activeTab === 'generate' && (
              <ReportGenerator
                templates={templates}
                onRefresh={loadTemplates}
              />
            )}
            {activeTab === 'configure' && (
              <ReportConfigurationPage templates={templates} />
            )}
            {activeTab === 'scheduled' && (
              <ScheduledReports templates={templates} />
            )}
            {activeTab === 'history' && <ReportHistory />}
          </>
        )}
      </div>
    </ProtectedPage>
  );
}
