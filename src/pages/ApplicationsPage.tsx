import React, { useState, useEffect } from 'react';
import { fetchApplications } from '../api/applications';
import { ApplicationCard } from '../components/applications/ApplicationCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { ApplicationItem } from '../types';
import { Layers } from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const [apps, setApps] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApplications();
      setApps(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load microservice applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  if (loading) {
    return <LoadingState message="Fetching registered application services..." count={4} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadApps} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Application Microservices</h2>
            <p className="text-xs text-slate-500">Service topology health & throughput</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-600">{apps.length} Active Services</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <ApplicationCard key={app.id} app={app} onSelect={(a) => alert(`Selected service: ${a.name}`)} />
        ))}
      </div>
    </div>
  );
};
