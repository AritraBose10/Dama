import React from 'react';
import { Monitor, Pencil, Phone, AlertCircle, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImagingOrder, LabResult, Consult } from '@/types';

interface PendingRailProps {
  imaging: ImagingOrder[];
  labs: LabResult[];
  consults: Consult[];
}

function timeSince(dateStr: string) {
  const mins = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export const PendingRail: React.FC<PendingRailProps> = ({ imaging, labs, consults }) => {
  const criticalCount = labs.filter(l => l.critical).length;

  return (
    <div className="w-80 border-l border-cliniq-surface bg-cliniq-navy flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-cliniq-surface flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Pending</h2>
        <div className={cn(
          "text-[10px] px-1.5 py-0.5 rounded font-black text-white",
          criticalCount > 0 ? "bg-cliniq-red animate-pulse" : "bg-cliniq-red"
        )}>
          {imaging.length + labs.length + consults.length} ITEMS
        </div>
      </div>

      {/* Imaging Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-cliniq-amber" />
          <span className="text-[11px] font-bold text-slate-300 uppercase">Imaging</span>
          <span className="ml-auto bg-cliniq-amber/20 text-cliniq-amber text-[10px] px-1.5 rounded font-bold">{imaging.length}</span>
        </div>
        {imaging.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 italic">No pending imaging orders</p>
        )}
        {imaging.map(item => (
          <div key={item.id} className={cn(
            "p-2 rounded bg-cliniq-surface/40 border border-cliniq-surface/50 text-[11px] space-y-1",
            item.status === 'ALERT' && "border-cliniq-red/50 bg-red-500/10 animate-pulse"
          )}>
            <div className="flex justify-between font-bold">
              <span className="text-white">{item.modality} — {item.patient_initials}</span>
              <span className="text-muted-foreground uppercase">{item.bed_label}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeSince(item.ordered_at)}
              </span>
              <span className={cn(
                "font-bold uppercase",
                item.status === 'RAD_READING' ? "text-cliniq-cyan" :
                item.status === 'ALERT' ? "text-cliniq-red" : "text-cliniq-amber"
              )}>{item.status.replace('_', ' ')}</span>
            </div>
            {item.status === 'ALERT' && (
              <div className="text-[9px] font-bold text-cliniq-red uppercase flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Read Threshold Exceeded
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Labs Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-cliniq-yellow" />
          <span className="text-[11px] font-bold text-slate-300 uppercase">Labs</span>
          <span className={cn(
            "ml-auto text-[10px] px-1.5 rounded font-bold",
            criticalCount > 0 ? "bg-cliniq-red/20 text-cliniq-red animate-pulse" : "bg-cliniq-yellow/20 text-cliniq-yellow"
          )}>
            {labs.length}
          </span>
        </div>
        {labs.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 italic">No pending lab results</p>
        )}
        {labs.map(item => (
          <div key={item.id} className={cn(
            "p-2 rounded bg-cliniq-surface/40 border border-cliniq-surface/50 text-[11px] space-y-1",
            item.critical && "border-cliniq-red/50 bg-red-500/10"
          )}>
            <div className="flex justify-between font-bold">
              <span className="text-white">{item.test_name} — {item.patient_initials}</span>
              <span className={cn(
                "text-slate-400",
                item.critical && "text-cliniq-red font-black"
              )}>{item.value}</span>
            </div>
            {item.critical && (
              <div className="text-[9px] font-black text-cliniq-red uppercase flex items-center gap-1 mt-1 bg-cliniq-red/10 p-1 rounded animate-pulse">
                <Zap className="w-3 h-3 fill-cliniq-red" />
                Critical Result — Immediate Review!
              </div>
            )}
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeSince(item.ordered_at)}
              </span>
              <span className={cn(
                "font-bold uppercase",
                item.status === 'CRITICAL' ? 'text-cliniq-red' : 'text-muted-foreground'
              )}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Consults Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-purple-400" />
          <span className="text-[11px] font-bold text-slate-300 uppercase">Consults</span>
          <span className="ml-auto bg-purple-400/20 text-purple-400 text-[10px] px-1.5 rounded font-bold">{consults.length}</span>
        </div>
        {consults.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 italic">No pending consults</p>
        )}
        {consults.map(item => (
          <div key={item.id} className="p-2 rounded bg-cliniq-surface/40 border border-cliniq-surface/50 text-[11px] space-y-1 text-white">
            <div className="flex justify-between font-bold">
              <span>{item.specialty} — {item.patient_initials}</span>
              <span className="text-muted-foreground uppercase">{item.bed_label}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeSince(item.called_at)}
              </span>
              <span className="uppercase font-bold">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
