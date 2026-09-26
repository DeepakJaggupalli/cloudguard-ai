import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearch } from './GlobalSearch';
import { Environment, AppNotification } from '../../types';
import { useNavigate } from 'react-router-dom';

interface AppShellProps {
  title: string;
  activeEnvironment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  systemHealthPercent: number;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  title,
  activeEnvironment,
  onEnvironmentChange,
  systemHealthPercent,
  notifications,
  onMarkNotificationsRead,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeEnvironment={activeEnvironment}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <Header
          title={title}
          activeEnvironment={activeEnvironment}
          onEnvironmentChange={onEnvironmentChange}
          onOpenSearch={() => setIsSearchOpen(true)}
          notifications={notifications}
          onMarkNotificationsRead={onMarkNotificationsRead}
          onNotificationClick={(id) => id && navigate(`/incidents?id=${id}`)}
          systemHealthPercent={systemHealthPercent}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto bg-white">{children}</main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
