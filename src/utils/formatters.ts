import { HealthStatus, Priority, Severity } from '../types';

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
};

export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const getHealthBadgeClasses = (health: HealthStatus): string => {
  switch (health) {
    case 'healthy':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'critical':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'offline':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const getPriorityBadgeClasses = (priority: Priority): string => {
  switch (priority) {
    case 'P1':
      return 'bg-rose-600 text-white font-semibold shadow-xs';
    case 'P2':
      return 'bg-orange-500 text-white font-medium';
    case 'P3':
      return 'bg-amber-500 text-white font-medium';
    case 'P4':
      return 'bg-slate-500 text-white font-medium';
  }
};

export const getSeverityBadgeClasses = (severity: Severity): string => {
  switch (severity) {
    case 'critical':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-sky-50 text-sky-700 border-sky-200';
  }
};

export const formatPercent = (val: number): string => `${val.toFixed(1)}%`;
export const formatMs = (val: number): string => `${Math.round(val)}ms`;
