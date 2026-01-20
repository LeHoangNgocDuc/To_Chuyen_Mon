
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ACADEMIC_YEARS } from '../constants';

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
  const isTTCM = user.role === UserRole.TCM;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'assignment', label: 'Phân công', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'schedule', label: 'Lịch dạy', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'lessonPlan', label: 'Kế hoạch bài dạy', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'demos', label: 'Thao giảng', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'substitute', label: 'Dạy thay', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'competition', label: 'Thi đua', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-1.947m5.438 0a3.42 3.42 0 001.946 1.947m2.891 2.891a3.42 3.42 0 001.947 1.946m0 5.438a3.42 3.42 0 00-1.947 1.946m-2.891 2.891a3.42 3.42 0 00-1.946 1.947m-5.438 0a3.42 3.42 0 00-1.946-1.947m-2.891-2.891a3.42 3.42 0 00-1.947-1.946m0-5.438a3.42 3.42 0 001.947-1.946' },
    { id: 'documents', label: 'Đề cương/Đề thi', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Navigation - Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl shadow-blue-500/30">THĐ</div>
            <span className="font-black text-white text-xl tracking-tight italic">Toán-Tin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 mt-2 px-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleTabClick(item.id)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 bg-slate-800/40 m-6 rounded-[2rem]">
          <div className="text-[9px] text-slate-500 mb-1 uppercase tracking-widest font-black italic">Hồ sơ cá nhân</div>
          <div className="text-xs font-black text-white truncate">{user.name}</div>
          <button onClick={onLogout} className="mt-4 w-full py-3 bg-slate-700 hover:bg-red-600/20 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Đăng xuất</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 md:px-10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <h2 className="text-lg md:text-2xl font-black text-slate-800 italic uppercase tracking-tight truncate">{navItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl hidden md:flex">
              {isTTCM ? (
                ACADEMIC_YEARS.map(y => (
                  <button key={y} onClick={() => setCurrentYear(y)} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${currentYear === y ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>{y}</button>
                ))
              ) : (
                <span className="px-6 py-2 text-[11px] font-black text-blue-600 bg-white rounded-xl shadow-sm uppercase italic">Năm học {currentYear}</span>
              )}
            </div>
            {/* Mobile Year display if needed, simplified */}
            <div className="md:hidden text-[10px] font-black text-blue-600 bg-slate-50 px-3 py-2 rounded-xl border border-blue-100">
               {currentYear}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
