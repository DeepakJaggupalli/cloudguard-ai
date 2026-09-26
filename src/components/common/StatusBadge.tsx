import React from 'react';
import { HealthStatus, IncidentStatus, RemediationStatus } from '../../types';
import { getHealthBadgeClasses } from '../../utils/formatters';

interface StatusBadgeProps {
  status: HealthStatus | IncidentStatus | RemediationStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';

  if (['healthy', 'resolved', 'completed', 'active_model', 'success'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotClass = 'bg-emerald-500';
  } else if (['warning', 'investigating', 'running', 'queued', 'pending'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotClass = 'bg-amber-500 animate-pulse';
  } else if (['critical', 'active', 'failed', 'offline'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotClass = 'bg-rose-500 animate-ping';
  } else if (['remediating', 'training'].includes(normalized)) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
    dotClass = 'bg-sky-500 animate-pulse';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
};
