import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import GaugeMeter from '../components/GaugeMeter';
import { Search } from 'lucide-react';

export default function SensorView() {
  const [search, setSearch] = useState('');
  const [searchTarget, setSearchTarget] = useState('All'); 

  // Phân trang: 10 mục / trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dữ liệu ban đầu
  const sensorData = [
    { id: 'SEN-01', type: 'Temperature', value: '24.8', unit: '°C', status: 'Normal', time: '21/08/2026 08:00:00' },
    { id: 'SEN-02', type: 'Humidity', value: '58.2', unit: '%', status: 'Normal', time: '21/08/2026 08:00:00' },
    { id: 'SEN-03', type: 'Light intensity', value: '720.0', unit: 'lx', status: 'High', time: '21/08/2026 08:00:00' },
    { id: 'SEN-01', type: 'Temperature', value: '30.0', unit: '°C', status: 'Normal', time: '21/08/2026 08:01:00' },
    { id: 'SEN-02', type: 'Humidity', value: '58.2', unit: '%', status: 'Normal', time: '21/08/2026 08:01:00' },
    { id: 'SEN-03', type: 'Light intensity', value: '725.0', unit: 'lx', status: 'High', time: '21/08/2026 08:01:00' },
    { id: 'SEN-01', type: 'Temperature', value: '24.8', unit: '°C', status: 'Normal', time: '21/08/2026 08:02:00' },
    { id: 'SEN-02', type: 'Humidity', value: '60.0', unit: '%', status: 'Normal', time: '21/08/2026 08:02:00' },
    { id: 'SEN-03', type: 'Light intensity', value: '750.0', unit: 'lx', status: 'High', time: '21/08/2026 08:02:00' },
    { id: 'SEN-01', type: 'Temperature', value: '26.4', unit: '°C', status: 'Normal', time: '21/08/2026 08:03:00' },
    { id: 'SEN-02', type: 'Humidity', value: '62.1', unit: '%', status: 'Normal', time: '21/08/2026 08:03:00' },
    { id: 'SEN-03', type: 'Light intensity', value: '710.0', unit: 'lx', status: 'High', time: '21/08/2026 08:03:00' },
    { id: 'SEN-01', type: 'Temperature', value: '25.0', unit: '°C', status: 'Normal', time: '21/08/2026 08:04:00' },
    { id: 'SEN-02', type: 'Humidity', value: '57.4', unit: '%', status: 'Normal', time: '21/08/2026 08:04:00' },
    { id: 'SEN-03', type: 'Light intensity', value: '730.0', unit: 'lx', status: 'High', time: '21/08/2026 08:04:00' },
  ];

  const filteredSensors = sensorData.filter((row) => {
    const trimmed = search.trim().toLowerCase();

    // Nếu ô tìm kiếm rỗng
    if (!trimmed) {
      return true;
    }

    // Dropdown đóng vai trò là phạm vi/điều kiện ưu tiên tìm kiếm
    if (searchTarget === '°C') {
      // Chỉ tìm trong các dòng có đơn vị là °C (so khớp giá trị, ID hoặc thời gian của dòng °C)
      return row.unit === '°C' && (row.value.includes(trimmed) || row.id.toLowerCase().includes(trimmed) || row.time.includes(trimmed));
    }

    if (searchTarget === '%') {
      // Chỉ tìm trong các dòng có đơn vị là %
      return row.unit === '%' && (row.value.includes(trimmed) || row.id.toLowerCase().includes(trimmed) || row.time.includes(trimmed));
    }

    if (searchTarget === 'lx') {
      // Chỉ tìm trong các dòng có đơn vị là lx
      return row.unit === 'lx' && (row.value.includes(trimmed) || row.id.toLowerCase().includes(trimmed) || row.time.includes(trimmed));
    }

    if (searchTarget === 'Time') {
      // Chỉ so khớp với cột thời gian
      return row.time.toLowerCase().includes(trimmed);
    }

    // Trường hợp 'All': Tìm kiếm tự do trên tất cả các cột
    return (
      row.id.toLowerCase().includes(trimmed) ||
      row.type.toLowerCase().includes(trimmed) ||
      row.value.includes(trimmed) ||
      row.unit.toLowerCase().includes(trimmed) ||
      row.time.includes(trimmed)
    );
  });

  // Logic phân trang 
  const totalPages = Math.ceil(filteredSensors.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSensors.slice(indexOfFirstItem, indexOfLastItem);

  const startRecord = filteredSensors.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRecord = Math.min(indexOfLastItem, filteredSensors.length);

  // Hiển thị gợi ý placeholder tương ứng theo tiêu chí đã chọn
  const getPlaceholder = () => {
    switch (searchTarget) {
      case '°C':
        return 'Nhập giá trị nhiệt độ cần tìm (°C)...';
      case '%':
        return 'Nhập giá trị độ ẩm cần tìm (%)...';
      case 'lx':
        return 'Nhập giá trị ánh sáng cần tìm (lx)...';
      case 'Time':
        return 'Nhập ngày giờ cần tìm (vd: 21/08/2026)...';
      default:
        return 'Tìm kiếm ID, loại cảm biến, giá trị, thời gian...';
    }
  };

  return (
    <div>
      <Topbar title="Live Data Sensors" />

      {/* 1. Hàng Gauges bán nguyệt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <GaugeMeter value={24.8} max={50} unit="°C" label="DHT22 Temp" color="#22c55e" />
        <GaugeMeter value={58.2} max={100} unit="%" label="DHT22 Humid" color="#3b82f6" />
        <GaugeMeter value={720} max={1000} unit="lx" label="BH1750 Lux" color="#ef4444" />
      </div>

      {/* 2. Bảng dữ liệu cảm biến */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
        {/* Bộ lọc phạm vi tìm kiếm & Thanh nhập */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder={getPlaceholder()}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset trang khi bắt đầu nhập
              }}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dropdown chọn tiêu chí */}
          <select
            value={searchTarget}
            onChange={(e) => {
              setSearchTarget(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All</option>
            <option value="°C">°C</option>
            <option value="%">%</option>
            <option value="lx"> lx</option>
            <option value="Time">Time</option>
          </select>
        </div>

        {/* Bảng dữ liệu (Hiển thị đầy đủ ban đầu, 10 dòng/trang) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-gray-500 uppercase tracking-wider">
                <th className="pb-3 px-4">Sensor ID</th>
                <th className="pb-3 px-4">Sensor Type</th>
                <th className="pb-3 px-4">Current Value</th>
                <th className="pb-3 px-4">Unit</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50 text-gray-300">
              {currentItems.map((row, index) => (
                <tr key={`${row.id}-${row.time}-${index}`} className="hover:bg-[#15203b]/40 transition">
                  <td className="py-4 px-4 font-mono font-semibold text-white">{row.id}</td>
                  <td className="py-4 px-4">{row.type}</td>
                  <td className="py-4 px-4 font-semibold text-white">{row.value}</td>
                  <td className="py-4 px-4 text-gray-400">{row.unit}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        row.status === 'Normal' || row.status === 'Nomal'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-400">{row.time}</td>
                </tr>
              ))}
              {filteredSensors.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Không tìm thấy dữ liệu cảm biến phù hợp với từ khóa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh điều hướng phân trang (10 mục/trang) */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-6 pt-4 border-t border-[#1e293b]">
          <span>
            Showing {startRecord}-{endRecord} of {filteredSensors.length} records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-2.5 py-1 rounded hover:bg-[#1e293b] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition cursor-pointer disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition font-medium ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-gray-400 hover:bg-[#1e293b] hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-2.5 py-1 rounded hover:bg-[#1e293b] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition cursor-pointer disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}