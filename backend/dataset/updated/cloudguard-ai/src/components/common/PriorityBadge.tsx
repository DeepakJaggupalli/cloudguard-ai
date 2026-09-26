import React from 'react';
import { Priority } from '../../types';
import { getPriorityBadgeClasses } from '../../utils/formatters';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const badgeStyle = getPriorityBadgeClasses(priority);
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs font-bold';

  return (
    <span className={`inline-flex items-center justify-center rounded-xs tracking-wide uppercase ${badgeStyle} ${sizeClasses}`}>
      {priority}
    </span>
  );
};
