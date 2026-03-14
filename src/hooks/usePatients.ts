import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Patient } from '@/types';
import { mockPatients } from '@/lib/mockData';
import { useClinicalStore } from './useStore';

const PATIENTS_QUERY_KEY = ['patients'];

export function usePatients() {
  const queryClient = useQueryClient();
  const activeTab = useClinicalStore((state) => state.activeTab);

  const { data: rawPatients = [], isLoading, error } = useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: async () => {
      // Demo logic: Return mock data
      return mockPatients;
    },
  });

  const patients = useMemo(() => {
    switch (activeTab) {
      case 'ESI 1-2':
        return rawPatients.filter(p => p.esi_level <= 2);
      case 'WAITING ROOM':
        return rawPatients.filter(p => p.is_waiting_room);
      case 'TOP RISK':
        return [...rawPatients].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5);
      case 'FAST TRACK':
        return rawPatients.filter(p => p.complaint_category === 'FAST_TRACK');
      case 'BOARDING':
        return rawPatients.filter(p => p.status === 'BOARDING');
      case 'DISPO READY':
        return rawPatients.filter(p => p.status === 'DISPO_READY');
      case 'DISCHARGED':
        return rawPatients.filter(p => p.status === 'DISCHARGED');
      default:
        return rawPatients;
    }
  }, [rawPatients, activeTab]);

  useEffect(() => {
    const channel = supabase
      .channel('patients-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        () => {
          queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { patients, isLoading, error };
}
