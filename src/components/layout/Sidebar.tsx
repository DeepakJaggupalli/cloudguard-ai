import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Activity,
  Server,
  Layers,
  Wrench,
  MessageSquare,
  Cpu,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeEnvironment: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  activeEnvironment,
}) => {
  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Incidents', path: '/incidents', icon: AlertTriangle, badge: 'P1: 2' },
    { label: 'Telemetry', path: '/telemetry', icon: Activity },
    { label: 'Infrastructure', path: '/infrastructure', icon: Server },
    { label: 'Applications', path: '/applications', icon: Layers },
    { label: 'Remediation', path: '/remediation', icon: Wrench },
    { label: 'Feedback', path: '/feedback', icon: MessageSquare },
    { label: 'Models', path: '/models', icon: Cpu },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-30 bg-white text-slate-800 flex flex-col border-r border-slate-200 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded bg-slate-900 text-white shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="leading-none truncate">
              <span className="font-bold text-slate-900 text-sm tracking-tight block">CLOUDGUARD AI</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mt-0.5">Observability Platform</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 focus:outline-none shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold border-l-2 border-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500" />
              {!collapsed && (
                <span className="flex-1 truncate flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Status & Profile */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 shrink-0 text-xs">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Env: <strong className="text-slate-800 capitalize">{activeEnvironment}</strong></span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs font-bold border border-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate leading-tight">
                <div className="font-semibold text-slate-800 text-[11px] truncate">Operations Specialist</div>
                <div className="text-[10px] text-slate-500 truncate">sre@enterprise.io</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Operations Specialist">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
              <User className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
