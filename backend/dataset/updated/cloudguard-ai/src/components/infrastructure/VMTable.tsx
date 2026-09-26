import React from 'react';
import { VMItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Server, Activity, ArrowRight } from 'lucide-react';

interface VMTableProps {
  vms: VMItem[];
  onSelectVM: (vm: VMItem) => void;
}

export const VMTable: React.FC<VMTableProps> = ({ vms, onSelectVM }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">VM ID & Host</th>
              <th className="py-3 px-4">Application</th>
              <th className="py-3 px-4">Region / Env</th>
              <th className="py-3 px-4">Instance Type</th>
              <th className="py-3 px-4">CPU %</th>
              <th className="py-3 px-4">Memory %</th>
              <th className="py-3 px-4">Disk %</th>
              <th className="py-3 px-4">Latency</th>
              <th className="py-3 px-4">Health</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {vms.map((vm) => {
              const isCritical = vm.health === 'critical';
              const isWarning = vm.health === 'warning';

              return (
                <tr
                  key={vm.id}
                  onClick={() => onSelectVM(vm)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    isCritical ? 'bg-rose-50/20' : isWarning ? 'bg-amber-50/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 font-mono text-xs">{vm.id}</span>
                        <span className="text-slate-500 text-[11px] font-mono block">{vm.ipAddress}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-800">
                    {vm.application}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                    <span className="font-mono text-[11px]">{vm.region}</span> •{' '}
                    <span className="capitalize font-medium">{vm.environment}</span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-700">
                    {vm.instanceType}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        vm.cpuPercent > 85 ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {vm.cpuPercent}%
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        vm.memoryPercent > 85 ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {vm.memoryPercent}%
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700">
                    {vm.diskPercent}%
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700">
                    {vm.latencyMs}ms
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={vm.health} size="sm" />
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {vm.lastUpdated}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button className="text-slate-400 hover:text-blue-600 p-1">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
