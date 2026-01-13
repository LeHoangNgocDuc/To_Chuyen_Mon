
import React, { useState } from 'react';
import { User, UserRole, TeachingDemo } from '../types';
import { MOCK_USERS, MOCK_DEMOS } from '../constants';

interface AssignmentPageProps {
  user: User;
  users: User[];
  onApprove: (id: string) => void;
}

const AssignmentPage: React.FC<AssignmentPageProps> = ({ user, users, onApprove }) => {
  const isManagement = user.role === UserRole.TCM || user.role === UserRole.TP;
  const [demos, setDemos] = useState<TeachingDemo[]>(MOCK_DEMOS);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const pendingUsers = users.filter(u => !u.isApproved);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Phân công & Thao giảng</h1>
          <p className="text-slate-500">Quản lý phân công giảng dạy đầu năm và lịch thao giảng chuyên đề</p>
        </div>
      </div>

      {isManagement && pendingUsers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-xl shadow-red-500/10">
          <h3 className="text-red-800 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Yêu cầu phê duyệt tài khoản ({pendingUsers.length})
          </h3>
          <div className="divide-y divide-red-100">
            {pendingUsers.map(u => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{u.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{u.role} • {u.staffPosition || u.subject} • {u.email}</div>
                </div>
                <button 
                  onClick={() => onApprove(u.id)}
                  className="bg-red-600 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase hover:bg-red-700 transition-all"
                >
                  Duyệt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Phân công Giảng dạy
              </h3>
              {isManagement && <button className="text-blue-600 text-xs font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">Lưu thay đổi</button>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider text-left border-b border-slate-100">
                    <th className="p-4">Giáo viên / Nhân viên</th>
                    <th className="p-4">Môn / Vị trí</th>
                    <th className="p-4">Lớp Phân công</th>
                    <th className="p-4">Kiêm nhiệm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => u.isApproved).map(teacher => (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{teacher.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{teacher.role}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${teacher.subject === 'Toán' ? 'bg-blue-100 text-blue-700' : teacher.subject === 'Tin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {teacher.staffPosition || teacher.subject}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.assignedClasses?.map(c => (
                            <span key={c} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-medium text-slate-600">{c}</span>
                          )) || <span className="text-slate-300 italic text-xs">Chưa có</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.duties?.map(d => (
                            <span key={d} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[10px] font-bold text-indigo-600">{d}</span>
                          )) || <span className="text-slate-300 italic text-xs">-</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Lịch Thao giảng
              </h3>
              {isManagement && (
                <button onClick={() => setShowDemoModal(true)} className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              )}
            </div>
            <div className="p-4 space-y-3">
              {demos.map(demo => {
                const t = users.find(u => u.id === demo.teacherId);
                return (
                  <div key={demo.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-blue-600 text-[10px] text-center leading-none">
                        {demo.date.split('-')[2]}<br/>Th{demo.date.split('-')[1]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-xs truncate">{demo.topic}</div>
                        <div className="text-[10px] text-slate-500 mt-1">GV: {t?.name} • Lớp {demo.className} • Tiết {demo.period}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;
