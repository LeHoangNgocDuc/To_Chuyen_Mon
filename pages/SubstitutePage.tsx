
import React, { useState, useEffect } from 'react';
import { User, UserRole, SubstituteRequest } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJYsC2pw7Dnp88JVzPLs5CwhrUwaUnd8_BgRNHOTivzsNQ93lcdUxS1_JdH1a4JTW6/exec';

interface SubstitutePageProps {
  user: User;
}

const ABSENCE_REASONS = [
  'Nghỉ công tác',
  'Việc gia đình (Có phép)',
  'Nghỉ ốm (Có giấy tờ)',
  'Đi học chuyên môn',
  'Việc riêng đột xuất',
  'Thai sản/Dưỡng nhi',
  'Tham gia phong trào'
];

const SubstitutePage: React.FC<SubstitutePageProps> = ({ user }) => {
  const [substitutes, setSubstitutes] = useState<SubstituteRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isTCM = user.role === UserRole.TCM;

  const fetchSubstitutes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?type=substitutes`);
      const data = await response.json();
      if (Array.isArray(data)) setSubstitutes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubstitutes();
  }, []);

  // Thống kê cá nhân
  const mySubstitutionCount = substitutes.filter(s => s.substituteTeacherId === user.id).length;
  const myAbsenceCount = substitutes.filter(s => s.absentTeacherId === user.id).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý Dạy thay & Nghỉ tiết</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Dữ liệu ghi nhận từ chuyên môn tổ</p>
        </div>
        {isTCM && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 flex items-center gap-2"
          >
            Tạo phiếu mới
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số tiết tôi đã dạy thay</div>
            <div className="text-3xl font-black text-blue-600">{mySubstitutionCount} <span className="text-xs text-slate-400">tiết</span></div>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black">+0.25đ</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số tiết tôi đã nghỉ</div>
            <div className="text-3xl font-black text-red-500">{myAbsenceCount} <span className="text-xs text-slate-400">tiết</span></div>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="font-black text-slate-700 text-[10px] uppercase tracking-widest">Lịch sử dạy thay chuyên môn</span>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="py-20 text-center font-black text-slate-300 animate-pulse italic uppercase">Đang tải dữ liệu dạy thay...</div>
          ) : substitutes.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-6">Ngày</th>
                  <th className="p-6">GV Nghỉ</th>
                  <th className="p-6">GV Dạy thay</th>
                  <th className="p-6">Chi tiết</th>
                  <th className="p-6">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {substitutes.map(sub => (
                  <tr key={sub.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 text-slate-500 font-bold text-xs">{sub.date}</td>
                    <td className="p-6 font-black text-slate-700 text-sm">{sub.absentTeacherId}</td>
                    <td className="p-6">
                      <div className="font-black text-blue-600 text-sm">{sub.substituteTeacherId}</div>
                    </td>
                    <td className="p-6 text-slate-600 text-xs font-bold">Lớp {sub.className} <span className="opacity-30 mx-1">•</span> Tiết {sub.period}</td>
                    <td className="p-6 text-slate-500 italic text-[11px] font-medium">{sub.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center text-slate-300 italic">Chưa có bản ghi nào.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubstitutePage;
