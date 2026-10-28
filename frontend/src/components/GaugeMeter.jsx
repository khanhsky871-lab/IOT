import React from 'react';

export default function GaugeMeter({ value, max = 100, unit, label, color = "#22c55e" }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDashoffset = 251.2 - (percentage / 100) * 125.6;

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col items-center justify-between relative overflow-hidden">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{label}</span>
      
      <div className="relative w-44 h-24 flex items-end justify-center">
        <svg className="w-44 h-44 absolute -top-8 rotate-[135deg]" viewBox="0 0 100 100">
          {/* Vòng nền */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset="125.6"
            strokeLinecap="round"
          />
          {/* Vòng giá trị */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="text-center z-10 -mb-1">
          <div className="text-2xl font-bold text-white tracking-tight">
            {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">LIVE</span>
        </div>
      </div>
    </div>
  );
}
