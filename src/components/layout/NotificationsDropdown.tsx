import React, { useState } from 'react';
import { Bell, Check, ShieldAlert, Wrench, RefreshCw, Activity } from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationsDropdownProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onNotificationClick: (incidentId?: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onMarkAllRead,
  onNotificationClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'p1_incident':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'remediation_complete':
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'retrain_complete':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'health_alert':
        return <Activity className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in duration-100">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="text-xs font-semibold text-slate-900">Notifications ({notifications.length})</h4>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No recent notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setIsOpen(false);
                      onNotificationClick(n.incidentId);
                    }}
                    className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                      !n.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="p-1 rounded-md bg-white border border-slate-200 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-slate-600 leading-snug">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
