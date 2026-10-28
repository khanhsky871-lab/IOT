import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import { Thermometer, Droplets, SunMedium, Lightbulb, Loader2 } from 'lucide-react';

export default function DashboardView() {

  const [lights, setLights] = useState({ light1: false, light2: true });


  const [loadingLights, setLoadingLights] = useState({ light1: false, light2: false });

  // Hàm xử lý bật/tắt 
  const handleToggleLight = (lightKey) => {

    if (loadingLights[lightKey]) return;

    // 1. Kích hoạt loading
    setLoadingLights((prev) => ({ ...prev, [lightKey]: true }));

    // 2. Chờ 0.5s
    setTimeout(() => {
      setLights((prev) => ({ ...prev, [lightKey]: !prev[lightKey] }));
      setLoadingLights((prev) => ({ ...prev, [lightKey]: false }));
    }, 500);
  };

  return (
    <div>
      <Topbar title="Dashboard" />

      {/* 3 Card chỉ số môi trường */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Nhiệt độ</p>
            <h3 className="text-2xl font-bold text-white mt-1">24.8°C</h3>
            <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
              +0.4°C <span className="text-gray-500 font-normal">vs last hour</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#142928] text-emerald-400 flex items-center justify-center">
            <Thermometer size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Độ ẩm</p>
            <h3 className="text-2xl font-bold text-white mt-1">58.2%</h3>
            <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
              -1.2% <span className="text-gray-500 font-normal">vs last hour</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#142928] text-teal-400 flex items-center justify-center">
            <Droplets size={20} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Ánh sáng</p>
            <h3 className="text-2xl font-bold text-white mt-1">720 lx</h3>
            <p className="text-[11px] text-rose-500 mt-1 font-semibold">
              Critical High <span className="text-gray-500 font-normal">vs last hour</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2b1820] text-rose-400 flex items-center justify-center">
            <SunMedium size={20} />
          </div>
        </div>
      </div>

      {/* 2. Biểu đồ Telemetry & Khối Light Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Telemetry */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="font-semibold text-white text-base">Real-Time Telemetry Trend</h4>
              <p className="text-xs text-gray-500">System sensors plotted every 2 seconds</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ánh sáng
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Nhiệt độ
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Độ ẩm
              </span>
            </div>
          </div>

          <div className="w-full h-56 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="600" y2="160" stroke="#1e293b" strokeDasharray="4 4" />

              <path d="M 0 130 Q 100 110 200 120 T 300 80 T 400 100 T 500 70 T 600 60" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
              <path d="M 0 150 Q 100 130 200 145 T 300 110 T 400 130 T 500 95 T 600 85" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
              <path d="M 0 170 Q 100 155 200 165 T 300 130 T 400 150 T 500 120 T 600 95" fill="none" stroke="#eab308" strokeWidth="2.5" />
            </svg>
            <div className="flex justify-between text-[11px] text-gray-500 mt-3 px-1 font-mono">
              <span>14:00</span>
              <span>14:10</span>
              <span>14:20</span>
              <span>14:30</span>
              <span>14:40</span>
              <span>14:50</span>
            </div>
          </div>
        </div>

        {/* Khối điều khiển đèn  */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-white text-base mb-4">Light Controls</h4>
            <div className="space-y-4">
              {[
                { key: 'light1', label: 'Đèn 1' },
                { key: 'light2', label: 'Đèn 2' },
              ].map(({ key, label }) => {
                const isOn = lights[key];
                const isLoading = loadingLights[key];

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3.5 bg-[#0a0f1d] rounded-xl border border-[#1e293b] transition"
                  >
                    <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isOn ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        <Lightbulb size={18} />
                      </div>
                      <span>{label}</span>
                      {isLoading && (
                        <span className="text-[11px] text-blue-400 flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" /> Chờ xíu...
                        </span>
                      )}
                    </div>

                    {/* Nút Switch có Loading */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleLight(key)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex items-center ${
                        isLoading
                          ? 'opacity-70 cursor-not-allowed bg-blue-900/60'
                          : isOn
                          ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                          : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                      }`}
                    >
                      {/* Trục trượt: Nếu đang loading thì hiện spinner, bình thường là chấm trắng */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200 ${
                          isOn ? 'translate-x-6' : 'translate-x-0'
                        } ${isLoading ? 'bg-blue-500 text-white' : 'bg-white'}`}
                      >
                        {isLoading && <Loader2 size={12} className="animate-spin text-white" />}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <p className="text-[11px] text-gray-500 mt-6 text-center">
          </p>
        </div>
      </div>
    </div>
  );
}