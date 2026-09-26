import React from 'react';
import { Search, Filter, RotateCcw, Clock, Plus } from 'lucide-react';
import { Environment, Priority, Severity, IncidentStatus } from '../../types';

interface FilterState {
  search: string;
  priority: Priority | 'all';
  severity: Severity | 'all';
  status: IncidentStatus | 'all';
  environment: Environment | 'all';
  timeRange: '30m' | '1h' | '24h' | 'all';
  sortBy: 'newest' | 'oldest' | 'priority' | 'anomalyScore';
}

interface IncidentFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  onOpenRaiseModal: () => void;
  totalCount: number;
}

export const IncidentFilterBar: React.FC<IncidentFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onOpenRaiseModal,
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
            placeholder="Search Incident ID, VM-204, Payments API..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:bg-white"
          />
        </div>

        {/* Raise Incident Button */}
        <button
          onClick={onOpenRaiseModal}
          className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Raise Incident
        </button>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <span className="flex items-center gap-1 font-semibold text-slate-500 mr-1">
          <Filter className="w-3 h-3" /> Filters:
        </span>

        {/* Time Range Filter */}
        <select
          value={filters.timeRange}
          onChange={(e) => onFilterChange({ ...filters, timeRange: e.target.value as FilterState['timeRange'] })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none"
        >
          <option value="all">Time: All Time</option>
          <option value="30m">Last 30 Min</option>
          <option value="1h">Last 1 Hr</option>
          <option value="24h">Last 24 Hours</option>
        </select>

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
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none capitalize"
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="investigating">Investigating</option>
          <option value="remediating">Remediating</option>
          <option value="resolved">Resolved</option>
        </select>

        <button
          onClick={onReset}
          className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-md ml-auto"
          title="Reset Filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
