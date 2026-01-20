
import React, { useState } from 'react';
import { User, UserRole, SystemNotification } from '../types';
import { SCRIPT_URL } from '../constants';

const SUBJECT_OPTIONS = ['Toán', 'Tin học', 'Công nghệ', 'HĐTN', 'Khác'];
const GRADES = [6, 7, 8, 9];
const CLASSES = [1, 2, 3, 4, 5, 6];

interface DashboardProps {
  user: User;
  year: string;
  notifications: SystemNotification[];
  onRefresh: () => void;
  onUpdateProfile?: (updatedUser: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, year, notifications, onRefresh, onUpdateProfile }) => {
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [newNotif, setNewNotif] = useState({
    content: '',
    executionTime: '',
    sendEmailReminder: false,
    isImportant: false
  });

  const [editData, setEditData] = useState({
    tempSubject: user.subject || 'Toán',
    tempGrade: 6,
    tempClass: 1,
    assignedClasses: [...(user.assignedClasses || [])],
    isChuNhiem: user.isChuNhiem || false
  });

  // Sort notifications: Newest first (based on ID timestamp)
  const sortedNotifications = [...notifications].sort((a, b) => b.id.localeCompare(a.id));

  const handlePostNotif = async () => {
    if (!newNotif.content) return alert('Nội dung không được để trống!');
    setIsPosting(true);
    const data: SystemNotification = {
      ...newNotif,
      id: `notif-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      role: user.role,
      date: new Date().toLocaleDateString('vi-VN')
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ type: 'notifications', action: 'save', data })
      });
      alert('Đã đăng thông báo tổ!');
      setShowNotifModal(false);
      onRefresh();
    } catch (e) {
      alert('Lỗi đăng thông báo!');
    } finally {
      setIsPosting(false);
    }
  };

  const addAssignment = () => {
    const entry = `${editData.tempSubject} ${editData.tempGrade}/${editData.tempClass}`;
    if (!editData.assignedClasses.includes(entry)) {
      setEditData({ ...editData, assignedClasses: [...editData.assignedClasses, entry] });
    }
  };

  const removeAssignment = (item: string) => {
    setEditData({ ...editData, assignedClasses: editData.assignedClasses.filter(c => c !== item) });
  };

  const handleSaveProfile = async () => {
    if (editData.assignedClasses.length === 0) return alert('Vui lòng có ít nhất một lớp phân công!');
    
    setIsSavingProfile(true);
    const updatedUser = { 
      ...user, 
      assignedClasses: editData.assignedClasses,
      subject: editData.assignedClasses[0]?.split(' ')[0] || user.subject,
      isChuNhiem: editData.isChuNhiem
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ type: 'users', action: 'save', data: updatedUser })
      });
      alert('Đã cập nhật phân công chuyên môn!');
      setShowProfileModal(false);
      if (onUpdateProfile) onUpdateProfile(updatedUser);
      onRefresh();
    } catch (e) {
      alert('Lỗi khi cập nhật!');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-4xl font-black mb-3 italic">Chào {user.name.split(' ').pop()}!</h1>
            <p className="text-blue-200 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px]">THCS TRẦN HƯNG ĐẠO • {year}</p>
            <div className="mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3">
              <span className="px-4 py-1.5 md:px-5 md:py-2 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/10">{user.role}</span>
              <span className="px-4 py-1.5 md:px-5 md:py-2 bg-blue-600 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30">{user.subject}</span>
              {user.isChuNhiem && <span className="px-4 py-1.5 md:px-5 md:py-2 bg-emerald-600 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30">Chủ nhiệm</span>}
            </div>
          </div>
          <button onClick={() => {
            setEditData({ 
              ...editData, 
              assignedClasses: [...(user.assignedClasses || [])], 
              tempSubject: user.subject,
              isChuNhiem: user.isChuNhiem || false
            });
            setShowProfileModal(true);
          }} className="mt-6 md:mt-0 w-full md:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all active:scale-95 shadow-lg shadow-blue-900/40">
            Sửa phân công dạy
          </button>
        </div>
      </div>

      <div className="w-full">
         <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase italic tracking-tight">Thông báo Tổ</h3>
            {(user.role === UserRole.TCM || user.role === UserRole.TP) && (
              <button onClick={() => setShowNotifModal(true)} className="bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Đăng tin</button>
            )}
          </div>
          <div className="space-y-4 md:space-y-6">
            {sortedNotifications.length > 0 ? sortedNotifications.map(notif => (
              <div key={notif.id} className="p-6 md:p-8 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">{notif.senderName.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-black text-slate-800">{notif.senderName}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{notif.role} • {notif.date}</div>
                    </div>
                  </div>
                  {notif.isImportant && <span className="self-start px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase animate-pulse">Quan trọng</span>}
                </div>
                <p className="text-sm text-slate-600 font-bold leading-relaxed">{notif.content}</p>
                {notif.executionTime && <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian thực hiện: <span className="text-blue-600">{notif.executionTime}</span></div>}
              </div>
            )) : (
              <div className="text-center py-20 opacity-30">
                <span className="font-black text-xl uppercase italic">Chưa có thông báo nào</span>
              </div>
            )}
          </div>
         </div>
      </div>

      {showNotifModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl max-w-lg w-full p-6 md:p-10 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase italic">Tạo thông báo mới</h3>
            <div className="space-y-4">
              <textarea rows={4} value={newNotif.content} onChange={e => setNewNotif({...newNotif, content: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Nội dung thông báo..."></textarea>
              <input type="text" value={newNotif.executionTime} onChange={e => setNewNotif({...newNotif, executionTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Thời hạn (nếu có)" />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1">
                  <input type="checkbox" checked={newNotif.isImportant} onChange={e => setNewNotif({...newNotif, isImportant: e.target.checked})} className="w-4 h-4 text-red-600 rounded" />
                  <span className="text-[10px] font-black uppercase text-slate-500">Tin quan trọng</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1">
                  <input type="checkbox" checked={newNotif.sendEmailReminder} onChange={e => setNewNotif({...newNotif, sendEmailReminder: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-[10px] font-black uppercase text-slate-500">Gửi Email nhắc</span>
                </label>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowNotifModal(false)} className="flex-1 font-black text-slate-400 uppercase tracking-widest">Hủy</button>
              <button disabled={isPosting} onClick={handlePostNotif} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase shadow-xl tracking-widest hover:bg-black transition-all">
                {isPosting ? 'Đang đăng...' : 'Đăng tin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl max-w-lg w-full p-6 md:p-10 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase italic">Cập nhật phân công</h3>
            <div className="space-y-4">
               <div className="flex flex-col md:flex-row gap-2">
                  <select value={editData.tempSubject} onChange={e => setEditData({...editData, tempSubject: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none flex-1">
                     {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={editData.tempGrade} onChange={e => setEditData({...editData, tempGrade: parseInt(e.target.value)})} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none flex-1">
                     {GRADES.map(g => <option key={g} value={g}>Khối {g}</option>)}
                  </select>
                  <select value={editData.tempClass} onChange={e => setEditData({...editData, tempClass: parseInt(e.target.value)})} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none flex-1">
                     {CLASSES.map(c => <option key={c} value={c}>Lớp {c}</option>)}
                  </select>
                  <button onClick={addAssignment} className="bg-blue-600 text-white px-4 py-3 md:py-0 rounded-xl font-black shadow-lg hover:scale-105 transition-transform">+</button>
               </div>
               <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[80px]">
                  {editData.assignedClasses.length > 0 ? editData.assignedClasses.map(item => (
                    <div key={item} className="flex items-center gap-2 px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-xl text-[10px] font-black shadow-sm">
                      {item}
                      <button onClick={() => removeAssignment(item)} className="text-red-400 hover:text-red-600">×</button>
                    </div>
                  )) : (
                    <div className="text-[10px] text-slate-400 italic w-full text-center">Chưa có lớp phân công</div>
                  )}
               </div>
               <label className="flex items-center gap-3 px-2 cursor-pointer">
                  <input type="checkbox" checked={editData.isChuNhiem} onChange={e => setEditData({...editData, isChuNhiem: e.target.checked})} className="w-5 h-5 rounded-lg text-blue-600" />
                  <span className="text-[11px] font-black text-slate-500 uppercase">Giáo viên chủ nhiệm</span>
               </label>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowProfileModal(false)} className="flex-1 font-black text-slate-400 uppercase tracking-widest">Hủy</button>
              <button disabled={isSavingProfile} onClick={handleSaveProfile} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase shadow-xl tracking-widest hover:bg-black transition-all">
                {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
