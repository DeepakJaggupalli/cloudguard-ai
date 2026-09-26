import React from 'react';
import { Severity } from '../../types';
import { getSeverityBadgeClasses } from '../../utils/formatters';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const badgeStyle = getSeverityBadgeClasses(severity);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border uppercase tracking-wider ${badgeStyle} ${sizeClasses}`}>
      {severity}
    </span>
  );
};
