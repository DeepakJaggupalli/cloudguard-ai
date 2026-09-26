import React, { useState } from 'react';
import { AlertTriangle, X, Plus } from 'lucide-react';
import { Priority, Severity } from '../../types';

interface ManualIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIncident: (data: {
    title: string;
    priority: Priority;
    severity: Severity;
    vmId: string;
    application: string;
    description: string;
  }) => Promise<void>;
}

export const ManualIncidentModal: React.FC<ManualIncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmitIncident,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('P1');
  const [severity, setSeverity] = useState<Severity>('critical');
  const [vmId, setVmId] = useState('VM-204');
  const [application, setApplication] = useState('Payments API');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      setIsSubmitting(true);
      await onSubmitIncident({
        title,
        priority,
        severity,
        vmId,
        application,
        description,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 space-y-4">
        <button onClick={onClose} disabled={isSubmitting} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Manually Raise Operational Incident</h3>
            <p className="text-xs text-slate-500">Report metric spike for AI feature correlation & remediation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Incident Title / Summary</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sudden latency spike & thread exhaustion on Payments API"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority Tag</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium"
              >
                <option value="P1">P1 - Critical (Immediate Action)</option>
                <option value="P2">P2 - High (Major Impact)</option>
                <option value="P3">P3 - Medium (Moderate)</option>
                <option value="P4">P4 - Low (Informational)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium capitalize"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target VM Host</label>
              <input
                type="text"
                required
                value={vmId}
                onChange={(e) => setVmId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Application Microservice</label>
              <input
                type="text"
                required
                value={application}
                onChange={(e) => setApplication(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Observed Telemetry Spike Details</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Observed CPU 94%, p99 Latency 820ms, 5xx errors rising..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border border-slate-300 rounded-md font-semibold text-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Raise Incident to AI Engine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
