import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import { Environment, AppNotification } from '../../types';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
  title: string;
  activeEnvironment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  onOpenSearch: () => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  onNotificationClick: (incidentId?: string) => void;
  systemHealthPercent: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  activeEnvironment,
  onEnvironmentChange,
  onOpenSearch,
  notifications,
  onMarkNotificationsRead,
  onNotificationClick,
  systemHealthPercent,
}) => {
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);

  const environments: Environment[] = ['production', 'staging', 'development'];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Title & System Status */}
      <div className="flex items-center gap-4">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              systemHealthPercent > 95
                ? 'bg-emerald-500 animate-pulse'
                : systemHealthPercent > 85
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <span>{systemHealthPercent > 95 ? 'All systems operational' : `System Health ${systemHealthPercent}%`}</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Environment Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none bg-slate-50/50"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize">{activeEnvironment}</span>
          </button>

          {isEnvDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsEnvDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-md border border-slate-200 shadow-lg z-50 py-1 text-xs">
                {environments.map((env) => (
                  <button
                    key={env}
                    onClick={() => {
                      onEnvironmentChange(env);
                      setIsEnvDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 capitalize hover:bg-slate-100 ${
                      activeEnvironment === env ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          title="Search (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-xs text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Notification Dropdown */}
        <NotificationsDropdown
          notifications={notifications}
          onMarkAllRead={onMarkNotificationsRead}
          onNotificationClick={onNotificationClick}
        />

        {/* User Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center border border-slate-200 shadow-2xs">
          OP
        </div>
      </div>
    </header>
  );
};
