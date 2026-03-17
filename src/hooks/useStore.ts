import { create } from 'zustand';
import { FilterTab } from '@/components/layout/FilterTabBar';

interface ClinicalState {
  activeTab: FilterTab;
  setActiveTab: (tab: FilterTab) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  isAiThinking: boolean;
  setIsAiThinking: (thinking: boolean) => void;
  isShiftActive: boolean;
  shiftStartTime: string | null;
  toggleShift: () => void;
}

export const useClinicalStore = create<ClinicalState>((set) => ({
  activeTab: 'ALL PATIENTS',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedPatientId: null,
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  isAiThinking: false,
  setIsAiThinking: (thinking) => set({ isAiThinking: thinking }),
  isShiftActive: false,
  shiftStartTime: null,
  toggleShift: () => set((state) => ({ 
    isShiftActive: !state.isShiftActive,
    shiftStartTime: !state.isShiftActive ? new Date().toISOString() : null
  })),
}));
