import React from 'react';
import { Bell } from 'lucide-react';

export default function Topbar({ title }) {
  return (
    <header className="flex items-center justify-between pb-6 mb-2">
      <h2 className="text-2xl font-bold text-white tracking-wide">{title}</h2>
      
      <div className="flex items-center gap-4">
        {/* Trạng thái MQTT */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d2826] border border-[#144f45] text-[#22c55e] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          MQTT: CONNECTED
        </div>

        {/* Thông báo */}
        <div className="relative cursor-pointer p-2 rounded-lg hover:bg-[#1a233a] transition text-gray-400 hover:text-white">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            4
          </span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#1f293d]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight"></p>
            <p className="text-[11px] text-gray-400"></p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 border border-gray-600 overflow-hidden flex items-center justify-center text-white font-bold text-xs">
            SJ
          </div>
        </div>
      </div>
    </header>
  );
}