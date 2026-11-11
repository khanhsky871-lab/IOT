import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export default function Topbar({ title, user }) {
  const [imgError, setImgError] = useState(false);

  // Lấy thông tin user từ prop hoặc localStorage để mọi tab đều hiển thị chuẩn
  const currentUser = user || (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const fullName = currentUser?.fullName || 'Đinh Gia Khánh';
  const subText = currentUser?.studentId
    ? `${currentUser.studentId}${currentUser.className ? ` • ${currentUser.className}` : ''}`
    : 'SYS ADMIN';

  // Lấy 2 chữ cái viết tắt từ họ tên làm fallback khi chưa có ảnh
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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
            <p className="text-xs font-semibold text-white leading-tight">{fullName}</p>
            <p className="text-[11px] text-gray-400 font-mono">{subText}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 border border-gray-600 overflow-hidden flex items-center justify-center text-white font-bold text-xs shrink-0">
            {currentUser?.avatarUrl && !imgError ? (
              <img
                src={currentUser.avatarUrl}
                alt={fullName}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(fullName)
            )}
          </div>
        </div>
      </div>
    </header>
  );
}