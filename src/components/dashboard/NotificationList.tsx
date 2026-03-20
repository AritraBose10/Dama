'use client';

import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  patient_id: string;
  type: string;
  message: string;
  severity: string;
  created_at: string;
}

export const NotificationList: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        if (data.success) {
          setAlerts(data.alerts);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-cliniq-cyan">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cliniq-cyan"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-20">
        <Bell className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-cliniq-navy/50 backdrop-blur-sm animate-in fade-in duration-500">
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={cn(
            "p-4 rounded-xl border border-cliniq-surface bg-cliniq-surface/30 flex items-start gap-4 transition-all hover:bg-cliniq-surface/50 group",
            alert.severity === 'CRITICAL' && "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
          )}
        >
          <div className={cn(
            "mt-1 p-2 rounded-lg shrink-0",
            alert.severity === 'CRITICAL' ? "bg-red-500/20 text-red-500" : "bg-cliniq-cyan/20 text-cliniq-cyan"
          )}>
            {alert.severity === 'CRITICAL' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={cn(
                "text-[10px] font-bold tracking-widest uppercase",
                alert.severity === 'CRITICAL' ? "text-red-500" : "text-cliniq-cyan"
              )}>
                {alert.type.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <p className="text-sm text-cliniq-white/90 leading-relaxed font-medium">
              {alert.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
