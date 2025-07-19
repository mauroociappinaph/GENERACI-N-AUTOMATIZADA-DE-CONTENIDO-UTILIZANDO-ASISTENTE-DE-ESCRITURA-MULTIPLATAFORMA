import { Button } from '@/components/ui/button';
import { ReportTemplate } from '@/types';

interface ReportPreviewHeaderProps {
  template: ReportTemplate;
  onClose: () => void;
}

export function ReportPreviewHeader({ template, onClose }: ReportPreviewHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Report Preview</h2>
        <p className="text-sm text-gray-600 mt-1">{template.name}</p>
      </div>
      <Button onClick={onClose} variant="outline" size="sm">
        Close
      </Button>
    </div>
  );
}
