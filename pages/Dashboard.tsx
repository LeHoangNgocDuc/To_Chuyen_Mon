
import React from 'react';
import { User, UserRole } from '../types';
import { MOCK_SCHEDULE, MOCK_NOTIFICATIONS } from '../constants';

interface DashboardProps {
  user: User;
  year: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, year }) => {
  const stats = [
    { label: 'Tiết dạy tuần này', value: '18', color: 'blue' },
    { label: 'Điểm thi đua', value: '189.4', color: 'green' },
    { label: 'Đề cương đã duyệt', value: '1/1', color: 'purple' },
    { label: 'Xếp hạng tổ', value: '#2', color: 'amber' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg shadow-blue-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chào mừng, {user.name}!</h1>
          <p className="opacity-90 font-medium">Tổ Toán - Tin | THCS Trần Hưng Đạo | Năm học {year}</p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">{user.role}</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">{user.subject}</span>
          </div>
        </div>
        <div className="hidden lg:block">
           <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
             <div className="text-3xl font-black">24</div>
             <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tháng 10</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-sm font-medium mb-1">{stat.label}</div>
            <div className={`text-2xl font-black text-${stat.color}-600`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Lịch dạy hôm nay
              </h3>
              <button className="text-blue-600 text-sm font-medium hover:underline">Toàn bộ lịch</button>
            </div>
            <div className="space-y-3">
              {MOCK_SCHEDULE.length > 0 ? MOCK_SCHEDULE.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                      T{item.period}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Lớp {item.className} - {item.subject}</div>
                      <div className="text-[10px] text-slate-400 font-medium italic">Sáng • Tiết {item.period}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold px-2 py-1 bg-white rounded-lg border border-slate-200 text-slate-500">Chính khóa</div>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-400 text-sm italic">Hôm nay không có tiết dạy</div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
             <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
               <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               Lưu ý tuần này
             </h4>
             <p className="text-sm text-amber-700 leading-relaxed font-medium">Đề nghị giáo viên nộp đầy đủ đề cương GK1 và ma trận lên hệ thống. Tổ trưởng sẽ chốt duyệt vào chiều Thứ 6 tuần này.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Thông báo mới
          </h3>
          <div className="space-y-4">
            {MOCK_NOTIFICATIONS.map((notif) => (
              <div key={notif.id} className="relative pl-4 border-l-2 border-slate-100 hover:border-blue-500 transition-colors pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${notif.isImportant ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {notif.role}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{notif.date}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mb-1">{notif.sender}</div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">{notif.content}</div>
              </div>
            ))}
          </div>
          {user.role === UserRole.TCM || user.role === UserRole.TP ? (
            <button className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
              Đăng thông báo mới
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
