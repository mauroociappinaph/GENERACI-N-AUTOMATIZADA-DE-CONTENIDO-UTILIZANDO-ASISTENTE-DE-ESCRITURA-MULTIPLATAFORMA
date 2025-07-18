import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataRecord } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface VersionHistoryProps {
  history: DataRecord[];
  showHistory: boolean;
  isLoadingHistory: boolean;
  onToggleHistory: () => void;
}

function formatDate(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return dateString;
  }
}

export function VersionHistory({
  history,
  showHistory,
  isLoadingHistory,
  onToggleHistory,
}: VersionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Historial</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleHistory}
            isLoading={isLoadingHistory}
          >
            {showHistory ? 'Ocultar' : 'Ver'} Historial
          </Button>
        </div>
      </CardHeader>
      {showHistory && (
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((historyRecord, index) => (
                <div
                  key={index}
                  className="border-l-2 border-blue-200 pl-4"
                >
                  <div className="text-sm font-medium text-gray-900">
                    Versión {historyRecord.metadata?.version || index + 1}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(historyRecord.updatedAt)}
                  </div>
                  <div className="text-xs text-gray-500">
                    por {historyRecord.updatedBy}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay historial disponible
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
