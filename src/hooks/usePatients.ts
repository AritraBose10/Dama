import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Patient } from '@/types';
import { mockPatients } from '@/lib/mockData';

const PATIENTS_QUERY_KEY = ['patients'];

export function usePatients() {
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: async () => {
      // In production, we fetch from Supabase:
      // const { data, error } = await supabase.from('patients').select('*').order('risk_score', { ascending: false });
      // if (error) throw error;
      // return data as Patient[];
      
      // For demo, we return mock but allow realtime to "invalidate"
      return mockPatients;
    },
  });

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('patients-v1')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        (payload) => {
          console.log('Realtime change received:', payload);
          // Invalidate and refetch
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
