import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface EnhancedToastProps {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export const useEnhancedToast = () => {
  const { toast } = useToast();

  const showToast = ({ title, description, type = 'info', duration = 5000 }: EnhancedToastProps) => {
    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'error':
          return <XCircle className="h-4 w-4 text-red-600" />;
        case 'warning':
          return <AlertCircle className="h-4 w-4 text-yellow-600" />;
        case 'info':
        default:
          return <Info className="h-4 w-4 text-blue-600" />;
      }
    };

    const getVariant = () => {
      return type === 'error' ? 'destructive' : 'default';
    };

    toast({
      title,
      description: description ? (
        <div className="flex items-center gap-2">
          {getIcon()}
          <span>{description}</span>
        </div>
      ) : undefined,
      variant: getVariant(),
      duration,
    });
  };

  return {
    success: (title: string, description?: string) => 
      showToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) => 
      showToast({ title, description, type: 'error' }),
    warning: (title: string, description?: string) => 
      showToast({ title, description, type: 'warning' }),
    info: (title: string, description?: string) => 
      showToast({ title, description, type: 'info' }),
    showToast,
  };
};