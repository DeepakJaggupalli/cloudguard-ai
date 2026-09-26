import React, { useState, useMemo } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { IncidentFilterBar } from '../components/incidents/IncidentFilterBar';
import { ManualIncidentModal } from '../components/incidents/ManualIncidentModal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { Incident, Priority, Severity, IncidentStatus, Environment } from '../types';
import { config } from '../config/environment';

interface IncidentsPageProps {
  onSelectIncident: (id: string) => void;
  onRemediateClick: (incident: Incident) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  onSelectIncident,
  onRemediateClick,
}) => {
  const { incidents, loading, error, refresh } = useIncidents();
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    priority: 'all' as Priority | 'all',
    severity: 'all' as Severity | 'all',
    status: 'all' as IncidentStatus | 'all',
    environment: 'all' as Environment | 'all',
    timeRange: 'all' as '30m' | '1h' | '24h' | 'all',
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
            inc.application.toLowerCase().includes(q);
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
        return b.anomalyScore - a.anomalyScore;
      });
  }, [incidents, filters]);

  const handleManualIncidentSubmit = async (data: any) => {
    await fetch(`${config.apiBaseUrl}/incidents/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    refresh();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      priority: 'all',
      severity: 'all',
      status: 'all',
      environment: 'all',
      timeRange: 'all',
      sortBy: 'newest',
    });
  };

  if (loading) {
    return <LoadingState message="Fetching incident monitoring data from backend..." count={5} />;
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
        onOpenRaiseModal={() => setIsRaiseModalOpen(true)}
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

      {/* Manual Incident Modal */}
      <ManualIncidentModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        onSubmitIncident={handleManualIncidentSubmit}
      />
    </div>
  );
};
