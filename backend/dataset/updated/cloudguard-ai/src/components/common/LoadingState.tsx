import React from 'react';

interface LoadingStateProps {
  message?: string;
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading telemetry metrics & incident state...',
  count = 3,
}) => {
  return (
    <div className="w-full space-y-4 py-6">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        <span>{message}</span>
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="h-16 w-full bg-slate-200/60 rounded-lg animate-pulse border border-slate-200"
          />
        ))}
      </div>
    </div>
  );
};
