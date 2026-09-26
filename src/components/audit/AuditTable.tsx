import React from 'react';
import { AuditLog } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ShieldCheck, AlertCircle, Info, FileText } from 'lucide-react';

interface AuditTableProps {
  logs: AuditLog[];
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Resource Target</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                  {formatDate(log.timestamp)}
                </td>

                <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                  {log.actor}
                </td>

                <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-800">
                  {log.action}
                </td>

                <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-blue-700 font-medium">
                  {log.resource}
                </td>

                <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                    {log.resourceType}
                  </span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      log.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : log.status === 'warning'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                  {log.ipAddress}
                </td>

                <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
