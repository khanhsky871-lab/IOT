import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import SensorView from './views/SensorView';
import HistoryView from './views/HistoryView';
import ProfileView from './views/ProfileView';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex bg-[#060913] text-gray-100 font-sans">
      {/* Sidebar cố định nền đen */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* Nội dung trang theo tab */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {currentTab === 'dashboard' && <DashboardView />}
        {currentTab === 'sensor' && <SensorView />}
        {currentTab === 'history' && <HistoryView />}
        {currentTab === 'profile' && <ProfileView />}
      </main>
    </div>
  );
}