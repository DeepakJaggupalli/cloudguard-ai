import React from 'react';
import { RemediationRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

interface RemediationHistoryTableProps {
  remediations: RemediationRecord[];
}

export const RemediationHistoryTable: React.FC<RemediationHistoryTableProps> = ({ remediations }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Incident ID & Title</th>
              <th className="py-3 px-4">Remediation Action</th>
              <th className="py-3 px-4">Target Host / VM</th>
              <th className="py-3 px-4">Requested By</th>
              <th className="py-3 px-4">Approval</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Execution Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {remediations.map((rem) => (
              <tr key={rem.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                  {formatDate(rem.timestamp)}
                </td>

                <td className="py-3 px-4">
                  <span className="font-mono text-slate-400 text-[11px] block">{rem.incidentId}</span>
                  <span className="font-semibold text-slate-900 line-clamp-1">{rem.incidentTitle}</span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {rem.action}
                  </span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-slate-800">
                  {rem.target}
                </td>

                <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                  {rem.requestedBy}
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      rem.approvalStatus === 'approved' || rem.approvalStatus === 'auto_approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {rem.approvalStatus.replace('_', ' ')}
                  </span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusBadge status={rem.status} size="sm" />
                </td>

                <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                  {rem.durationSeconds}s
                </td>

                <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                  {rem.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
