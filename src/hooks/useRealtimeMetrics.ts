import { usePatients } from './usePatients';
import { Patient } from '@/types';

export function useRealtimeMetrics() {
  const { patients } = usePatients();

  // Derived metrics from live patient data
  const waitingCount = patients.filter((p: Patient) => p.status === 'WAITING' || p.is_waiting_room).length;
  const boardingCount = patients.filter((p: Patient) => p.status === 'BOARDING').length;
  const arrivalsNextHour = 4; // Mock logic or separate table subscribe
  const pndBoard = patients.filter((p: Patient) => p.status === 'DISPO_READY').length;

  return {
    waiting: waitingCount,
    boarding: boardingCount,
    arrivals: arrivalsNextHour,
    pndBoard,
    roomed: patients.filter((p: Patient) => p.status === 'ROOMED').length,
    total: patients.length,
  };
}
