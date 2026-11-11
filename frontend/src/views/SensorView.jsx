import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { Search, Copy, Check, ArrowUpDown } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

export default function SensorView({ onLogout }) {
  const [search, setSearch] = useState('');
  const [searchTarget, setSearchTarget] = useState('All');
  const [sortOrder, setSortOrder] = useState('none'); // 'none' | 'asc' | 'desc'

  // Phân trang & PageSize
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State lưu danh sách lịch sử cảm biến từ Backend
  const [sensorData, setSensorData] = useState([]);

  // State quản lý hiệu ứng đã copy cho từng dòng
  const [copiedTime, setCopiedTime] = useState(null);

  const handleCopy = (timeStr, rowKey) => {
    navigator.clipboard.writeText(timeStr);
    setCopiedTime(rowKey);
    setTimeout(() => {
      setCopiedTime(null);
    }, 1500);
  };

  // Gọi API lấy dữ liệu cảm biến từ SQL Server (có kèm JWT Token)
  const fetchSensorHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/sensors/data?limit=500`, {
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
        setSensorData(
          data.map((item) => ({
            id: item.id,
            type: item.type,
            value: String(item.value),
            unit: item.unit,
            status: item.status,
            time: item.time
          }))
        );
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu cảm biến:', error);
    }
  };

  useEffect(() => {
    fetchSensorHistory();
    const interval = setInterval(fetchSensorHistory, 2000);
    return () => clearInterval(interval);
  }, []);

  // 1. Lọc và tìm kiếm dữ liệu
  const filteredSensors = sensorData.filter((row) => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return true;

    if (searchTarget === '°C') {
      return row.unit === '°C' && (row.value.toLowerCase().includes(trimmed) || row.id.toLowerCase().includes(trimmed) || row.time.toLowerCase().includes(trimmed));
    }
    if (searchTarget === '%') {
      return row.unit === '%' && (row.value.toLowerCase().includes(trimmed) || row.id.toLowerCase().includes(trimmed) || row.time.toLowerCase().includes(trimmed));
    }
    if (searchTarget === 'lx') {
      return row.unit === 'lx' && (row.value.toLowerCase().includes(trimmed) || row.id.toLowerCase().includes(trimmed) || row.time.toLowerCase().includes(trimmed));
    }
    if (searchTarget === 'Time') {
      return row.time.toLowerCase().includes(trimmed);
    }

    return (
      row.id.toLowerCase().includes(trimmed) ||
      row.type.toLowerCase().includes(trimmed) ||
      row.value.toLowerCase().includes(trimmed) ||
      row.unit.toLowerCase().includes(trimmed) ||
      row.time.toLowerCase().includes(trimmed)
    );
  });

  // 2. Sắp xếp theo giá trị (Value)
  const sortedSensors = [...filteredSensors].sort((a, b) => {
    if (sortOrder === 'none') return 0;
    const valA = parseFloat(a.value) || 0;
    const valB = parseFloat(b.value) || 0;
    if (sortOrder === 'asc') {
      return valA - valB;
    } else if (sortOrder === 'desc') {
      return valB - valA;
    }
    return 0;
  });

  // Phân trang theo pageSize
  const totalPages = Math.ceil(sortedSensors.length / pageSize) || 1;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = sortedSensors.slice(indexOfFirstItem, indexOfLastItem);

  const startRecord = sortedSensors.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRecord = Math.min(indexOfLastItem, sortedSensors.length);

  const getPlaceholder = () => {
    switch (searchTarget) {
      case '°C':
        return 'Nhập giá trị nhiệt độ cần tìm (°C)...';
      case '%':
        return 'Nhập giá trị độ ẩm cần tìm (%)...';
      case 'lx':
        return 'Nhập giá trị ánh sáng cần tìm (lx)...';
      case 'Time':
        return 'Nhập ngày giờ cần tìm (vd: 03/11/2026)...';
      default:
        return 'Tìm kiếm ID, loại cảm biến, giá trị, thời gian...';
    }
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      <Topbar title="Live Data Sensors" />

      {/* Bảng dữ liệu cảm biến */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-0 my-2">
        {/* Thanh tìm kiếm, chọn tiêu chí & Sắp xếp theo giá trị */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={15} />
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={searchTarget}
              onChange={(e) => {
                setSearchTarget(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All</option>
              <option value="°C">°C</option>
              <option value="%">%</option>
              <option value="lx">lx</option>
              <option value="Time">Time</option>
            </select>
          </div>

          {/* Bộ chọn kiểu sắp xếp theo giá trị */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <ArrowUpDown size={14} /> Sort Value:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="none">Mặc định</option>
              <option value="asc">Tăng dần (Low to High)</option>
              <option value="desc">Giảm dần (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-gray-500 uppercase tracking-wider">
                <th className="pb-2.5 px-4">Sensor ID</th>
                <th className="pb-2.5 px-4">Sensor Type</th>
                <th className="pb-2.5 px-4">Current Value</th>
                <th className="pb-2.5 px-4">Unit</th>
                <th className="pb-2.5 px-4">Status</th>
                <th className="pb-2.5 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50 text-gray-300">
              {currentItems.map((row, index) => {
                const rowKey = `${row.id}-${row.time}-${index}`;
                return (
                  <tr key={rowKey} className="hover:bg-[#15203b]/40 transition">
                    <td className="py-2.5 px-4 font-mono font-semibold text-white">{row.id}</td>
                    <td className="py-2.5 px-4">{row.type}</td>
                    <td className="py-2.5 px-4 font-semibold text-white">{row.value}</td>
                    <td className="py-2.5 px-4 text-gray-400">{row.unit}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'Normal'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-gray-400">
                      <div className="inline-flex items-center gap-2">
                        <span>{row.time}</span>
                        <button
                          onClick={() => handleCopy(row.time, rowKey)}
                          title="Copy time"
                          className="p-1 hover:bg-[#1e293b] rounded text-gray-400 hover:text-white transition cursor-pointer"
                        >
                          {copiedTime === rowKey ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedSensors.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Chưa có dữ liệu hoặc không tìm thấy bản ghi phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh phân trang & chọn PageSize */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-[#1e293b] shrink-0">
          <div className="flex items-center gap-3">
            <span>
              Showing {startRecord}-{endRecord} of {sortedSensors.length} records
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-[#1e293b]">
              <span className="text-[11px] text-gray-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#0a0f1d] border border-[#1e293b] rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-2.5 py-1 rounded hover:bg-[#1e293b] hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-6 h-6 flex items-center justify-center rounded-md transition font-medium ${
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
              className="px-2.5 py-1 rounded hover:bg-[#1e293b] hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}