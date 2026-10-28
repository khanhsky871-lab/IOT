import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import { Search, Download } from 'lucide-react';

export default function HistoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState('All');
  const [selectedAction, setSelectedAction] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dữ liệu mẫu 
  const [historyList] = useState([
    { id: '01', name: 'Đèn 1', action: 'Turn on', status: 'Success', time: '21/08/2026 08:00:00' },
    { id: '02', name: 'Đèn 2', action: 'Turn off', status: 'Fail', time: '21/08/2026 08:01:00' },
    { id: '03', name: 'Đèn 1', action: 'Turn off', status: 'Pending', time: '21/08/2026 08:05:12' },
    { id: '04', name: 'Đèn 2', action: 'Turn on', status: 'Success', time: '21/08/2026 08:12:44' },
    { id: '01', name: 'Đèn 1', action: 'Turn on', status: 'Success', time: '21/08/2026 08:15:00' },
    { id: '02', name: 'Đèn 2', action: 'Turn off', status: 'Fail', time: '21/08/2026 08:18:00' },
    { id: '03', name: 'Đèn 1', action: 'Turn off', status: 'Pending', time: '21/08/2026 08:20:12' },
    { id: '04', name: 'Đèn 2', action: 'Turn on', status: 'Success', time: '21/08/2026 08:22:44' },
    { id: '01', name: 'Đèn 1', action: 'Turn on', status: 'Success', time: '21/08/2026 08:25:00' },
    { id: '02', name: 'Đèn 2', action: 'Turn off', status: 'Fail', time: '21/08/2026 08:28:00' },
    { id: '03', name: 'Đèn 1', action: 'Turn off', status: 'Pending', time: '21/08/2026 08:30:12' },
    { id: '04', name: 'Đèn 2', action: 'Turn on', status: 'Success', time: '21/08/2026 08:35:44' },
    { id: '01', name: 'Đèn 1', action: 'Turn on', status: 'Success', time: '21/08/2026 08:40:00' },
    { id: '02', name: 'Đèn 2', action: 'Turn off', status: 'Fail', time: '21/08/2026 08:42:00' },
    { id: '03', name: 'Đèn 1', action: 'Turn off', status: 'Pending', time: '21/08/2026 08:45:12' },
    { id: '04', name: 'Đèn 2', action: 'Turn on', status: 'Success', time: '21/08/2026 08:50:44' },
  ]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Success
          </span>
        );
      case 'Fail':
      case 'Failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Fail
          </span>
        );
      case 'Pending':
      case 'Spending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
            {status}
          </span>
        );
    }
  };

  // 1. Lọc danh sách theo filter
  const filteredList = historyList.filter((item) => {
    const matchesSearch = item.time.includes(searchTerm) || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesId = selectedId === 'All' || item.id === selectedId;
    const matchesAction = selectedAction === 'All' || item.action === selectedAction;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesId && matchesAction && matchesStatus;
  });

  // 2. Logic tính toán phân trang
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Danh sách chỉ lấy đúng 10 mục của trang hiện tại
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const startRecord = filteredList.length === 0 ? 0 : indexOfFirstItem + 1;
  const endRecord = Math.min(indexOfLastItem, filteredList.length);

  return (
    <div>
      <Topbar title="History" />

      {/* Nút Export */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => alert("Xuất file báo cáo lịch sử...")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1b253b] hover:bg-blue-600 text-white rounded-xl text-sm font-semibold border border-[#2b3a5a] shadow-lg transition"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Bảng danh sách hoạt động */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
        {/* Bộ lọc & Tìm kiếm */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search by time..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset về trang 1 khi gõ tìm kiếm
              }}
              className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Lọc theo Device ID */}
            <select 
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">ID: All</option>
              <option value="01">01</option>
              <option value="02">02</option>
              <option value="03">03</option>
              <option value="04">04</option>
            </select>

            {/* Lọc theo Action */}
            <select 
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
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
              className="bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="Success">Success</option>
              <option value="Fail">Fail</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Bảng hiển thị danh sách (10 dòng/trang) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-gray-500 uppercase tracking-wider">
                <th className="pb-3 px-4">Device ID</th>
                <th className="pb-3 px-4">Name</th>
                <th className="pb-3 px-4">Action</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50 text-gray-300">
              {currentItems.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#15203b]/40 transition">
                  <td className="py-4 px-4 font-mono font-semibold text-white">{row.id}</td>
                  <td className="py-4 px-4 font-medium">{row.name}</td>
                  <td className="py-4 px-4 text-gray-400">{row.action}</td>
                  <td className="py-4 px-4">
                    {renderStatusBadge(row.status)}
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-400">{row.time}</td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Không tìm thấy bản ghi phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh điều hướng phân trang */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-6 pt-4 border-t border-[#1e293b]">
          <span>
            Showing {startRecord}-{endRecord} of {filteredList.length} records
          </span>
          <div className="flex items-center gap-1.5">
            {/* Nút lùi trang */}
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-2.5 py-1 rounded hover:bg-[#1e293b] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition cursor-pointer disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            {/* Danh sách nút số trang */}
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

            {/* Nút tiến trang */}
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