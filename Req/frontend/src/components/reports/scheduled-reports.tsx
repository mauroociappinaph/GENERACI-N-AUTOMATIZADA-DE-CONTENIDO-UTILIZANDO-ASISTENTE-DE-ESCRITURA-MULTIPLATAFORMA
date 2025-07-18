'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportTemplate, ScheduledReport } from '@/types';
import { reportService } from '@/lib/report-service';
import { ScheduledReportWizard } from './scheduled-report-wizard';

interface ScheduledReportsProps {
  templates: ReportTemplate[];
}

export function ScheduledReports({ templates }: ScheduledReportsProps) {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(
    null
  );

  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getScheduledReports();
      setScheduledReports(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load scheduled reports'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) {
      return;
    }

    try {
      await reportService.deleteScheduledReport(id);
      setScheduledReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete scheduled report'
      );
    }
  };

  const handleToggleActive = async (report: ScheduledReport) => {
    try {
      const updateData = {
        templateId: report.templateId,
        parameters: report.parameters,
        format: report.format,
        schedule: report.schedule,
        recipients: report.recipients,
        isActive: !report.isActive,
      };
      await reportService.updateScheduledReport(
        report.id,
        updateData as unknown
      );
      setScheduledReports(prev =>
        prev.map(r =>
          r.id === report.id ? { ...r, isActive: !r.isActive } : r
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update scheduled report'
      );
    }
  };

  const formatSchedule = (schedule: string): string => {
    return reportService.describeCronExpression(schedule);
  };

  const formatNextRun = (nextRun?: string): string => {
    if (!nextRun) return 'Not scheduled';
    const date = new Date(nextRun);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading scheduled reports...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Scheduled Reports
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage automated report generation and delivery
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          Create Scheduled Report
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                onClick={loadScheduledReports}
                variant="outline"
                size="sm"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Scheduled Reports List */}
      {scheduledReports.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium mb-2">No Scheduled Reports</h3>
            <p className="text-sm mb-4">
              Create your first scheduled report to automate report generation
              and delivery.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Scheduled Report
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {scheduledReports.map(report => (
            <Card key={report.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {report.templateName}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        report.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {report.format.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Schedule:</span>
                      <span className="ml-2">
                        {formatSchedule(report.schedule)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span>
                      <span className="ml-2">
                        {formatNextRun(report.nextRun)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Recipients:</span>
                      <span className="ml-2">
                        {report.recipients.length} recipient(s)
                      </span>
                    </div>
                  </div>

                  {report.lastRun && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Last Run:</span>
                      <span className="ml-2">
                        {new Date(report.lastRun).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {report.recipients.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">
                        Recipients:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {report.recipients.map((email, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    onClick={() => handleToggleActive(report)}
                    variant="outline"
                    size="sm"
                  >
                    {report.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    onClick={() => setEditingReport(report)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(report.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingReport) && (
        <ScheduledReportWizard
          templates={templates}
          editingReport={editingReport}
          onClose={() => {
            setShowCreateForm(false);
            setEditingReport(null);
          }}
          onSave={() => {
            setShowCreateForm(false);
            setEditingReport(null);
            loadScheduledReports();
          }}
        />
      )}
    </div>
  );
}
