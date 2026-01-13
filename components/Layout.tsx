
import React from 'react';
import { User, UserRole } from '../types';
import { ACADEMIC_YEARS, DRIVE_LINK } from '../constants';

interface LayoutProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  currentYear: string;
  setCurrentYear: (year: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, activeTab, setActiveTab, onLogout, currentYear, setCurrentYear, children }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'assignment', label: 'Phân công', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'schedule', label: 'Lịch dạy', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'substitute', label: 'Dạy thay', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'competition', label: 'Thi đua', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-1.947m5.438 0a3.42 3.42 0 001.946 1.947m2.891 2.891a3.42 3.42 0 001.947 1.946m0 5.438a3.42 3.42 0 00-1.947 1.946m-2.891 2.891a3.42 3.42 0 00-1.946 1.947m-5.438 0a3.42 3.42 0 00-1.946-1.947m-2.891-2.891a3.42 3.42 0 00-1.947-1.946m0-5.438a3.42 3.42 0 001.947-1.946' },
    { id: 'documents', label: 'Đề cương/Đề thi', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'reports', label: 'Báo cáo', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">THĐ</div>
          <span className="font-bold text-white text-lg tracking-tight">Toán - Tin</span>
        </div>
        
        <nav className="flex-1 mt-4 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-800">
            <a 
              href={DRIVE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.71 3.502L1.15 15l3.503 6.136L11.213 9.638 7.71 3.502zm2.81 6.136l3.504 6.136-3.504 6.136L7.017 15.774l3.503-6.136zm8.33-6.136l3.503 6.136L15.85 21.14 12.347 15l6.503-11.364z"/>
              </svg>
              Link Drive Tổ
            </a>
          </div>
        </nav>

        <div className="p-4 bg-slate-800/40 m-4 rounded-2xl backdrop-blur-sm">
          <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">Người dùng</div>
          <div className="text-sm font-semibold text-white truncate mb-1">{user.name}</div>
          <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-bold uppercase tracking-wider ${
            user.role === UserRole.TCM ? 'bg-red-500/20 text-red-400' : 
            user.role === UserRole.BGH ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {user.role}
          </div>
          <button 
            onClick={onLogout}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors border border-slate-700 rounded-xl hover:bg-slate-700"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-xl font-bold text-slate-800">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              {ACADEMIC_YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => setCurrentYear(y)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currentYear === y ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            
            <div className="h-8 w-px bg-slate-200"></div>
            
            <button className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all relative group">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:animate-ping"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
