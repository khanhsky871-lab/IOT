import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  History as HistoryIcon, 
  User, 
  SunMoon, 
  LogOut, 
  Cpu 
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, isDarkMode, setIsDarkMode }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sensor', label: 'Data Sensor', icon: Layers },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-[#1a233a] flex flex-col justify-between p-4 select-none shrink-0">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            H
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Helix IoT</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Contra Industrial</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-[#1b253b] text-blue-400 font-semibold shadow-inner' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#121a2d]'
                }`}
              >
                <Icon size={19} className={active ? 'text-blue-400' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3 pt-4 border-t border-[#1a233a]">

        <button 
          onClick={() => alert("Disconnecting from broker...")}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
        >
          <LogOut size={18} />
          Disconnect
        </button>
      </div>
    </aside>
  );
}