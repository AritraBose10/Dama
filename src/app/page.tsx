'use client';

import React, { useState } from 'react';
import { HeaderStrip } from '@/components/layout/HeaderStrip';
import { FilterTabBar, FilterTab } from '@/components/layout/FilterTabBar';
import { TopActionButtons } from '@/components/layout/TopActionButtons';
import { PatientCardContainer } from '@/components/dashboard/PatientCards';
import { PatientGrid } from '@/components/dashboard/PatientGrid';
import { PendingRail } from '@/components/dashboard/PendingRail';
import { LAWPanel } from '@/components/dashboard/LawPanel';
import { SepsisWatch } from '@/components/dashboard/SepsisWatch';
import { mockImaging, mockLabs, mockConsults } from '@/lib/mockData';

export default function EDCommandPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL PATIENTS');

  return (
    <main className="flex flex-col h-screen bg-cliniq-navy overflow-hidden">
      {/* Fixed Header Area */}
      <HeaderStrip />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopActionButtons />
          
          <div className="flex items-center justify-between pr-4 bg-cliniq-navy">
            <PatientCardContainer />
            <SepsisWatch 
              patientInitials="R.T."
              lactateValue="4.2"
              bundleClockStartedAt={new Date(Date.now() - 1800000).toISOString()}
            />
          </div>
          
          <FilterTabBar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <PatientGrid />
          
          <LAWPanel />
        </div>

        {/* Right Rail */}
        <PendingRail 
          imaging={mockImaging}
          labs={mockLabs}
          consults={mockConsults}
        />
      </div>
    </main>
  );
}
