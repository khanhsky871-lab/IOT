import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { Thermometer, Droplets, Sun, Lightbulb, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

export default function DashboardView({ user, onLogout }) {
  // State thông số cảm biến hiện tại
  const [currentMetrics, setCurrentMetrics] = useState({
    temp: 24.8,
    humidity: 58.2,
    light: 720
  });

  // State mảng lịch sử điểm vẽ biểu đồ (tối đa 12 điểm gần nhất)
  const [chartHistory, setChartHistory] = useState([
    { time: '08:00:00', temp: 24, humidity: 55, light: 600 },
    { time: '08:00:02', temp: 25, humidity: 58, light: 650 },
    { time: '08:00:04', temp: 24.8, humidity: 58.2, light: 720 }
  ]);

  // State trạng thái đèn & hiệu ứng chờ 0.5s
  const [lights, setLights] = useState({ light1: false, light2: false });
  const [loadingLight, setLoadingLight] = useState({ light1: false, light2: false });

  // 1. Lấy trạng thái Đèn ban đầu từ Backend
  const fetchDeviceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/devices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        onLogout?.();
        return;
      }
      if (res.ok) {
        const devices = await res.json();
        const d1 = devices.find((d) => d.id === 1);
        const d2 = devices.find((d) => d.id === 2);
        setLights({
          light1: d1 ? d1.currentStatus === 'ON' : false,
          light2: d2 ? d2.currentStatus === 'ON' : false
        });
      }
    } catch (err) {
      console.error('Lỗi tải trạng thái thiết bị:', err);
    }
  };

  // 2. Lấy dữ liệu cảm biến mới nhất để cập nhật Thẻ & Biểu đồ
  const fetchLatestSensors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/sensors/data?limit=30`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        onLogout?.();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const latestTemp = data.find((d) => d.unit === '°C')?.value ?? currentMetrics.temp;
          const latestHumid = data.find((d) => d.unit === '%')?.value ?? currentMetrics.humidity;
          const latestLight = data.find((d) => d.unit === 'lx')?.value ?? currentMetrics.light;
          const latestTime = data[0]?.time?.split(' ')[1] || new Date().toLocaleTimeString();

          setCurrentMetrics({
            temp: latestTemp,
            humidity: latestHumid,
            light: latestLight
          });

          setChartHistory((prev) => {
            const lastPoint = prev[prev.length - 1];
            if (lastPoint && lastPoint.time === latestTime) return prev;
            const updated = [
              ...prev,
              { time: latestTime, temp: latestTemp, humidity: latestHumid, light: latestLight }
            ];
            return updated.slice(-12); // Giữ 12 mốc thời gian gần nhất trên đồ thị
          });
        }
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu cảm biến:', err);
    }
  };

  useEffect(() => {
    fetchDeviceStatus();
    fetchLatestSensors();

    // Tự động làm mới mỗi 2 giây khớp với chu kỳ gửi của ESP32
    const interval = setInterval(() => {
      fetchLatestSensors();
      fetchDeviceStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 3. Hàm gửi lệnh Bật/Tắt đèn xuống Backend -> MQTT -> ESP32
  const handleToggleLight = async (lightKey) => {
    if (loadingLight[lightKey]) return;

    const deviceId = lightKey === 'light1' ? 1 : 2;
    const nextState = !lights[lightKey];
    const actionText = nextState ? 'Turn on' : 'Turn off';

    // Bật hiệu ứng loading 0.5s
    setLoadingLight((prev) => ({ ...prev, [lightKey]: true }));

    // Lấy token đã lưu khi đăng nhập
    const token = localStorage.getItem('token');

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/devices/control`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            deviceId: deviceId,
            userId: user?.id || 1,
            action: actionText,
            triggerBy: 'Web Dashboard'
          })
        });

        if (res.status === 401 || res.status === 403) {
          onLogout?.();
          return;
        }

        if (res.ok) {
          setLights((prev) => ({ ...prev, [lightKey]: nextState }));
        } else {
          console.error('Lỗi phản hồi từ server:', res.status);
        }
      } catch (err) {
        console.error('Lỗi điều khiển đèn:', err);
      } finally {
        setLoadingLight((prev) => ({ ...prev, [lightKey]: false }));
      }
    }, 500);
  };

  // Hàm tính tọa độ đường Polyline SVG cho biểu đồ
  const buildPolyline = (key, maxVal) => {
    if (chartHistory.length === 0) return '';
    return chartHistory
      .map((pt, idx) => {
        const x = (idx / Math.max(chartHistory.length - 1, 1)) * 660 + 20;
        const val = Math.min(Math.max(Number(pt[key]) || 0, 0), maxVal);
        const y = 200 - (val / maxVal) * 160;
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      <Topbar title="Dashboard" />

      {/* 1. Hàng 3 Thẻ Cảm Biến Thời Gian Thực */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2 shrink-0">
        {/* Nhiệt độ */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Temperature</span>
            <div className="text-2xl font-bold text-white mt-1">
              {currentMetrics.temp} <span className="text-sm font-normal text-gray-400">°C</span>
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {currentMetrics.temp > 35 ? 'High' : 'Normal'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Thermometer size={24} />
          </div>
        </div>

        {/* Độ ẩm */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Humidity</span>
            <div className="text-2xl font-bold text-white mt-1">
              {currentMetrics.humidity} <span className="text-sm font-normal text-gray-400">%</span>
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Normal
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Droplets size={24} />
          </div>
        </div>

        {/* Ánh sáng */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Light Intensity</span>
            <div className="text-2xl font-bold text-white mt-1">
              {currentMetrics.light} <span className="text-sm font-normal text-gray-400">lx</span>
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {currentMetrics.light > 700 ? 'High' : 'Normal'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Sun size={24} />
          </div>
        </div>
      </div>

      {/* 2. Khu vực Biểu đồ & Bảng điều khiển Đèn */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 py-1">
        {/* Biểu đồ Telemetry (Chiếm 2 cột) */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Real-time Telemetry Stream</h3>
              <p className="text-[11px] text-gray-400">Live MQTT data from ESP32</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Temp (°C)
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Humid (%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Light (lx)
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <svg viewBox="0 0 700 220" className="w-full h-full overflow-visible">
              {/* Lưới ngang */}
              {[40, 80, 120, 160, 200].map((y) => (
                <line key={y} x1="20" y1={y} x2="680" y2={y} stroke="#1e293b" strokeDasharray="4 4" />
              ))}

              {/* Đường biểu diễn Nhiệt độ (max 50°C) */}
              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                points={buildPolyline('temp', 50)}
              />

              {/* Đường biểu diễn Độ ẩm (max 100%) */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points={buildPolyline('humidity', 100)}
              />

              {/* Đường biểu diễn Ánh sáng (max 4095 theo ADC ESP32) */}
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                points={buildPolyline('light', 4095)}
              />
            </svg>
          </div>

          {/* Nhãn thời gian dưới trục X */}
          <div className="flex justify-between text-[10px] text-gray-500 font-mono pt-2 border-t border-[#1e293b]">
            {chartHistory.map((pt, i) => (
              <span key={i}>{pt.time}</span>
            ))}
          </div>
        </div>

        {/* Khung Điều khiển Bật/Tắt Đèn (Chiếm 1 cột) */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Actuator Controls</h3>
            <p className="text-[11px] text-gray-400 mb-5">Control ESP32 GPIO Relays via MQTT</p>

            <div className="space-y-4">
              {/* Đèn 1 (GPIO 2) */}
              <div className="p-4 bg-[#0a0f1d] border border-[#1e293b] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl transition ${
                      lights.light1
                        ? 'bg-amber-400/20 text-amber-300 shadow-lg shadow-amber-500/20'
                        : 'bg-[#1e293b] text-gray-500'
                    }`}
                  >
                    <Lightbulb size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Đèn 1</h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      PIN: GPIO2 • {lights.light1 ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleLight('light1')}
                  disabled={loadingLight.light1}
                  className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
                    lights.light1 ? 'bg-blue-600' : 'bg-gray-700'
                  } ${loadingLight.light1 ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                >
                  {loadingLight.light1 ? (
                    <Loader2 size={14} className="text-white animate-spin mx-auto" />
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        lights.light1 ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Đèn 2 (GPIO 18) */}
              <div className="p-4 bg-[#0a0f1d] border border-[#1e293b] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl transition ${
                      lights.light2
                        ? 'bg-amber-400/20 text-amber-300 shadow-lg shadow-amber-500/20'
                        : 'bg-[#1e293b] text-gray-500'
                    }`}
                  >
                    <Lightbulb size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Đèn 2</h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      PIN: GPIO18 • {lights.light2 ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleLight('light2')}
                  disabled={loadingLight.light2}
                  className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
                    lights.light2 ? 'bg-blue-600' : 'bg-gray-700'
                  } ${loadingLight.light2 ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                >
                  {loadingLight.light2 ? (
                    <Loader2 size={14} className="text-white animate-spin mx-auto" />
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        lights.light2 ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0a0f1d] border border-[#1e293b] rounded-xl text-[11px] text-gray-400 font-mono">
            Broker: 10.141.148.137:1883
          </div>
        </div>
      </div>
    </div>
  );
}