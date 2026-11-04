import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import { Github, Figma, FileText, Webhook, ExternalLink } from 'lucide-react';

export default function ProfileView() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyTelegram, setNotifyTelegram] = useState(false);

  // Thông tin cá nhân và các đường dẫn tài liệu của bạn
  const studentInfo = {
    name: 'Đinh Gia Khánh',
    msv: 'B23DCCN424', // Hoặc B21DCCN424 tùy bạn chỉnh
    avatarUrl: '/avatar.jpg',
    githubUrl: 'https://github.com/khanhsky871-lab/IOT',
    figmaUrl: 'https://www.figma.com/design/ZGTjqCwrUKG8XCWyb4367P/IOT?node-id=0-1&t=bRbg4l7aFHaBwXuq-1',
    pdfReportUrl: '/Dinh_Gia_Khanh_B23DCCN424.pdf', 
    postmanUrl: 'https://documenter.getpostman.com/view/your-collection-link' 
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <Topbar title="Profile" />

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
                <div className="mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-xs font-semibold border border-blue-500/30">
                    MSV: {studentInfo.msv}
                  </span>
                </div>
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
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
            <h4 className="text-xs font-semibold text-white">Access & Authentication</h4>
            
            <div className="grid grid-cols-2 gap-3 my-1">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Verify Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0f1d] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#1e293b]/60 space-y-1.5">
             
              
              <div className="flex items-center justify-between text-xs text-gray-300">
                
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300">
               
              </div>
            </div>
          </div>

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