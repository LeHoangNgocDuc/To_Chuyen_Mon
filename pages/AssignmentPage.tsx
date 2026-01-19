
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AssignmentPageProps {
  user: User;
  users: User[];
  onApprove: (user: User) => void;
  onChangeRole: (userId: string, newRole: UserRole) => void;
  onDeleteUser: () => void;
  onRefresh: () => void;
}

const AssignmentPage: React.FC<AssignmentPageProps> = ({ user, users, onApprove, onChangeRole, onDeleteUser, onRefresh }) => {
  const isManagement = user.role === UserRole.TCM || user.role === UserRole.TP;
  const isMainAdmin = user.username === 'Anphuc';
  
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);

  const pendingUsers = users.filter(u => !u.isApproved);
  const approvedUsers = users.filter(u => u.isApproved);

  const handleRoleChangeSubmit = (newRole: UserRole) => {
    if (roleModalUser) {
      onChangeRole(roleModalUser.id, newRole);
      setRoleModalUser(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Phê duyệt thành viên mới */}
      {isManagement && pendingUsers.length > 0 && (
        <div className="bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-[3rem] p-10">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
             <h3 className="text-xl font-black text-orange-800 uppercase italic">Yêu cầu đăng ký mới ({pendingUsers.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map(u => (
              <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-xl flex items-center justify-between">
                <div>
                   <div className="text-lg font-black text-slate-800">{u.name}</div>
                   <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{u.role} • {u.subject}</div>
                   <div className="flex flex-wrap gap-1 mt-2">
                     {u.assignedClasses?.map(c => <span key={c} className="px-2 py-0.5 bg-slate-100 rounded-md text-[8px] font-black text-slate-500 uppercase">{c}</span>)}
                   </div>
                </div>
                <button onClick={() => onApprove(u)} className="bg-orange-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all">Duyệt ngay</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách thành viên tổ */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
           <div>
             <h3 className="text-xl font-black text-slate-800 uppercase italic">Thành viên Tổ Toán-Tin</h3>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Danh sách & Phân công nhiệm vụ</p>
           </div>
           <div className="flex gap-3">
             <button onClick={onRefresh} className="bg-slate-50 text-slate-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               Làm mới
             </button>
             {isMainAdmin && <span className="px-5 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[9px] font-black uppercase italic flex items-center">Admin Mode</span>}
           </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="p-10">Giáo viên / Chức vụ</th>
                  <th className="p-10">Phân công chi tiết</th>
                  <th className="p-10 text-right">Quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {approvedUsers.length > 0 ? approvedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-10">
                       <div className="text-base font-black text-slate-800">{u.name}</div>
                       <div className="flex flex-wrap gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.role === UserRole.TCM ? 'bg-red-100 text-red-600' : u.role === UserRole.TP ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{u.role}</span>
                          {u.duties?.map(d => <span key={d} className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase">{d}</span>)}
                       </div>
                    </td>
                    <td className="p-10">
                       <div className="flex flex-wrap gap-2">
                          {u.assignedClasses?.map(c => (
                            <span key={c} className="px-3 py-1.5 bg-white border border-blue-100 rounded-xl text-[10px] font-black text-blue-600 shadow-sm">{c}</span>
                          ))}
                          {u.isChuNhiem && <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase">Chủ nhiệm</span>}
                          {(!u.assignedClasses || u.assignedClasses.length === 0) && <span className="text-[10px] text-slate-400 italic">Chưa có phân công</span>}
                       </div>
                    </td>
                    <td className="p-10 text-right">
                       {isMainAdmin && u.username !== 'Anphuc' && (
                         <button 
                           onClick={() => setRoleModalUser(u)}
                           className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl text-[9px] font-black uppercase transition-all shadow-sm"
                         >
                           Đổi vai trò
                         </button>
                       )}
                       {!isMainAdmin && <span className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl text-[9px] font-black uppercase">Đang hoạt động</span>}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="p-20 text-center text-slate-400 font-bold italic">Chưa có dữ liệu thành viên. Vui lòng nhấn "Làm mới".</td>
                  </tr>
                )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Modal Đổi vai trò */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center z-50 p-6">
           <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-sm w-full p-10 animate-in zoom-in duration-300">
              <h3 className="text-xl font-black text-slate-800 mb-6 uppercase italic text-center">Chỉ định quyền cho {roleModalUser.name.split(' ').pop()}</h3>
              <div className="space-y-3">
                {[UserRole.GV, UserRole.TP, UserRole.TCM].map(role => (
                  <button 
                    key={role}
                    onClick={() => handleRoleChangeSubmit(role)}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      roleModalUser.role === role 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105' 
                      : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {role === UserRole.TCM ? 'Tổ trưởng chuyên môn (Quản trị)' : role === UserRole.TP ? 'Tổ phó (Quản trị)' : 'Giáo viên (Thành viên)'}
                  </button>
                ))}
              </div>
              <button onClick={() => setRoleModalUser(null)} className="mt-8 w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Đóng</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
