import React, { useState, useMemo } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { IncidentFilterBar } from '../components/incidents/IncidentFilterBar';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Incident, Priority, Severity, IncidentStatus, Environment } from '../types';

interface IncidentsPageProps {
  onSelectIncident: (id: string) => void;
  onRemediateClick: (incident: Incident) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  onSelectIncident,
  onRemediateClick,
}) => {
  const { incidents, loading, error, refresh } = useIncidents();

  const [filters, setFilters] = useState({
    search: '',
    priority: 'all' as Priority | 'all',
    severity: 'all' as Severity | 'all',
    status: 'all' as IncidentStatus | 'all',
    environment: 'all' as Environment | 'all',
    sortBy: 'newest' as 'newest' | 'oldest' | 'priority' | 'anomalyScore',
  });

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matches =
            inc.id.toLowerCase().includes(q) ||
            inc.title.toLowerCase().includes(q) ||
            inc.vmId.toLowerCase().includes(q) ||
            inc.application.toLowerCase().includes(q) ||
            inc.recommendedAction.toLowerCase().includes(q);
          if (!matches) return false;
        }

        if (filters.priority !== 'all' && inc.priority !== filters.priority) return false;
        if (filters.severity !== 'all' && inc.severity !== filters.severity) return false;
        if (filters.status !== 'all' && inc.status !== filters.status) return false;
        if (filters.environment !== 'all' && inc.environment !== filters.environment) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'newest') {
          return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
        }
        if (filters.sortBy === 'oldest') {
          return new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
        }
        if (filters.sortBy === 'anomalyScore') {
          return b.anomalyScore - a.anomalyScore;
        }
        if (filters.sortBy === 'priority') {
          const priorityWeight: Record<Priority, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return 0;
      });
  }, [incidents, filters]);

  const handleReset = () => {
    setFilters({
      search: '',
      priority: 'all',
      severity: 'all',
      status: 'all',
      environment: 'all',
      sortBy: 'newest',
    });
  };

  if (loading) {
    return <LoadingState message="Fetching active incidents from cross-layer detection service..." count={5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <IncidentFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        totalCount={filteredIncidents.length}
      />

      {/* Main Table */}
      {filteredIncidents.length === 0 ? (
        <EmptyState
          title="No matching incidents found"
          description="Try relaxing search keywords or resetting status/priority filters."
        />
      ) : (
        <IncidentTable
          incidents={filteredIncidents}
          onSelectIncident={onSelectIncident}
          onRemediateClick={onRemediateClick}
        />
      )}
    </div>
  );
};
