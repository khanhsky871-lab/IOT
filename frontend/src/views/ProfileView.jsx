import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import { Github, Figma, FileText, Webhook, ExternalLink, LogOut, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

export default function ProfileView({ user, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState({ type: '', message: '' });

  // Thông tin cá nhân (ảnh luôn lấy trực tiếp từ /avatar.jpg, không lấy từ DB)
  const studentInfo = {
    name: user?.fullName || 'Đinh Gia Khánh',
    msv: user?.studentId || 'B23DCCN424',
    className: user?.className || 'D23CQCN01-B',
    email: user?.email || 'khanh.dg@ptit.edu.vn',
    avatarUrl: '/avatar.jpg',
    githubUrl: 'https://github.com/khanhsky871-lab/IOT',
    figmaUrl: 'https://www.figma.com/design/ZGTjqCwrUKG8XCWyb4367P/IOT?node-id=0-1&t=bRbg4l7aFHaBwXuq-1',
    pdfReportUrl: '/Dinh_Gia_Khanh_B23DCCN424.pdf',
    postmanUrl: 'https://documenter.getpostman.com/view/your-collection-link'
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdFeedback({ type: '', message: '' });

    if (newPassword.length < 6) {
      setPwdFeedback({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdFeedback({ type: 'error', message: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    setSavingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (res.status === 401 || res.status === 403) {
        onLogout?.();
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwdFeedback({ type: 'error', message: data.message || 'Đổi mật khẩu thất bại!' });
        return;
      }

      setPwdFeedback({ type: 'success', message: data.message || 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err);
      setPwdFeedback({ type: 'error', message: 'Không thể kết nối tới Backend!' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <Topbar title="Profile" user={user} />

      {/* VÙNG NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col justify-between gap-3.5 py-2 min-h-0">
        
        {/* 1. HÀNG TRÊN: 2 CỘT CĂN ĐỀU CHIỀU CAO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch shrink-0">
          
          {/* Khung Identity Badges */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              IDENTITY BADGES
            </h4>

            <div className="flex items-center gap-4 my-2">
              <div className="relative shrink-0">
                <img
                  src={studentInfo.avatarUrl}
                  alt={studentInfo.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                  }}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#334155] shadow-lg shadow-blue-500/10"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-tight">{studentInfo.name}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-xs font-semibold border border-blue-500/30">
                    MSV: {studentInfo.msv}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-gray-300 font-mono text-xs border border-slate-700">
                    {studentInfo.className}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono mt-1.5">{studentInfo.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-3 border-t border-[#1e293b]/60">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 tracking-wide">
                SYS ADMIN
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 tracking-wide">
                ACTIVE AGENT
              </span>
            </div>
          </div>

          {/* Khung Access & Authentication */}
          <form onSubmit={handleChangePassword} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">Access & Authentication</h4>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-[11px] font-semibold transition cursor-pointer"
              >
                <LogOut size={13} /> Đăng xuất
              </button>
            </div>

            {pwdFeedback.message && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] border ${
                  pwdFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {pwdFeedback.type === 'success' ? (
                  <CheckCircle2 size={14} className="shrink-0" />
                ) : (
                  <AlertCircle size={14} className="shrink-0" />
                )}
                <span>{pwdFeedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Verify Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#1e293b]/60 flex items-center justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer disabled:cursor-wait"
              >
                <KeyRound size={14} />
                <span>{savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </div>
          </form>

        </div>

        {/* 2. HÀNG DƯỚI: 4 KHUNG TÀI LIỆU & LIÊN KẾT DỰ ÁN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 min-h-0">
          
          {/* Khung 1: Github Repository */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1e293b] text-gray-200 group-hover:text-white transition">
                  <Github size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">SOURCE REPOSITORY</h5>
                  <p className="text-[11px] text-gray-400">khanhsky871-lab / IOT</p>
                </div>
              </div>
              <a
                href={studentInfo.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white text-xs font-medium transition"
              >
                Open <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-[10px] text-gray-500 font-mono truncate mt-2 bg-[#0a0f1d] px-3 py-1.5 rounded-lg border border-[#1e293b]/80">
              {studentInfo.githubUrl}
            </p>
          </div>

          {/* Khung 2: Figma UI/UX Design */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1e293b] text-purple-400 group-hover:text-purple-300 transition">
                  <Figma size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">FIGMA PROTOTYPE</h5>
                  <p className="text-[11px] text-gray-400">Helix IoT Dashboard Wireframe</p>
                </div>
              </div>
              <a
                href={studentInfo.figmaUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-xs font-medium transition"
              >
                Open <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-[10px] text-gray-500 font-mono truncate mt-2 bg-[#0a0f1d] px-3 py-1.5 rounded-lg border border-[#1e293b]/80">
              {studentInfo.figmaUrl}
            </p>
          </div>

          {/* Khung 3: Báo cáo PDF (Project Report) */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1e293b] text-rose-400 group-hover:text-rose-300 transition">
                  <FileText size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">PROJECT REPORT (PDF)</h5>
                  <p className="text-[11px] text-gray-400">Báo cáo bài tập lớn hệ thống IoT</p>
                </div>
              </div>
              <a
                href={studentInfo.pdfReportUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-xs font-medium transition"
              >
                View PDF <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-[10px] text-gray-500 font-mono truncate mt-2 bg-[#0a0f1d] px-3 py-1.5 rounded-lg border border-[#1e293b]/80">
              {studentInfo.pdfReportUrl}
            </p>
          </div>

          {/* Khung 4: Tài liệu API Postman */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1e293b] text-amber-400 group-hover:text-amber-300 transition">
                  <Webhook size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">POSTMAN API DOCS</h5>
                  <p className="text-[11px] text-gray-400">RESTful API Endpoints & Payloads</p>
                </div>
              </div>
              <a
                href={studentInfo.postmanUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600 hover:text-white text-xs font-medium transition"
              >
                Open <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-[10px] text-gray-500 font-mono truncate mt-2 bg-[#0a0f1d] px-3 py-1.5 rounded-lg border border-[#1e293b]/80">
              {studentInfo.postmanUrl}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}