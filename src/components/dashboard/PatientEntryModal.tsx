import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface PatientEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientEntryModal: React.FC<PatientEntryModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    initials: '',
    age: '',
    gender: 'M',
    esi_level: '3',
    chief_complaint: '',
    complaint_category: 'GENERAL'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/patients/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          esi_level: parseInt(formData.esi_level)
        })
      });

      if (!response.ok) throw new Error('Failed to register patient');

      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-cliniq-navy rounded-xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-cliniq-surface/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cliniq-cyan/10 rounded-lg">
              <UserPlus className="w-5 h-5 text-cliniq-cyan" />
            </div>
            <h2 className="text-white font-bold text-lg">Patient Check-In</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-300">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Initials</label>
              <input 
                required
                type="text" 
                maxLength={3}
                placeholder="A.B."
                value={formData.initials}
                onChange={e => setFormData({...formData, initials: e.target.value.toUpperCase()})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-cliniq-cyan text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Age</label>
              <input 
                required
                type="number" 
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-cliniq-cyan text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gender</label>
              <select 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-cliniq-cyan text-white appearance-none"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="NB">Non-binary</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ESI Level</label>
              <select 
                value={formData.esi_level}
                onChange={e => setFormData({...formData, esi_level: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-cliniq-cyan text-white appearance-none"
              >
                <option value="1">1 - Critical</option>
                <option value="2">2 - Emergent</option>
                <option value="3">3 - Urgent</option>
                <option value="4">4 - Non-Urgent</option>
                <option value="5">5 - Minor</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chief Complaint</label>
            <textarea 
              required
              rows={2}
              value={formData.chief_complaint}
              onChange={e => setFormData({...formData, chief_complaint: e.target.value})}
              placeholder="e.g. Chest pain with radiating arm numbness"
              className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-cliniq-cyan text-white resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</label>
            <select 
              value={formData.complaint_category}
              onChange={e => setFormData({...formData, complaint_category: e.target.value})}
              className="w-full bg-slate-900/50 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-cliniq-cyan text-white appearance-none"
            >
              <option value="GENERAL">General</option>
              <option value="CARDIAC">Cardiac</option>
              <option value="NEURO">Neuro</option>
              <option value="RESPIRATORY">Respiratory</option>
              <option value="OBGYN">OB/GYN</option>
              <option value="PROCEDURE">Procedure/Ortho</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-700 rounded font-bold text-[11px] hover:bg-slate-800 transition-colors"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-cliniq-cyan hover:bg-cyan-600 disabled:bg-cyan-800 disabled:cursor-not-allowed text-cliniq-navy rounded font-bold text-[11px] transition-colors"
            >
              {isSubmitting ? 'PROCESSING...' : 'REGISTER PATIENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
