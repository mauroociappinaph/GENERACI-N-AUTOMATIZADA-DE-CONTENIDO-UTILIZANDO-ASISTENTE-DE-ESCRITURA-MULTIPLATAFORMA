import { ReactNode } from 'react';
import { Button } from './button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface AlertDialogContentProps {
  children: ReactNode;
}

interface AlertDialogHeaderProps {
  children: ReactNode;
}

interface AlertDialogTitleProps {
  children: ReactNode;
}

interface AlertDialogDescriptionProps {
  children: ReactNode;
}

interface AlertDialogFooterProps {
  children: ReactNode;
}

interface AlertDialogActionProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'default' | 'destructive';
}

interface AlertDialogCancelProps {
  onClick: () => void;
  children: ReactNode;
}

export function AlertDialog({
  open,
  onOpenChange,
  children,
}: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
}

export function AlertDialogContent({ children }: AlertDialogContentProps) {
  return <div className="p-6">{children}</div>;
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function AlertDialogDescription({
  children,
}: AlertDialogDescriptionProps) {
  return <p className="text-sm text-gray-600 mt-2">{children}</p>;
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div className="flex justify-end space-x-2 mt-6">{children}</div>;
}

export function AlertDialogAction({
  onClick,
  children,
  variant = 'default',
}: AlertDialogActionProps) {
  return (
    <Button
      onClick={onClick}
      variant={variant === 'destructive' ? 'danger' : 'primary'}
    >
      {children}
    </Button>
  );
}

export function AlertDialogCancel({
  onClick,
  children,
}: AlertDialogCancelProps) {
  return (
    <Button onClick={onClick} variant="outline">
      {children}
    </Button>
  );
}
