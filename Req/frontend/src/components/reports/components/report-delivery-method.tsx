import { Input } from '@/components/ui/input';

interface ReportDeliveryMethodProps {
  deliveryMethod: 'download' | 'email';
  email?: string;
  emailError?: string;
  onDeliveryMethodChange: (method: 'download' | 'email') => void;
  onEmailChange: (email: string) => void;
}

export function ReportDeliveryMethod({
  deliveryMethod,
  email,
  emailError,
  onDeliveryMethodChange,
  onEmailChange,
}: ReportDeliveryMethodProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Delivery Method
      </h3>
      <div className="space-y-4">
        <label className="flex items-start space-x-3">
          <input
            type="radio"
            name="delivery"
            value="download"
            checked={deliveryMethod === 'download'}
            onChange={e =>
              onDeliveryMethodChange(e.target.value as 'download' | 'email')
            }
            className="mt-1 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-medium text-gray-900">
              Download immediately
            </span>
            <p className="text-sm text-gray-600">
              The report will be generated and downloaded to your device
            </p>
          </div>
        </label>

        <label className="flex items-start space-x-3">
          <input
            type="radio"
            name="delivery"
            value="email"
            checked={deliveryMethod === 'email'}
            onChange={e =>
              onDeliveryMethodChange(e.target.value as 'download' | 'email')
            }
            className="mt-1 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">Send by email</span>
            <p className="text-sm text-gray-600 mb-2">
              The report will be sent to the specified email address
            </p>
            {deliveryMethod === 'email' && (
              <div>
                <Input
                  type="email"
                  value={email || ''}
                  onChange={e => onEmailChange(e.target.value)}
                  placeholder="Enter email address"
                  className={
                    emailError ? 'border-red-300 focus:ring-red-500' : ''
                  }
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
