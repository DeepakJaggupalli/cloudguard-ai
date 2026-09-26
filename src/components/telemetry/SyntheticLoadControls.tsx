import React, { useState } from 'react';
import { Activity, Flame, Cpu, Database, Clock, RefreshCw } from 'lucide-react';

interface SyntheticLoadControlsProps {
  onSimulate: (scenario: string) => Promise<void>;
}

export const SyntheticLoadControls: React.FC<SyntheticLoadControlsProps> = ({ onSimulate }) => {
  const [activeScenario, setActiveScenario] = useState<string>('normal_load');
  const [isLoading, setIsLoading] = useState(false);

  const scenarios = [
    { id: 'normal_load', label: 'Normal Baseline Load', icon: Activity, color: 'border-slate-300 bg-slate-50 text-slate-700' },
    { id: 'cpu_spike', label: 'Simulate CPU Utilization Spike', icon: Cpu, color: 'border-rose-300 bg-rose-50 text-rose-800 font-bold' },
    { id: 'memory_leak', label: 'Simulate Heap Memory Leak', icon: Flame, color: 'border-amber-300 bg-amber-50 text-amber-800 font-bold' },
    { id: 'db_pool_leak', label: 'Simulate DB Connection Leak', icon: Database, color: 'border-blue-300 bg-blue-50 text-blue-800 font-bold' },
    { id: 'latency_burst', label: 'Simulate High Latency Burst', icon: Clock, color: 'border-purple-300 bg-purple-50 text-purple-800 font-bold' },
  ];

  const handleTrigger = async (sc: string) => {
    try {
      setIsLoading(true);
      setActiveScenario(sc);
      await onSimulate(sc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Live Telemetry Scenario Controls (Synthetic Load Injector)
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Active: {activeScenario}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = activeScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => handleTrigger(sc.id)}
              disabled={isLoading}
              className={`p-2.5 rounded-md border text-left flex flex-col justify-between transition-all focus:outline-none ${
                isSelected ? 'ring-2 ring-blue-600 shadow-xs' : 'hover:bg-slate-50'
              } ${sc.color}`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className="w-4 h-4 shrink-0" />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />}
              </div>
              <span className="text-[11px] leading-tight block">{sc.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
