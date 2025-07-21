import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook para monitorear el rendimiento de componentes React
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(Date.now());
  const mountTime = useRef<number | null>(null);
  const [renderCount, setRenderCount] = useState(0);
  const [averageRenderTime, setAverageRenderTime] = useState(0);
  const renderTimes = useRef<number[]>([]);

  // Medir tiempo de render
  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    renderTimes.current.push(renderTime);

    // Mantener solo los últimos 10 renders para el promedio
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    const avgTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
    setAverageRenderTime(avgTime);
    setRenderCount(prev => prev + 1);

    // Log si el render es lento
    if (renderTime > 16) { // 16ms = 60fps threshold
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
    }

    // Registrar tiempo de montaje en el primer render
    if (mountTime.current === null) {
      mountTime.current = renderTime;
      console.log(`Component ${componentName} mounted in ${renderTime}ms`);
    }
  });

  // Actualizar tiempo de inicio en cada render
  renderStartTime.current = Date.now();

  const getPerformanceStats = useCallback(() => ({
    componentName,
    renderCount,
    averageRenderTime,
    mountTime: mountTime.current,
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
    recentRenderTimes: [...renderTimes.current]
  }), [componentName, renderCount, averageRenderTime]);

  return {
    renderCount,
    averageRenderTime,
    mountTime: mountTime.current,
    getPerformanceStats
  };
}

/**
 * Hook para monitorear operaciones asíncronas
 */
export function useAsyncPerformanceMonitor() {
  const [operations, setOperations] = useState<Map<string, OperationMetrics>>(new Map());

  const startOperation = useCallback((operationName: string): string => {
    const operationId = `${operationName}_${Date.now()}_${Math.random()}`;
    const startTime = performance.now();

    setOperations(prev => new Map(prev).set(operationId, {
      name: operationName,
      startTime,
      status: 'running'
    }));

    return operationId;
  }, []);

  const endOperation = useCallback((operationId: string, success: boolean = true, metadata?: Record<string, any>) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      const operation = newMap.get(operationId);

      if (operation) {
        const endTime = performance.now();
        const duration = endTime - operation.startTime;

        newMap.set(operationId, {
          ...operation,
          endTime,
          duration,
          status: success ? 'completed' : 'failed',
          metadata
        });

        // Log operaciones lentas
        if (duration > 1000) { // 1 segundo
          console.warn(`Slow operation detected: ${operation.name} took ${duration.toFixed(2)}ms`);
        }

        // Limpiar operaciones completadas después de 5 minutos
        setTimeout(() => {
          setOperations(current => {
            const updated = new Map(current);
            updated.delete(operationId);
            return updated;
          });
        }, 5 * 60 * 1000);
      }

      return newMap;
    });
  }, []);

  const getOperationStats = useCallback(() => {
    const ops = Array.from(operations.values());
    const completed = ops.filter(op => op.status === 'completed');
    const failed = ops.filter(op => op.status === 'failed');
    const running = ops.filter(op => op.status === 'running');

    const avgDuration = completed.length > 0
      ? completed.reduce((sum, op) => sum + (op.duration || 0), 0) / completed.length
      : 0;

    return {
      total: ops.length,
      completed: completed.length,
      failed: failed.length,
      running: running.length,
      averageDuration: avgDuration,
      operations: ops
    };
  }, [operations]);

  return {
    startOperation,
    endOperation,
    getOperationStats,
    operations: Array.from(operations.values())
  };
}

/**
 * Hook para monitorear el uso de memoria
 */
export function useMemoryMonitor() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);

  useEffect(() => {
    const updateMemoryStats = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryStats({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }
    };

    // Actualizar estadísticas cada 5 segundos
    const interval = setInterval(updateMemoryStats, 5000);
    updateMemoryStats(); // Actualización inicial

    return () => clearInterval(interval);
  }, []);

  const getMemoryUsagePercentage = useCallback(() => {
    if (!memoryStats) return 0;
    return (memoryStats.usedJSHeapSize / memoryStats.jsHeapSizeLimit) * 100;
  }, [memoryStats]);

  const isMemoryUsageHigh = useCallback(() => {
    return getMemoryUsagePercentage() > 80; // 80% threshold
  }, [getMemoryUsagePercentage]);

  return {
    memoryStats,
    getMemoryUsagePercentage,
    isMemoryUsageHigh
  };
}

/**
 * Hook para monitorear el rendimiento de la red
 */
export function useNetworkMonitor() {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    requests: [],
    totalRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0
  });

  const trackRequest = useCallback((url: string, method: string = 'GET') => {
    const startTime = performance.now();
    const requestId = `${method}_${url}_${Date.now()}`;

    setNetworkStats(prev => ({
      ...prev,
      requests: [...prev.requests.slice(-49), { // Mantener últimas 50 requests
        id: requestId,
        url,
        method,
        startTime,
        status: 'pending'
      }],
      totalRequests: prev.totalRequests + 1
    }));

    return {
      complete: (success: boolean, statusCode?: number, responseSize?: number) => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        setNetworkStats(prev => {
          const updatedRequests = prev.requests.map(req =>
            req.id === requestId
              ? {
                  ...req,
                  endTime,
                  duration,
                  status: success ? 'completed' : 'failed',
                  statusCode,
                  responseSize
                }
              : req
          );

          const completedRequests = updatedRequests.filter(req => req.status === 'completed');
          const avgResponseTime = completedRequests.length > 0
            ? completedRequests.reduce((sum, req) => sum + (req.duration || 0), 0) / completedRequests.length
            : 0;

          return {
            requests: updatedRequests,
            totalRequests: prev.totalRequests,
            failedRequests: success ? prev.failedRequests : prev.failedRequests + 1,
            averageResponseTime: avgResponseTime
          };
        });
      }
    };
  }, []);

  const getNetworkHealth = useCallback(() => {
    const recentRequests = networkStats.requests.slice(-20); // Últimas 20 requests
    const failureRate = recentRequests.length > 0
      ? recentRequests.filter(req => req.status === 'failed').length / recentRequests.length
      : 0;

    return {
      health: failureRate < 0.1 ? 'good' : failureRate < 0.3 ? 'warning' : 'critical',
      failureRate: failureRate * 100,
      averageResponseTime: networkStats.averageResponseTime
    };
  }, [networkStats]);

  return {
    networkStats,
    trackRequest,
    getNetworkHealth
  };
}

// Interfaces
interface OperationMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'completed' | 'failed';
  statusCode?: number;
  responseSize?: number;
}

interface NetworkStats {
  requests: NetworkRequest[];
  totalRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

/**
 * HOC para monitoreo automático de rendimiento
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const MonitoredComponent = (props: P) => {
    const { renderCount, averageRenderTime, getPerformanceStats } = usePerformanceMonitor(displayName);

    // Exponer estadísticas en desarrollo
    if (process.env.NODE_ENV === 'development') {
      (window as any).__PERFORMANCE_STATS = {
        ...(window as any).__PERFORMANCE_STATS,
        [displayName]: getPerformanceStats()
      };
    }

    return <WrappedComponent {...props} />;
  };

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return MonitoredComponent;
}
