import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'healthy';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  variant = 'default',
}) => {
  let borderStyle = 'border-slate-200';
  let iconBg = 'bg-slate-100 text-slate-600';

  if (variant === 'critical') {
    borderStyle = 'border-rose-200 bg-rose-50/30';
    iconBg = 'bg-rose-100 text-rose-600';
  } else if (variant === 'warning') {
    borderStyle = 'border-amber-200 bg-amber-50/30';
    iconBg = 'bg-amber-100 text-amber-600';
  } else if (variant === 'healthy') {
    borderStyle = 'border-emerald-200 bg-emerald-50/30';
    iconBg = 'bg-emerald-100 text-emerald-600';
  }

  return (
    <div className={`bg-white rounded-lg border p-4 shadow-xs transition-shadow hover:shadow-md ${borderStyle}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-md ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {change && (
          <span
            className={`text-xs font-semibold ${
              changeType === 'positive'
                ? 'text-emerald-600'
                : changeType === 'negative'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 truncate">{subtitle}</p>}
    </div>
  );
};
