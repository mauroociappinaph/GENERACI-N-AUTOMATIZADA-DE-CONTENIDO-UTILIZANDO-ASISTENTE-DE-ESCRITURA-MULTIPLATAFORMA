'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReportHistoryItem {
  id: string;
  templateName: string;
  format: string;
  generatedAt: string;
  generatedBy: string;
  status: 'completed' | 'failed' | 'processing';
  downloadUrl?: string;
  error?: string;
}

export function ReportHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - in a real app, this would come from an API
  const [reports] = useState<ReportHistoryItem[]>([
    {
      id: '1',
      templateName: 'User Activity Report',
      format: 'PDF',
      generatedAt: '2024-01-15T10:30:00Z',
      generatedBy: 'john.doe@example.com',
      status: 'completed',
      downloadUrl: '/api/reports/download/1',
    },
    {
      id: '2',
      templateName: 'Data Records Report',
      format: 'Excel',
      generatedAt: '2024-01-14T15:45:00Z',
      generatedBy: 'jane.smith@example.com',
      status: 'completed',
      downloadUrl: '/api/reports/download/2',
    },
    {
      id: '3',
      templateName: 'Audit Log Report',
      format: 'CSV',
      generatedAt: '2024-01-14T09:15:00Z',
      generatedBy: 'admin@example.com',
      status: 'failed',
      error: 'Database connection timeout',
    },
    {
      id: '4',
      templateName: 'User Activity Report',
      format: 'PDF',
      generatedAt: '2024-01-13T14:20:00Z',
      generatedBy: 'manager@example.com',
      status: 'processing',
    },
  ]);

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs rounded-full font-medium';
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'processing':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleDownload = (report: ReportHistoryItem) => {
    if (report.downloadUrl) {
      // In a real app, this would use the report service
      window.open(report.downloadUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Report History
        </h2>
        <p className="text-gray-600 text-sm">
          View and download previously generated reports
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
            <p className="text-sm">
              {searchTerm || filterStatus !== 'all'
                ? 'No reports match your current filters.'
                : 'No reports have been generated yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map(report => (
            <Card key={report.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {report.templateName}
                    </h3>
                    <span className={getStatusBadge(report.status)}>
                      {report.status.charAt(0).toUpperCase() +
                        report.status.slice(1)}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {report.format}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Generated:</span>
                      <span className="ml-2">
                        {new Date(report.generatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">By:</span>
                      <span className="ml-2">{report.generatedBy}</span>
                    </div>
                  </div>

                  {report.error && (
                    <div className="mt-2 text-sm text-red-600">
                      <span className="font-medium">Error:</span>
                      <span className="ml-2">{report.error}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {report.status === 'completed' && report.downloadUrl && (
                    <Button
                      onClick={() => handleDownload(report)}
                      variant="outline"
                      size="sm"
                    >
                      Download
                    </Button>
                  )}
                  {report.status === 'processing' && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                      <span>Processing...</span>
                    </div>
                  )}
                  {report.status === 'failed' && (
                    <Button
                      onClick={() => {
                        // In a real app, this would retry the report generation
                        console.log('Retry report generation for:', report.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination would go here in a real app */}
      {filteredReports.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredReports.length} reports</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
