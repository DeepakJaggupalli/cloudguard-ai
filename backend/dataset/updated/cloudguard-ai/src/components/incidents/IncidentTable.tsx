import React from 'react';
import { Incident } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { ChevronRight, Wrench } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onRemediateClick: (incident: Incident) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onSelectIncident,
  onRemediateClick,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-16">Priority</th>
              <th className="py-3 px-4">Incident Title & ID</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">VM / Host</th>
              <th className="py-3 px-4">Application</th>
              <th className="py-3 px-4 text-center">Anomaly Score</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Detected</th>
              <th className="py-3 px-4">Recommended Action</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {incidents.map((inc) => {
              const isP1 = inc.priority === 'P1';

              return (
                <tr
                  key={inc.id}
                  className={`hover:bg-slate-50/80 transition-colors ${isP1 ? 'bg-rose-50/20' : ''}`}
                >
                  <td className="py-3 px-4">
                    <PriorityBadge priority={inc.priority} />
                  </td>

                  <td className="py-3 px-4">
                    <div
                      onClick={() => onSelectIncident(inc.id)}
                      className="cursor-pointer group inline-block"
                    >
                      <span className="font-mono text-slate-400 text-[11px] block">{inc.id}</span>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {inc.title}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={inc.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{inc.vmId}</span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-700 font-medium">{inc.application}</span>
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold border ${
                        inc.anomalyScore > 0.85
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {inc.anomalyScore.toFixed(2)}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <SeverityBadge severity={inc.severity} size="sm" />
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {formatDate(inc.detectedAt)}
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-700 line-clamp-1 font-mono text-[11px]">
                      {inc.recommendedAction}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                    {inc.status !== 'resolved' && (
                      <button
                        onClick={() => onRemediateClick(inc)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-2xs inline-flex items-center gap-1 focus:outline-none"
                      >
                        <Wrench className="w-3 h-3" />
                        Remedy
                      </button>
                    )}
                    <button
                      onClick={() => onSelectIncident(inc.id)}
                      className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center"
                      title="Inspect Incident Details"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
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
