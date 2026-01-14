
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
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Phân công tổ chuyên môn</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Quản lý hồ sơ dạy học & chức vụ kiêm nhiệm</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest text-left border-b border-slate-100">
                <th className="p-8 w-64">Thành viên</th>
                <th className="p-8">Phân công chuyên môn (Môn - Lớp)</th>
                <th className="p-8 w-48 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(teacher => (
                <tr key={teacher.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-8">
                    <div className="font-black text-slate-800 text-base">{teacher.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.duties?.map(d => (
                         <span key={d} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[8px] font-black uppercase">{d}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-wrap gap-2">
                      {teacher.assignedClasses?.map(c => (
                        <span key={c} className="px-3 py-1.5 bg-white border border-blue-100 rounded-xl text-[10px] font-black text-blue-600 shadow-sm uppercase">
                          {c}
                        </span>
                      )) || <span className="text-slate-300 italic text-[10px]">Chưa có phân công</span>}
                      {teacher.isChuNhiem && (
                        <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-600 shadow-sm uppercase">GV Chủ nhiệm</span>
                      )}
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    {!teacher.isApproved ? (
                      <button onClick={() => onApprove(teacher.id)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Duyệt hồ sơ</button>
                    ) : (
                      isManagement && teacher.id !== user.id && (
                        <button onClick={() => syncUserToSheet(teacher, 'delete')} className="text-slate-300 hover:text-red-600 p-3 transition-colors bg-slate-50 rounded-2xl hover:bg-red-50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
