'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

/**
 * Audit Logs Viewer Component
 * Responsabilidad: Visualización y filtrado de logs de auditoría
 */

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  oldValues: unknown;
  newValues: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface AuditFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}

export function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const { toast } = useToast();

  const fetchAuditLogs = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(currentFilters).filter(
            ([_, value]) => value && value.trim() !== ''
          )
        ),
      });

      const response = await fetch(`/api/audit/logs?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data: AuditLogsResponse = await response.json();

      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch audit logs');
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    fetchAuditLogs(1, filters);
  };

  const clearFilters = () => {
    setFilters({});
    fetchAuditLogs(1, {});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-red-600';
    if (action.includes('CREATE')) return 'text-green-600';
    if (action.includes('UPDATE')) return 'text-blue-600';
    if (action.includes('LOGIN')) return 'text-purple-600';
    if (action.includes('UNAUTHORIZED') || action.includes('SUSPICIOUS'))
      return 'text-red-800';
    return 'text-gray-600';
  };

  const getResourceTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'USER':
        return '👤';
      case 'DATA_RECORD':
        return '📄';
      case 'REPORT':
        return '📊';
      case 'SYSTEM':
        return '⚙️';
      case 'AUTH':
        return '🔐';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <Button
          onClick={() => fetchAuditLogs(pagination.page)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <Input
              placeholder="User ID"
              value={filters.userId || ''}
              onChange={e => handleFilterChange('userId', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Action</label>
            <Input
              placeholder="Action"
              value={filters.action || ''}
              onChange={e => handleFilterChange('action', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Resource Type
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={filters.resourceType || ''}
              onChange={e => handleFilterChange('resourceType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="USER">User</option>
              <option value="DATA_RECORD">Data Record</option>
              <option value="REPORT">Report</option>
              <option value="SYSTEM">System</option>
              <option value="AUTH">Authentication</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="datetime-local"
              value={filters.startDate || ''}
              onChange={e => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="datetime-local"
              value={filters.endDate || ''}
              onChange={e => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={applyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Timestamp</th>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Resource</th>
                <th className="text-left p-2">IP Address</th>
                <th className="text-left p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Loading audit logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-sm">{formatDate(log.createdAt)}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div className="font-medium">
                          {log.user.firstName} {log.user.lastName}
                        </div>
                        <div className="text-gray-500">{log.user.email}</div>
                        <div className="text-xs text-gray-400">
                          {log.user.role}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <span
                        className={`text-sm font-medium ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span>{getResourceTypeIcon(log.resourceType)}</span>
                        <div className="text-sm">
                          <div>{log.resourceType}</div>
                          {log.resourceId && (
                            <div className="text-xs text-gray-500">
                              ID: {log.resourceId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-sm">{log.ipAddress || 'N/A'}</td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => fetchAuditLogs(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => fetchAuditLogs(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Audit Log Details</h3>
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timestamp
                  </label>
                  <p className="text-sm">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Action
                  </label>
                  <p
                    className={`text-sm font-medium ${getActionColor(selectedLog.action)}`}
                  >
                    {selectedLog.action}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resource Type
                  </label>
                  <p className="text-sm">{selectedLog.resourceType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resource ID
                  </label>
                  <p className="text-sm">{selectedLog.resourceId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IP Address
                  </label>
                  <p className="text-sm">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User Agent
                  </label>
                  <p className="text-sm text-gray-600 break-all">
                    {selectedLog.userAgent || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User
                </label>
                <div className="text-sm">
                  <p>
                    {selectedLog.user.firstName} {selectedLog.user.lastName}
                  </p>
                  <p className="text-gray-600">{selectedLog.user.email}</p>
                  <p className="text-gray-500">Role: {selectedLog.user.role}</p>
                </div>
              </div>

              {selectedLog.oldValues && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Old Values
                  </label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValues && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Values
                  </label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
