import React, { useState } from 'react';
import Topbar from '../components/Topbar';

export default function ProfileView() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyTelegram, setNotifyTelegram] = useState(false);

  const studentInfo = {
    name: 'Đinh Gia Khánh',
    msv: 'B21DCCN424',
    avatarUrl: '/avatar.jpg'
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      {/* Header thanh điều hướng trên cùng */}
      <Topbar title="System Identity & Settings" />

      {/* VÙNG NỘI DUNG CHÍNH (Chiếm trọn phần chiều cao còn lại) */}
      <div className="flex-1 flex flex-col justify-between gap-3 py-2 min-h-0">
        
        {/* 1. HÀNG TRÊN: 2 CỘT (IDENTITY VÀ AUTHENTICATION) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
          
          {/* Khung Identity Badges: Tinh gọn padding p-4 */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              IDENTITY BADGES
            </h4>

            <div className="flex items-center gap-3.5 my-1">
              <div className="relative shrink-0">
                <img
                  src={studentInfo.avatarUrl}
                  alt={studentInfo.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                  }}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#334155] shadow-md shadow-blue-500/10"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{studentInfo.name}</h3>
                <div className="mt-1">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-semibold border border-blue-500/30">
                    MSV: {studentInfo.msv}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2.5 border-t border-[#1e293b]/60">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                SYS ADMIN
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE AGENT
              </span>
            </div>
          </div>

          {/* Khung Access & Authentication */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between">
            <h4 className="text-xs font-semibold text-white mb-2">Access & Authentication</h4>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">Verify Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#1e293b]/60 space-y-1.5">
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                NOTIFICATION PREFERENCES
              </span>
              
              <div className="flex items-center justify-between text-[11px] text-gray-300">
                <span>Alert me via email on critical thresholds</span>
                <button 
                  type="button"
                  onClick={() => setNotifyEmail(!notifyEmail)}
                  className={`w-8 h-4 rounded-full transition-colors relative p-0.5 flex items-center ${notifyEmail ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${notifyEmail ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-300">
                <span>Telegram SMS broker notifications</span>
                <button 
                  type="button"
                  onClick={() => setNotifyTelegram(!notifyTelegram)}
                  className={`w-8 h-4 rounded-full transition-colors relative p-0.5 flex items-center ${notifyTelegram ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${notifyTelegram ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 2. HÀNG DƯỚI: 4 KHUNG TRỐNG (2 TRÊN - 2 DƯỚI, TỰ ĐỘNG CO GIÃN THEO CHIỀU CAO MÀN HÌNH) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
          
          {/* Khung trống 1 */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              KHUNG TRỐNG 1
            </span>
            <p className="text-[10px] text-gray-500 mt-0.5">Chưa có nội dung</p>
          </div>

          {/* Khung trống 2 */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
             Link figma
            </span>
            <p className="text-[10px] text-gray-500 mt-0.5">https://www.figma.com/design/ZGTjqCwrUKG8XCWyb4367P/IOT?node-id=0-1&t=bRbg4l7aFHaBwXuq-1</p>
          </div>

          {/* Khung trống 3 */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              KHUNG TRỐNG 3
            </span>
            <p className="text-[10px] text-gray-500 mt-0.5">Chưa có nội dung</p>
          </div>

          {/* Khung trống 4 */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              KHUNG TRỐNG 4
            </span>
            <p className="text-[10px] text-gray-500 mt-0.5">Chưa có nội dung</p>
          </div>

        </div>

      </div>
    </div>
  );
}