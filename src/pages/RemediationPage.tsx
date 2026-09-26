import React, { useState, useEffect } from 'react';
import { fetchRemediationHistory } from '../api/remediation';
import { RemediationHistoryTable } from '../components/remediation/RemediationHistoryTable';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { RemediationRecord } from '../types';
import { Wrench } from 'lucide-react';

export const RemediationPage: React.FC = () => {
  const [remediations, setRemediations] = useState<RemediationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRemediationHistory();
      setRemediations(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load remediation audit history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = remediations.filter((rem) => {
    if (statusFilter === 'all') return true;
    return rem.status === statusFilter;
  });

  if (loading) {
    return <LoadingState message="Retrieving automated remediation log history..." count={5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadHistory} />;
  }

  return (
    <div className="space-y-4">
      {/* Header toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Wrench className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Remediation Action History</h2>
            <p className="text-xs text-slate-500">Automated and operator-approved self-healing execution audit</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Outcomes</option>
            <option value="completed">Completed / Success</option>
            <option value="running">Running</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <RemediationHistoryTable remediations={filtered} />
    </div>
  );
};
