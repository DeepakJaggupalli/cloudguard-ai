import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Environment, Priority, Severity, IncidentStatus } from '../../types';

interface FilterState {
  search: string;
  priority: Priority | 'all';
  severity: Severity | 'all';
  status: IncidentStatus | 'all';
  environment: Environment | 'all';
  sortBy: 'newest' | 'oldest' | 'priority' | 'anomalyScore';
}

interface IncidentFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  totalCount: number;
}

export const IncidentFilterBar: React.FC<IncidentFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Filter by Incident ID, VM-204, Payments API, or signal description..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <span className="text-xs text-slate-500 font-medium">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Highest Priority (P1 → P4)</option>
            <option value="anomalyScore">Highest Anomaly Score</option>
          </select>

          <button
            onClick={onReset}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <span className="flex items-center gap-1 font-semibold text-slate-500 mr-1">
          <Filter className="w-3 h-3" /> Filters:
        </span>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value as FilterState['priority'] })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none"
        >
          <option value="all">Priority: All</option>
          <option value="P1">P1 - Critical</option>
          <option value="P2">P2 - High</option>
          <option value="P3">P3 - Medium</option>
          <option value="P4">P4 - Low</option>
        </select>

        {/* Severity Filter */}
        <select
          value={filters.severity}
          onChange={(e) => onFilterChange({ ...filters, severity: e.target.value as FilterState['severity'] })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none"
        >
          <option value="all">Severity: All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as FilterState['status'] })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none"
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="investigating">Investigating</option>
          <option value="remediating">Remediating</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Environment Filter */}
        <select
          value={filters.environment}
          onChange={(e) => onFilterChange({ ...filters, environment: e.target.value as FilterState['environment'] })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none capitalize"
        >
          <option value="all">Env: All</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>

        <span className="ml-auto text-slate-400 font-mono text-[11px]">
          Showing {totalCount} incidents
        </span>
      </div>
    </div>
  );
};
