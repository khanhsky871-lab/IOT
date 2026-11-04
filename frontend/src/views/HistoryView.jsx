import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { Search, Download, Copy, Check } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

export default function HistoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState('All');
  const [selectedAction, setSelectedAction] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Phân trang & PageSize
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Danh sách lịch sử bật tắt thiết bị từ Backend
  const [historyList, setHistoryList] = useState([]);

  // State quản lý hiệu ứng đã copy cho từng dòng
  const [copiedTime, setCopiedTime] = useState(null);

  const handleCopy = (timeStr, rowKey) => {
    navigator.clipboard.writeText(timeStr);
    setCopiedTime(rowKey);
    setTimeout(() => {
      setCopiedTime(null);
    }, 1500);
  };

  const fetchActionHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/devices/history?limit=500`);
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (error) {
      console.error('Lỗi tải lịch sử thiết bị:', error);
    }
  };

  useEffect(() => {
    fetchActionHistory();
    const interval = setInterval(fetchActionHistory, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Success
          </span>
        );
      case 'Fail':
      case 'Failed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Fail
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
            {status}
          </span>
        );
    }
  };

  // Lọc và tìm kiếm lịch sử thiết bị
  const filteredList = historyList.filter((item) => {
    const matchesSearch =
      (item.time && item.time.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesId = selectedId === 'All' || item.id === selectedId;
    const matchesAction = selectedAction === 'All' || item.action === selectedAction;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesId && matchesAction && matchesStatus;
  });

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const startRecord = filteredList.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRecord = Math.min(indexOfLastItem, filteredList.length);

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      <Topbar title="History" />

      <div className="flex justify-end my-2 shrink-0">
        <button
          onClick={() => alert('Xuất file lịch sử thiết bị...')}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#1b253b] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold border border-[#2b3a5a] shadow transition cursor-pointer"
        >
          <Download size={14} />
          Export
        </button>
      </div>

      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-0">
        {/* Thanh tìm kiếm & Bộ lọc */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Search by time or device name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">ID: All</option>
              <option value="01">01 (Đèn 1)</option>
              <option value="02">02 (Đèn 2)</option>
            </select>

            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">Action: All</option>
              <option value="Turn on">Turn on</option>
              <option value="Turn off">Turn off</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="Success">Success</option>
              <option value="Fail">Fail</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Bảng lịch sử */}
        <div className="overflow-x-auto flex-1 min-h-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-gray-500 uppercase tracking-wider">
                <th className="pb-2.5 px-3">Device ID</th>
                <th className="pb-2.5 px-3">Name</th>
                <th className="pb-2.5 px-3">Action</th>
                <th className="pb-2.5 px-3">Status</th>
                <th className="pb-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50 text-gray-300">
              {currentItems.map((row, idx) => {
                const rowKey = row.recordId || `${row.id}-${row.time}-${idx}`;
                return (
                  <tr key={rowKey} className="hover:bg-[#15203b]/40 transition">
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">{row.id}</td>
                    <td className="py-2.5 px-3 font-medium">{row.name}</td>
                    <td className="py-2.5 px-3 text-gray-400">{row.action}</td>
                    <td className="py-2.5 px-3">{renderStatusBadge(row.status)}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-400">
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
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Chưa có lịch sử bật/tắt thiết bị hoặc không tìm thấy bản ghi
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
              Showing {startRecord}-{endRecord} of {filteredList.length} records
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
              className="px-2 py-1 rounded hover:bg-[#1e293b] hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-6 h-6 flex items-center justify-center rounded-md transition font-medium text-xs ${
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
              className="px-2 py-1 rounded hover:bg-[#1e293b] hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}