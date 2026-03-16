import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Patient } from '@/types';
import { useClinicalStore } from './useStore';

const PATIENTS_QUERY_KEY = ['patients'];

export function usePatients() {
  const queryClient = useQueryClient();
  const activeTab = useClinicalStore((state) => state.activeTab);

  const { data: rawPatients = [], isLoading, error } = useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });

  const patients = useMemo(() => {
    switch (activeTab) {
      case 'ESI 1-2':
        return rawPatients.filter((p: Patient) => p.esi_level <= 2);
      case 'WAITING ROOM':
        return rawPatients.filter((p: Patient) => p.is_waiting_room);
      case 'TOP RISK':
        return [...rawPatients].sort((a: Patient, b: Patient) => b.risk_score - a.risk_score).slice(0, 5);
      case 'FAST TRACK':
        return rawPatients.filter((p: Patient) => p.complaint_category === 'FAST_TRACK');
      case 'BOARDING':
        return rawPatients.filter((p: Patient) => p.status === 'BOARDING');
      case 'DISPO READY':
        return rawPatients.filter((p: Patient) => p.status === 'DISPO_READY');
      case 'DISCHARGED':
        return rawPatients.filter((p: Patient) => p.status === 'DISCHARGED');
      default:
        return rawPatients;
    }
  }, [rawPatients, activeTab]);

  return { patients, isLoading, error };
}
