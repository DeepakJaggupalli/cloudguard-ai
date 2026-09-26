import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Shield, Bell, Sliders, Server, Cpu } from 'lucide-react';
import { Card } from '../components/common/Card';
import { config } from '../config/environment';

export const SettingsPage: React.FC = () => {
  const [useMock, setUseMock] = useState(config.useMockData);
  const [anomalyThreshold, setAnomalyThreshold] = useState('0.75');
  const [p1AutoRemedy, setP1AutoRemedy] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-slate-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Platform Settings & Thresholds</h2>
            <p className="text-xs text-slate-500">Configure alert rules, backend endpoints, and policy guardrails</p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs font-semibold">
          Settings configuration saved successfully. Applied to local session.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Backend & Environment */}
        <Card title="Backend & Mode Configuration" subtitle="Toggle API mode vs Mock Data Provider">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div>
                <span className="font-bold text-slate-900 block">Use Mock Data Provider (`VITE_USE_MOCK_DATA`)</span>
                <span className="text-slate-500 text-[11px]">
                  When disabled, API service calls FastAPI endpoints at {config.apiBaseUrl}
                </span>
              </div>
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMock(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">FastAPI Backend Base URL</label>
              <input
                type="text"
                defaultValue={config.apiBaseUrl}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Anomaly Detection Sensitivity */}
        <Card title="ML Anomaly Thresholds & Rules" subtitle="Isolation Forest Continuous Score Policy">
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 flex justify-between mb-1">
                <span>Anomaly Sensitivity Threshold</span>
                <span className="font-mono font-bold text-blue-600">{anomalyThreshold}</span>
              </label>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(e.target.value)}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Signals exceeding continuous score {anomalyThreshold} trigger automatic P1/P2 cross-layer incident creation.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div>
                <span className="font-bold text-slate-900 block">Strict Human-In-The-Loop Approval</span>
                <span className="text-slate-500 text-[11px]">Require operator confirmation for all VM scale-out actions</span>
              </div>
              <input
                type="checkbox"
                defaultChecked={true}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
