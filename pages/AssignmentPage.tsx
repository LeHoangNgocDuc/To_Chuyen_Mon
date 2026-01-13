
import React, { useState } from 'react';
import { User, UserRole } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJYsC2pw7Dnp88JVzPLs5CwhrUwaUnd8_BgRNHOTivzsNQ93lcdUxS1_JdH1a4JTW6/exec';

interface AssignmentPageProps {
  user: User;
  users: User[];
  onApprove: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

const AssignmentPage: React.FC<AssignmentPageProps> = ({ user, users, onApprove, onDeleteUser }) => {
  const isManagement = user.role === UserRole.TCM || user.role === UserRole.TP;
  const [isSyncing, setIsSyncing] = useState(false);

  const syncUserToSheet = async (data: User, action: 'save' | 'delete' = 'save') => {
    setIsSyncing(true);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'users', action, data })
      });
      if (action === 'delete') {
        onDeleteUser(data.id);
      }
      alert(action === 'delete' ? 'Đã xóa thành viên.' : 'Đã cập nhật dữ liệu Sheet.');
    } catch (e) {
      alert('Lỗi đồng bộ Sheet!');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Danh sách thành viên tổ</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Dữ liệu đồng bộ thời gian thực từ Google Sheets</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest text-left border-b border-slate-100">
                <th className="p-6">Thành viên</th>
                <th className="p-6">Phân công Lớp</th>
                <th className="p-6">Vai trò / Môn</th>
                <th className="p-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(teacher => (
                <tr key={teacher.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-slate-800 text-base">{teacher.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{teacher.email}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-wrap gap-1">
                      {teacher.assignedClasses?.map(c => (
                        <span key={c} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 shadow-sm uppercase">{c}</span>
                      )) || <span className="text-slate-300 italic text-[10px]">Chưa phân lớp</span>}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      teacher.role === UserRole.TCM ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {teacher.role} • {teacher.subject}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {!teacher.isApproved ? (
                      <button onClick={() => onApprove(teacher.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Phê duyệt</button>
                    ) : (
                      isManagement && teacher.id !== user.id && (
                        <button onClick={() => syncUserToSheet(teacher, 'delete')} className="text-slate-300 hover:text-red-600 p-2 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;
