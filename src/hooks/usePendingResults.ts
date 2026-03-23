import { useQuery } from '@tanstack/react-query';
import { ImagingOrder, LabResult, Consult } from '@/types';

export function useLabs() {
  return useQuery<LabResult[]>({
    queryKey: ['labs'],
    queryFn: async () => {
      const response = await fetch('/api/labs');
      if (!response.ok) throw new Error('Failed to fetch labs');
      return response.json();
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

export function useImaging() {
  return useQuery<ImagingOrder[]>({
    queryKey: ['imaging'],
    queryFn: async () => {
      const response = await fetch('/api/imaging');
      if (!response.ok) throw new Error('Failed to fetch imaging');
      return response.json();
    },
    refetchInterval: 10000,
  });
}

export function useConsults() {
  return useQuery<Consult[]>({
    queryKey: ['consults'],
    queryFn: async () => {
      const response = await fetch('/api/consults');
      if (!response.ok) throw new Error('Failed to fetch consults');
      return response.json();
    },
    refetchInterval: 10000,
  });
}
