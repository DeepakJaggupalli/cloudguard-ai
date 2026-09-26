import React from 'react';
import { X, Server, Activity, ShieldAlert, Cpu, HardDrive, CpuIcon } from 'lucide-react';
import { VMItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface VMDetailModalProps {
  vm: VMItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VMDetailModal: React.FC<VMDetailModalProps> = ({ vm, isOpen, onClose }) => {
  if (!isOpen || !vm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-900 text-white">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-mono">{vm.id}</h3>
              <StatusBadge status={vm.health} size="sm" />
            </div>
            <p className="text-xs text-slate-500 font-mono">{vm.name} • IP: {vm.ipAddress}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Application</span>
            <span className="font-bold text-slate-900">{vm.application}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Region / Env</span>
            <span className="font-mono text-slate-800">{vm.region} ({vm.environment})</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Instance Type</span>
            <span className="font-mono text-slate-800">{vm.instanceType}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">OS Image</span>
            <span className="font-mono text-slate-800">{vm.os}</span>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 border border-slate-200 rounded-md text-center bg-white">
            <span className="text-xs font-semibold text-slate-500 uppercase block">CPU Utilization</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{vm.cpuPercent}%</span>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${vm.cpuPercent}%` }} />
            </div>
          </div>

          <div className="p-3 border border-slate-200 rounded-md text-center bg-white">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Memory Usage</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{vm.memoryPercent}%</span>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${vm.memoryPercent}%` }} />
            </div>
          </div>

          <div className="p-3 border border-slate-200 rounded-md text-center bg-white">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Disk Utilization</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{vm.diskPercent}%</span>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-slate-600 rounded-full" style={{ width: `${vm.diskPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-md"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
