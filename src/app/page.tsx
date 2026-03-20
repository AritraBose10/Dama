'use client';

import React, { useState } from 'react';
import { HeaderStrip } from '@/components/layout/HeaderStrip';
import { FilterTabBar } from '@/components/layout/FilterTabBar';
import { TopActionButtons } from '@/components/layout/TopActionButtons';
import { PatientCardContainer } from '@/components/dashboard/PatientCards';
import { PatientGrid } from '@/components/dashboard/PatientGrid';
import { PendingRail } from '@/components/dashboard/PendingRail';
import { LAWPanel } from '@/components/dashboard/LawPanel';
import { SepsisWatch } from '@/components/dashboard/SepsisWatch';
import { PatientEntryModal } from '@/components/dashboard/PatientEntryModal';
import { usePatients } from '@/hooks/usePatients';

export default function EDCommandPage() {
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const { patients } = usePatients();
  
  // Find highest risk sepsis patient dynamically
  const sepsisPatient = patients.find(p => p.sepsis_watch) || patients[0];

  return (
    <main className="flex flex-col h-screen bg-cliniq-navy overflow-hidden">
      {/* Fixed Header Area */}
      <HeaderStrip />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopActionButtons onAddPatient={() => setIsEntryModalOpen(true)} />
          
          <div className="flex items-center justify-between pr-4 bg-cliniq-navy">
            <PatientCardContainer />
            {sepsisPatient && (
              <SepsisWatch 
                patientInitials={sepsisPatient.initials}
                lactateValue={sepsisPatient.sepsis_watch ? "4.2" : "--"}
                bundleClockStartedAt={sepsisPatient.sepsis_bundle_started_at || new Date().toISOString()}
              />
            )}
          </div>
          
          <FilterTabBar />
          
          <PatientGrid />
          
          <LAWPanel />
        </div>

        {/* Right Rail - Mocked for now but structure is ready */}
        <PendingRail 
          imaging={[]}
          labs={[]}
          consults={[]}
        />
      </div>

      <PatientEntryModal 
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
      />
    </main>
  );
}
