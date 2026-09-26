import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from '../api/audit';
import { AuditTable } from '../components/audit/AuditTable';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { AuditLog } from '../types';
import { FileText } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch audit log trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  if (loading) {
    return <LoadingState message="Fetching security & action audit trail..." count={5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAudit} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-slate-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">System Audit Trail</h2>
            <p className="text-xs text-slate-500">Immutable enterprise operation & incident remediation logs</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-600">{logs.length} Log Entries</span>
      </div>

      <AuditTable logs={logs} />
    </div>
  );
};
