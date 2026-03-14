import React from 'react';
import { Monitor, Pencil, Phone, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImagingOrder, LabResult, Consult } from '@/types';

interface PendingRailProps {
  imaging: ImagingOrder[];
  labs: LabResult[];
  consults: Consult[];
}

export const PendingRail: React.FC<PendingRailProps> = ({ imaging, labs, consults }) => {
  return (
    <div className="w-80 border-l border-cliniq-surface bg-cliniq-navy flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-cliniq-surface flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Pending</h2>
        <div className="bg-cliniq-red text-[10px] px-1.5 py-0.5 rounded font-black text-white">
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
        {imaging.map(item => (
          <div key={item.id} className="p-2 rounded bg-cliniq-surface/40 border border-cliniq-surface/50 text-[11px] space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-white">{item.modality} — {item.patient_initials}</span>
              <span className="text-muted-foreground uppercase">{item.bed_label}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Ordered {new Date(item.ordered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              <span className={cn(
                "font-bold uppercase",
                item.status === 'RAD_READING' ? "text-cliniq-cyan" : "text-cliniq-amber"
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
          <span className="ml-auto bg-cliniq-yellow/20 text-cliniq-yellow text-[10px] px-1.5 rounded font-bold">{labs.length}</span>
        </div>
        {labs.map(item => (
          <div key={item.id} className="p-2 rounded bg-cliniq-surface/40 border border-cliniq-surface/50 text-[11px] space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-white">{item.test_name} — {item.patient_initials}</span>
              <span className="text-slate-400">{item.value}</span>
            </div>
            {item.status === 'CRITICAL' && (
              <div className="text-[9px] font-black text-cliniq-red uppercase flex items-center gap-1 mt-1 bg-cliniq-red/10 p-1 rounded">
                <Zap className="w-3 h-3 fill-cliniq-red" />
                Critical — Sepsis Bundle!
              </div>
            )}
            <div className="text-[10px] text-muted-foreground">
              Due {new Date(new Date(item.ordered_at).getTime() + 60*60*1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
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
        {consults.map(item => (
          <div key={item.id} className="p-2 rounded bg-cliniq-surface/40 border border-cliniq-surface/50 text-[11px] space-y-1 text-white">
            <div className="flex justify-between font-bold">
              <span>{item.specialty} — {item.patient_initials}</span>
              <span className="text-muted-foreground uppercase">{item.bed_label}</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Called {new Date(item.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} · {item.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
