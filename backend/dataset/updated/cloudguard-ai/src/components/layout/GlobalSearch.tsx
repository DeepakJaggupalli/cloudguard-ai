import React, { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, Server, Layers, Wrench, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockIncidents } from '../../mock/incidents';
import { mockVMs } from '../../mock/infrastructure';
import { mockApplications } from '../../mock/applications';
import { mockRemediations } from '../../mock/remediation';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const incidents = q
    ? mockIncidents.filter(
        (inc) =>
          inc.id.toLowerCase().includes(q) ||
          inc.title.toLowerCase().includes(q) ||
          inc.vmId.toLowerCase().includes(q) ||
          inc.application.toLowerCase().includes(q)
      )
    : [];

  const vms = q
    ? mockVMs.filter(
        (vm) =>
          vm.id.toLowerCase().includes(q) ||
          vm.name.toLowerCase().includes(q) ||
          vm.application.toLowerCase().includes(q) ||
          vm.ipAddress.toLowerCase().includes(q)
      )
    : [];

  const apps = q
    ? mockApplications.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.ownerTeam.toLowerCase().includes(q)
      )
    : [];

  const remediations = q
    ? mockRemediations.filter(
        (rem) =>
          rem.id.toLowerCase().includes(q) ||
          rem.action.toLowerCase().includes(q) ||
          rem.target.toLowerCase().includes(q)
      )
    : [];

  const hasResults = incidents.length > 0 || vms.length > 0 || apps.length > 0 || remediations.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="p-3 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Incident ID, VM-204, Payments API, scale-out remediation..."
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 border-none outline-none focus:ring-0 bg-transparent"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
            ESC
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {!query && (
            <div className="text-center py-6 text-slate-400">
              <p className="text-xs">Type to search across infrastructure, active incidents, telemetry, and remediations.</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono">INC-2026-00124</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono">VM-204</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono">Payments API</span>
              </div>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-8 text-slate-500">No matching resources found for "{query}"</div>
          )}

          {incidents.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Incidents ({incidents.length})
              </div>
              <div className="space-y-1">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      onClose();
                      navigate(`/incidents?id=${inc.id}`);
                    }}
                    className="p-2.5 rounded-md hover:bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600">
                        [{inc.id}] {inc.title}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {inc.application} • {inc.vmId} • Score: {inc.anomalyScore}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {vms.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Server className="w-3.5 h-3.5 text-blue-500" /> Infrastructure VMs ({vms.length})
              </div>
              <div className="space-y-1">
                {vms.map((vm) => (
                  <div
                    key={vm.id}
                    onClick={() => {
                      onClose();
                      navigate(`/infrastructure?id=${vm.id}`);
                    }}
                    className="p-2.5 rounded-md hover:bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600">
                        {vm.id} ({vm.name})
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {vm.application} • {vm.region} • CPU: {vm.cpuPercent}%
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {apps.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5 text-emerald-500" /> Applications ({apps.length})
              </div>
              <div className="space-y-1">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      onClose();
                      navigate('/applications');
                    }}
                    className="p-2.5 rounded-md hover:bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600">{app.name}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {app.ownerTeam} • Health: {app.health} • {app.latencyMs}ms
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {remediations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Wrench className="w-3.5 h-3.5 text-amber-500" /> Remediations ({remediations.length})
              </div>
              <div className="space-y-1">
                {remediations.map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => {
                      onClose();
                      navigate('/remediation');
                    }}
                    className="p-2.5 rounded-md hover:bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600">
                        [{rem.id}] {rem.action}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Target: {rem.target} • Status: {rem.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
