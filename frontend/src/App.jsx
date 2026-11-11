import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import SensorView from './views/SensorView';
import HistoryView from './views/HistoryView';
import ProfileView from './views/ProfileView';
import LoginView from './views/LoginView';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token || !savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex bg-[#060913] text-gray-100 font-sans">
      {/* Sidebar cố định nền đen */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
      />

      {/* Nội dung trang theo tab */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {currentTab === 'dashboard' && <DashboardView user={user} onLogout={handleLogout} />}
        {currentTab === 'sensor' && <SensorView onLogout={handleLogout} />}
        {currentTab === 'history' && <HistoryView onLogout={handleLogout} />}
        {currentTab === 'profile' && <ProfileView user={user} onLogout={handleLogout} />}
      </main>
    </div>
  );
}