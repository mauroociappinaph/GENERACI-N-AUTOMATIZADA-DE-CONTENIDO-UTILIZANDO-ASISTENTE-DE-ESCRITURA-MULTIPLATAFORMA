import toastLib from 'react-hot-toast';

export const useToast = () => {
  return {
    toast: (options: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => {
      if (options.variant === 'destructive') {
        toastLib.error(options.description || options.title || 'Error');
      } else {
        toastLib.success(options.description || options.title || 'Success');
      }
    },
  };
};

export const toast = (options: {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}) => {
  if (options.variant === 'destructive') {
    toastLib.error(options.description || options.title || 'Error');
  } else {
    toastLib.success(options.description || options.title || 'Success');
  }
};
