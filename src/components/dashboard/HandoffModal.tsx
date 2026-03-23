'use client';

import React, { useState } from 'react';
import { X, Copy, RefreshCw, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient } from '@/types';

interface HandoffModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export const HandoffModal: React.FC<HandoffModalProps> = ({ patient, isOpen, onClose }) => {
  const [sbarText, setSbarText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateSBAR = async () => {
    setIsLoading(true);
    setError(null);
    setSbarText(null);

    try {
      const res = await fetch('/api/ai/sbar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patient.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || err.error || 'Failed to generate SBAR');
      }

      const data = await res.json();
      setSbarText(data.sbar);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!sbarText) return;
    try {
      await navigator.clipboard.writeText(sbarText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = sbarText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Auto-generate on open
  React.useEffect(() => {
    if (isOpen && !sbarText && !isLoading) {
      generateSBAR();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 rounded-2xl bg-cliniq-navy/95 backdrop-blur-xl border border-cliniq-surface/60 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cliniq-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cliniq-cyan/20 border border-cliniq-cyan/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-cliniq-cyan" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">SBAR Handoff Note</h2>
              <p className="text-[11px] text-muted-foreground">
                {patient.name || patient.initials} · {patient.bed_label || 'WR'} · ESI {patient.esi_level}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cliniq-surface/60 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-8 h-8 border-2 border-cliniq-cyan/30 border-t-cliniq-cyan rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Generating SBAR handoff note...</p>
              <p className="text-[10px] text-muted-foreground/50">Analyzing clinical data with AI</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-cliniq-red/10 border border-cliniq-red/30 text-cliniq-red text-sm">
              <p className="font-bold">Generation Failed</p>
              <p className="text-xs mt-1">{error}</p>
              <button
                onClick={generateSBAR}
                className="mt-3 px-3 py-1.5 rounded-md bg-cliniq-red/20 hover:bg-cliniq-red/30 text-xs font-bold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {sbarText && (
            <div className="space-y-4">
              {sbarText.split(/\n(?=(?:SITUATION|BACKGROUND|ASSESSMENT|RECOMMENDATION):)/i).map((section, i) => {
                const match = section.match(/^(SITUATION|BACKGROUND|ASSESSMENT|RECOMMENDATION):\s*([\s\S]*)/i);
                if (!match) {
                  return (
                    <div key={i} className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {section.trim()}
                    </div>
                  );
                }
                const [, label, content] = match;
                const colors: Record<string, string> = {
                  SITUATION: 'text-cliniq-cyan border-cliniq-cyan/30 bg-cliniq-cyan/5',
                  BACKGROUND: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
                  ASSESSMENT: 'text-cliniq-amber border-cliniq-amber/30 bg-cliniq-amber/5',
                  RECOMMENDATION: 'text-cliniq-ai-green border-cliniq-ai-green/30 bg-cliniq-ai-green/5',
                };
                const colorClass = colors[label.toUpperCase()] || 'text-white border-cliniq-surface bg-cliniq-surface/20';
                return (
                  <div key={i} className={cn("p-4 rounded-lg border", colorClass)}>
                    <h3 className="text-[11px] font-black uppercase tracking-widest mb-2">{label}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content.trim()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {sbarText && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-cliniq-surface/50">
            <button
              onClick={generateSBAR}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cliniq-surface/40 hover:bg-cliniq-surface/60 text-xs font-bold text-muted-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
              Regenerate
            </button>
            <button
              onClick={copyToClipboard}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all",
                copied
                  ? "bg-cliniq-ai-green/20 text-cliniq-ai-green border border-cliniq-ai-green/30"
                  : "bg-cliniq-cyan/20 text-cliniq-cyan hover:bg-cliniq-cyan/30 border border-cliniq-cyan/30"
              )}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
