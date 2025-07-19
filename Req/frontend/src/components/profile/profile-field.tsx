import { Input } from '@/components/ui/input';

interface ProfileFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email';
}

export const ProfileField = ({
  label,
  value,
  isEditing,
  onChange,
  placeholder,
  type = 'text',
}: ProfileFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {isEditing ? (
        <Input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{value}</p>
      )}
    </div>
  );
};
