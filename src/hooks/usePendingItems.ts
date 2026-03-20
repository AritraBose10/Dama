import { useQuery } from '@tanstack/react-query';
import { ImagingOrder, LabResult, Consult } from '@/types';

export function usePendingItems() {
  const { data: imaging = [] } = useQuery<ImagingOrder[]>({
    queryKey: ['imaging'],
    queryFn: async () => {
      const res = await fetch('/api/imaging');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: labs = [] } = useQuery<LabResult[]>({
    queryKey: ['labs'],
    queryFn: async () => {
      const res = await fetch('/api/labs');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: consults = [] } = useQuery<Consult[]>({
    queryKey: ['consults'],
    queryFn: async () => {
      const res = await fetch('/api/consults');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000,
  });

  return { imaging, labs, consults };
}
