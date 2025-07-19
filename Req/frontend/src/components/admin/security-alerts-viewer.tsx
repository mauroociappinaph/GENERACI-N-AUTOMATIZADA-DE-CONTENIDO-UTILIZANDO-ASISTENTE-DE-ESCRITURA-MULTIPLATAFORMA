'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

/**
 * Security Alerts Viewer Component
 * Responsabilidad: Visualización de alertas de seguridad y métricas
 */

interface SecurityAlert {
  id: string;
  alertType: string;
  details: Record<string, unknown>;
  createdAt: string;
  ipAddress: string | null;
}

interface SecurityMetrics {
  failedLoginsLast24h: number;
  suspiciousActivitiesLast24h: number;
  blockedIPsCount: number;
  activeAlertsCount: number;
  topSuspiciousIPs: Array<{ ip: string; count: number }>;
  recentSecurityEvents: Array<{
    action: string;
    count: number;
    lastOccurrence: string;
  }>;
}

interface SecurityAlertsResponse {
  success: boolean;
  data: SecurityAlert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function SecurityAlertsViewer() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(
    null
  );
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const { toast } = useToast();

  const fetchSecurityAlerts = async (page = 1) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(dateFilter.startDate && { startDate: dateFilter.startDate }),
        ...(dateFilter.endDate && { endDate: dateFilter.endDate }),
      });

      const response = await fetch(
        `/api/audit/security-alerts?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch security alerts');
      }

      const data: SecurityAlertsResponse = await response.json();

      if (data.success) {
        setAlerts(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch security alerts');
      }
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security alerts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityMetrics = async () => {
    try {
      setMetricsLoading(true);

      const response = await fetch('/api/audit/security-metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch security metrics');
      }

      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
      } else {
        throw new Error('Failed to fetch security metrics');
      }
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security metrics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityAlerts();
    fetchSecurityMetrics();

    // Auto-refresh metrics every 30 seconds
    const interval = setInterval(fetchSecurityMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getAlertSeverity = (alertType: string) => {
    if (
      alertType.includes('MULTIPLE_FAILED_LOGINS') ||
      alertType.includes('PRIVILEGE_ESCALATION')
    ) {
      return { color: 'text-red-600', bg: 'bg-red-100', severity: 'Critical' };
    }
    if (alertType.includes('SUSPICIOUS') || alertType.includes('EXCESSIVE')) {
      return {
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        severity: 'High',
      };
    }
    return {
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      severity: 'Medium',
    };
  };

  const applyDateFilter = () => {
    fetchSecurityAlerts(1);
  };

  const clearDateFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
    fetchSecurityAlerts(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security Dashboard</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchSecurityMetrics()}
            disabled={metricsLoading}
          >
            {metricsLoading ? 'Loading...' : 'Refresh Metrics'}
          </Button>
          <Button
            onClick={() => fetchSecurityAlerts(pagination.page)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Alerts'}
          </Button>
        </div>
      </div>

      {/* Security Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Failed Logins (24h)
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.failedLoginsLast24h}
                </p>
              </div>
              <div className="text-3xl">🚫</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Suspicious Activities (24h)
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.suspiciousActivitiesLast24h}
                </p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {metrics.activeAlertsCount}
                </p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                <p className="text-2xl font-bold text-gray-600">
                  {metrics.blockedIPsCount}
                </p>
              </div>
              <div className="text-3xl">🛡️</div>
            </div>
          </Card>
        </div>
      )}

      {/* Top Suspicious IPs and Recent Events */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Top Suspicious IPs</h3>
            <div className="space-y-2">
              {metrics.topSuspiciousIPs.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No suspicious IPs detected
                </p>
              ) : (
                metrics.topSuspiciousIPs.map((ip, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="font-mono text-sm">{ip.ip}</span>
                    <span className="text-sm text-red-600 font-medium">
                      {ip.count} events
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Recent Security Events
            </h3>
            <div className="space-y-2">
              {metrics.recentSecurityEvents.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No recent security events
                </p>
              ) : (
                metrics.recentSecurityEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {event.action}
                      </span>
                      <p className="text-xs text-gray-500">
                        Last: {formatDate(event.lastOccurrence)}
                      </p>
                    </div>
                    <span className="text-sm text-orange-600 font-medium">
                      {event.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Date Filter */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Filter Alerts</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="datetime-local"
              value={dateFilter.startDate}
              onChange={e =>
                setDateFilter(prev => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="datetime-local"
              value={dateFilter.endDate}
              onChange={e =>
                setDateFilter(prev => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
          <Button onClick={applyDateFilter}>Apply Filter</Button>
          <Button variant="outline" onClick={clearDateFilter}>
            Clear
          </Button>
        </div>
      </Card>

      {/* Security Alerts Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Security Alerts</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Timestamp</th>
                <th className="text-left p-2">Alert Type</th>
                <th className="text-left p-2">Severity</th>
                <th className="text-left p-2">IP Address</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Loading security alerts...</p>
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">
                    No security alerts found
                  </td>
                </tr>
              ) : (
                alerts.map(alert => {
                  const severity = getAlertSeverity(alert.alertType);
                  return (
                    <tr key={alert.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-sm">
                        {formatDate(alert.createdAt)}
                      </td>
                      <td className="p-2">
                        <span className="text-sm font-medium">
                          {alert.alertType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${severity.color} ${severity.bg}`}
                        >
                          {severity.severity}
                        </span>
                      </td>
                      <td className="p-2 text-sm font-mono">
                        {alert.ipAddress || 'N/A'}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
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
              of {pagination.total} alerts
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => fetchSecurityAlerts(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => fetchSecurityAlerts(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Security Alert Details</h3>
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timestamp
                  </label>
                  <p className="text-sm">
                    {formatDate(selectedAlert.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alert Type
                  </label>
                  <p className="text-sm font-medium">
                    {selectedAlert.alertType.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IP Address
                  </label>
                  <p className="text-sm font-mono">
                    {selectedAlert.ipAddress || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Severity
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertSeverity(selectedAlert.alertType).color} ${getAlertSeverity(selectedAlert.alertType).bg}`}
                  >
                    {getAlertSeverity(selectedAlert.alertType).severity}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Details
                </label>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedAlert.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
