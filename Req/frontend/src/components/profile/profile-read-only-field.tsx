import { ReactNode } from 'react';

interface ProfileReadOnlyFieldProps {
  label: string;
  children: ReactNode;
}

export const ProfileReadOnlyField = ({
  label,
  children,
}: ProfileReadOnlyFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
        {children}
      </div>
    </div>
  );
};
