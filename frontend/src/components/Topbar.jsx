import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';
const DISCONNECT_TIMEOUT_MS = 3000; // 
// Giữ trạng thái dùng chung khi chuyển qua lại giữa các tab
const espMonitor = {
  status: 'checking', // 'checking' | 'connected' | 'disconnected'
  lastRecordKey: null,
  lastChangeAt: Date.now(),
  hasSeenNewData: false,
  lastToken: null
};

const listeners = new Set();
let pollTimer = null;

function notifyListeners() {
  listeners.forEach((fn) => fn(espMonitor.status));
}

async function checkEspConnection() {
  const token = localStorage.getItem('token');
  if (!token) {
    espMonitor.status = 'disconnected';
    notifyListeners();
    return;
  }

  // Nếu vừa đăng nhập lại bằng token mới thì reset bộ đếm
  if (token !== espMonitor.lastToken) {
    espMonitor.lastToken = token;
    espMonitor.status = 'checking';
    espMonitor.lastRecordKey = null;
    espMonitor.lastChangeAt = Date.now();
    espMonitor.hasSeenNewData = false;
    notifyListeners();
  }

  try {
    const res = await fetch(`${API_BASE}/sensors/data?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      espMonitor.status = 'disconnected';
      notifyListeners();
      return;
    }

    const data = await res.json();
    const now = Date.now();

    if (Array.isArray(data) && data.length > 0) {
      const latest = data[0];
      const latestKey = latest.recordId ?? `${latest.id}-${latest.time}`;

      if (espMonitor.lastRecordKey === null) {
        espMonitor.lastRecordKey = latestKey;
        espMonitor.lastChangeAt = now;
        espMonitor.status = 'checking';
      } else if (latestKey !== espMonitor.lastRecordKey) {
        // Có dữ liệu mới từ ESP32 gửi lên
        espMonitor.lastRecordKey = latestKey;
        espMonitor.lastChangeAt = now;
        espMonitor.hasSeenNewData = true;
        espMonitor.status = 'connected';
      } else {
        // Không có dữ liệu mới -> kiểm tra quá ~6s chưa
        const elapsed = now - espMonitor.lastChangeAt;
        if (elapsed >= DISCONNECT_TIMEOUT_MS) {
          espMonitor.status = 'disconnected';
        } else {
          espMonitor.status = espMonitor.hasSeenNewData ? 'connected' : 'checking';
        }
      }
    } else if (now - espMonitor.lastChangeAt >= DISCONNECT_TIMEOUT_MS) {
      espMonitor.status = 'disconnected';
    }
  } catch {
    espMonitor.status = 'disconnected';
  }

  notifyListeners();
}

export default function Topbar({ title, user }) {
  const [imgError, setImgError] = useState(false);
  const [espStatus, setEspStatus] = useState(espMonitor.status);

  useEffect(() => {
    listeners.add(setEspStatus);

    if (!pollTimer) {
      checkEspConnection();
      pollTimer = setInterval(checkEspConnection, 2000);
    }

    return () => {
      listeners.delete(setEspStatus);
      // Khi đăng xuất (không còn Topbar nào mount) thì dừng poll và reset
      if (listeners.size === 0 && pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
        espMonitor.status = 'checking';
        espMonitor.lastRecordKey = null;
        espMonitor.lastChangeAt = Date.now();
        espMonitor.hasSeenNewData = false;
        espMonitor.lastToken = null;
      }
    };
  }, []);

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

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const statusBadge = {
    connected: {
      wrapper: 'bg-[#0d2826] border-[#144f45] text-[#22c55e]',
      dot: 'bg-emerald-400 animate-pulse',
      label: 'MQTT: CONNECTED'
    },
    checking: {
      wrapper: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400 animate-pulse',
      label: 'MQTT: CHECKING...'
    },
    disconnected: {
      wrapper: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-500',
      label: 'ESP32: DISCONNECTED'
    }
  }[espStatus];

  return (
    <header className="flex items-center justify-between pb-6 mb-2">
      <h2 className="text-2xl font-bold text-white tracking-wide">{title}</h2>
      
      <div className="flex items-center gap-4">
        {/* Trạng thái ESP32 / MQTT */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${statusBadge.wrapper}`}>
          <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`}></span>
          {statusBadge.label}
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
            {!imgError ? (
              <img
                src="/avatar.jpg"
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