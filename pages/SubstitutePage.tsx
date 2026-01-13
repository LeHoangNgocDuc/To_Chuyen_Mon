
import React, { useState } from 'react';
import { User, UserRole, SubstituteRequest } from '../types';
import { MOCK_SUBSTITUTES, MOCK_USERS } from '../constants';

interface SubstitutePageProps {
  user: User;
}

const ABSENCE_REASONS = [
  'Công tác',
  'Việc riêng',
  'Nghỉ ốm',
  'Thai sản',
  'Đã bồi hoàn tiết',
  'Khác'
];

const SubstitutePage: React.FC<SubstitutePageProps> = ({ user }) => {
  const [substitutes, setSubstitutes] = useState<SubstituteRequest[]>(MOCK_SUBSTITUTES);
  const [showModal, setShowModal] = useState(false);
  const isTCM = user.role === UserRole.TCM;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate adding a new request
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Dạy thay</h1>
          <p className="text-slate-500">Ghi nhận và phân công giáo viên dạy thay tiết nghỉ</p>
        </div>
        {isTCM && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tạo phiếu dạy thay
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="font-bold text-slate-700 text-sm">Danh sách phiếu dạy thay học kỳ này</span>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Tự động cộng điểm thi đua (+0.25đ/tiết)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {substitutes.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="p-4">Ngày dạy</th>
                  <th className="p-4">GV Nghỉ</th>
                  <th className="p-4">GV Dạy thay</th>
                  <th className="p-4">Lớp/Tiết</th>
                  <th className="p-4">Lý do</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {substitutes.map(sub => {
                  const absent = MOCK_USERS.find(u => u.id === sub.absentTeacherId);
                  const replacement = MOCK_USERS.find(u => u.id === sub.substituteTeacherId);
                  return (
                    <tr key={sub.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-500 font-medium">{sub.date}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{absent?.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-blue-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                          {replacement?.name}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        Lớp {sub.className} <span className="text-slate-400 mx-1">•</span> Tiết {sub.period}
                      </td>
                      <td className="p-4 text-slate-500 italic text-xs">{sub.reason}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                          ĐÃ XÁC NHẬN
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-slate-400 font-medium">Chưa có dữ liệu dạy thay</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Tạo phiếu dạy thay</h3>
                <p className="text-xs text-slate-500 mt-0.5">Phân công giáo viên chuyên môn dạy thay</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Giáo viên nghỉ</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
                    {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Giáo viên dạy thay</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
                    {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ngày</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lớp</label>
                  <input type="text" placeholder="9A1" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tiết</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
                    {[1,2,3,4,5].map(p => <option key={p} value={p}>Tiết {p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lý do nghỉ</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
                   {ABSENCE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3 border border-blue-100">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-800">Quyền lợi giáo viên dạy thay</div>
                  <p className="text-[10px] text-blue-600 font-medium">Hệ thống sẽ tự động cộng 0.25 điểm vào chuyên mục thi đua "Dạy thay (R)" cho giáo viên được phân công ngay sau khi duyệt.</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Hủy bỏ</button>
              <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">Xác nhận phân công</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubstitutePage;
