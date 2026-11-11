import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { Search, Download, Copy, Check } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

export default function HistoryView({ onLogout }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('All');
  const [selectedAction, setSelectedAction] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Phân trang & PageSize
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State lưu danh sách lịch sử từ Backend
  const [historyData, setHistoryData] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Gọi API lấy lịch sử từ Backend (có kèm Token bảo mật)
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/devices/history?limit=500`, {
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
        setHistoryData(
          data.map((item, index) => ({
            key: `${item.id || index}-${item.createdAt || index}`,
            deviceId: String(item.deviceId || item.device_id || '1'),
            name: item.deviceName || (item.deviceId == 2 ? 'Đèn 2' : 'Đèn 1'),
            action: item.action || 'Turn on',
            status: item.status || 'SUCCESS',
            time: item.createdAt || item.time || new Date().toLocaleString()
          }))
        );
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch sử thiết bị:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  // Lọc dữ liệu theo các tiêu chí tìm kiếm
  const filteredHistory = historyData.filter((row) => {
    const query = search.trim().toLowerCase();
    
    const matchSearch =
      !query ||
      row.deviceId.toLowerCase().includes(query) ||
      row.name.toLowerCase().includes(query) ||
      row.action.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query) ||
      row.time.toLowerCase().includes(query);

    const matchId = selectedId === 'All' || row.deviceId === selectedId;
    const matchAction = selectedAction === 'All' || row.action === selectedAction;
    const matchStatus = selectedStatus === 'All' || row.status === selectedStatus;

    return matchSearch && matchId && matchAction && matchStatus;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  const startRecord = filteredHistory.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRecord = Math.min(indexOfLastItem, filteredHistory.length);

  // Xuất file CSV báo cáo
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Device ID,Name,Action,Status,Time\n';
    filteredHistory.forEach((row) => {
      csvContent += `"${row.deviceId}","${row.name}","${row.action}","${row.status}","${row.time}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'iot_action_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      <Topbar title="History" />

      {/* Khung chính chứa bảng lịch sử */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-0 my-2">
        {/* Thanh tìm kiếm, bộ lọc và nút Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Search by time or device name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Lọc theo Device ID */}
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">ID: All</option>
              <option value="1">ID: 1</option>
              <option value="2">ID: 2</option>
            </select>

            {/* Lọc theo Action */}
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">Action: All</option>
              <option value="Turn on">Turn on</option>
              <option value="Turn off">Turn off</option>
            </select>

            {/* Lọc theo Status */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAIL">FAIL</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-blue-600 text-gray-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Bảng dữ liệu lịch sử */}
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-gray-500 uppercase tracking-wider">
                <th className="pb-2.5 px-4">Device ID</th>
                <th className="pb-2.5 px-4">Name</th>
                <th className="pb-2.5 px-4">Action</th>
                <th className="pb-2.5 px-4">Status</th>
                <th className="pb-2.5 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50 text-gray-300">
              {currentItems.map((row) => (
                <tr key={row.key} className="hover:bg-[#15203b]/40 transition">
                  <td className="py-2.5 px-4 font-mono font-semibold text-white">{row.deviceId}</td>
                  <td className="py-2.5 px-4 font-medium">{row.name}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        row.action === 'Turn on' ? 'text-amber-400 bg-amber-500/10' : 'text-gray-400 bg-gray-500/10'
                      }`}
                    >
                      {row.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'SUCCESS' || row.status === 'ON'
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
                        onClick={() => handleCopy(row.time, row.key)}
                        title="Copy time"
                        className="p-1 hover:bg-[#1e293b] rounded text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        {copiedKey === row.key ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Chưa có lịch sử bật/tắt thiết bị hoặc không tìm thấy bản ghi phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang & tùy chỉnh số lượng dòng */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-[#1e293b] shrink-0">
          <div className="flex items-center gap-3">
            <span>
              Showing {startRecord}-{endRecord} of {filteredHistory.length} records
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