
import React, { useState, useEffect } from 'react';
import { User, UserRole, StaffPosition } from '../types';
import { MOCK_USERS } from '../constants';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQUquuU0405nk7Z9N5Mc7hEZ_3eu5_tr22Y7HhIqmsablt9PSulAQoj-gEbt1tYha5/exec';

interface AssignmentPageProps {
  user: User;
  users: User[];
  onApprove: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

const AssignmentPage: React.FC<AssignmentPageProps> = ({ user, users, onApprove, onDeleteUser }) => {
  const isManagement = user.role === UserRole.TCM || user.role === UserRole.TP;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingUsers = users.filter(u => !u.isApproved);

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
      alert(action === 'delete' ? 'Đã xóa thành viên khỏi hệ thống.' : 'Đã cập nhật thông tin thành viên.');
      setShowEditModal(false);
    } catch (e) {
      alert('Lỗi đồng bộ dữ liệu!');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditClick = (teacher: User) => {
    setEditingTeacher({ ...teacher });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nhân sự & Phân công</h1>
          <p className="text-slate-500">Quản lý danh sách giáo viên và đồng bộ Google Sheets</p>
        </div>
        {isManagement && (
          <button 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2"
            onClick={() => {
              setEditingTeacher({
                id: Math.random().toString(36).substr(2, 9),
                username: '',
                name: '',
                email: '',
                role: UserRole.GV,
                subject: 'Toán',
                isApproved: true,
                assignedClasses: [],
                duties: []
              });
              setShowEditModal(true);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Thêm giáo viên mới
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Danh sách thành viên tổ</h3>
          {isSyncing && <div className="text-[10px] text-blue-600 font-black animate-pulse uppercase">Đang đồng bộ Sheets...</div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest text-left border-b border-slate-100">
                <th className="p-5">Thành viên</th>
                <th className="p-5">Phân công</th>
                <th className="p-5">Kiêm nhiệm</th>
                {isManagement && <th className="p-5 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.filter(u => u.isApproved).map(teacher => (
                <tr key={teacher.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-5">
                    <div className="font-black text-slate-800">{teacher.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{teacher.role} • {teacher.subject}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1">
                      {teacher.assignedClasses?.map(c => (
                        <span key={c} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600">{c}</span>
                      )) || <span className="text-slate-300 italic text-[10px]">Chưa có</span>}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1">
                      {teacher.duties?.map(d => (
                        <span key={d} className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase">{d}</span>
                      )) || <span className="text-slate-300 italic text-[10px]">-</span>}
                    </div>
                  </td>
                  {isManagement && (
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEditClick(teacher)} className="p-2 text-slate-400 hover:text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2.5 2.5 0 113.536 3.536L12 20.232H8v-4z" /></svg>
                        </button>
                        <button onClick={() => syncUserToSheet(teacher, 'delete')} className="p-2 text-slate-400 hover:text-red-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full p-10 animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase">Hồ sơ thành viên</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Họ và tên</label>
                  <input type="text" value={editingTeacher.name} onChange={e => setEditingTeacher({...editingTeacher, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Username</label>
                  <input type="text" value={editingTeacher.username} onChange={e => setEditingTeacher({...editingTeacher, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Chức vụ</label>
                  <select value={editingTeacher.role} onChange={e => setEditingTeacher({...editingTeacher, role: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                    <option value={UserRole.GV}>Giáo viên</option>
                    <option value={UserRole.TP}>Tổ phó</option>
                    <option value={UserRole.TCM}>Tổ trưởng</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setShowEditModal(false)} className="flex-1 font-black text-slate-400 uppercase">Hủy</button>
              <button onClick={() => syncUserToSheet(editingTeacher)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Lưu dữ liệu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
