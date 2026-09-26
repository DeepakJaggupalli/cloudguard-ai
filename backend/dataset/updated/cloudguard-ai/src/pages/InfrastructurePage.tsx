import React, { useState, useEffect } from 'react';
import { fetchInfrastructureVMs } from '../api/infrastructure';
import { VMTable } from '../components/infrastructure/VMTable';
import { VMDetailModal } from '../components/infrastructure/VMDetailModal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { VMItem } from '../types';
import { Server, Search } from 'lucide-react';

export const InfrastructurePage: React.FC = () => {
  const [vms, setVms] = useState<VMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVm, setSelectedVm] = useState<VMItem | null>(null);
  const [search, setSearch] = useState('');

  const loadVMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInfrastructureVMs();
      setVms(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch VM inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVMs();
  }, []);

  const filteredVMs = vms.filter(
    (vm) =>
      vm.id.toLowerCase().includes(search.toLowerCase()) ||
      vm.name.toLowerCase().includes(search.toLowerCase()) ||
      vm.application.toLowerCase().includes(search.toLowerCase()) ||
      vm.ipAddress.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingState message="Discovering infrastructure node inventory..." count={5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadVMs} />;
  }

  return (
    <div className="space-y-4">
      {/* Header toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Server className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">VM Infrastructure Inventory</h2>
            <p className="text-xs text-slate-500">Monitored compute hosts & container nodes</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search VM ID, IP, app name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Main Table */}
      <VMTable vms={filteredVMs} onSelectVM={(vm) => setSelectedVm(vm)} />

      {/* VM Detail Modal */}
      <VMDetailModal vm={selectedVm} isOpen={Boolean(selectedVm)} onClose={() => setSelectedVm(null)} />
    </div>
  );
};
