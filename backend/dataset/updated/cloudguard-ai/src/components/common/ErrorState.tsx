import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load data',
  message = 'Failed to fetch resource from API service layer. Please check backend connection.',
  onRetry,
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 my-4 text-center">
      <div className="mx-auto w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-base font-semibold text-rose-900">{title}</h4>
      <p className="mt-1 text-sm text-rose-700 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-rose-800 bg-white border border-rose-300 rounded-md hover:bg-rose-100 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
};
