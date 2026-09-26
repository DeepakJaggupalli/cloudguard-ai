import React from 'react';
import { CheckCircle2, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No active incidents',
  description = 'All telemetry signals within baseline thresholds. System operating normally.',
  icon: Icon = CheckCircle2,
  action,
}) => {
  return (
    <div className="bg-white border border-slate-200 border-dashed rounded-lg p-8 text-center my-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
