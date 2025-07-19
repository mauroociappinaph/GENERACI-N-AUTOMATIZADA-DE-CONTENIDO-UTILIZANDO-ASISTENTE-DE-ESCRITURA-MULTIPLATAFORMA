import { ReportTemplate } from '@/types';

interface ReportTemplateHeaderProps {
  template: ReportTemplate;
}

export function ReportTemplateHeader({ template }: ReportTemplateHeaderProps) {
  return (
    <div className="border-b pb-4">
      <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
      {template.description && (
        <p className="text-gray-600 mt-1">{template.description}</p>
      )}
    </div>
  );
}
