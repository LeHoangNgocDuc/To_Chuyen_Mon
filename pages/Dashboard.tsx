
import React, { useState } from 'react';
import { User, UserRole, SystemNotification } from '../types';
import { SCRIPT_URL } from '../constants';

const SUBJECT_OPTIONS = ['Toán', 'Tin học', 'Công nghệ', 'Khác'];
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
    assignedClasses: [...(user.assignedClasses || [])]
  });

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

  const toggleClass = (grade: number, cls: number) => {
    const entry = `${editData.tempSubject} ${grade}/${cls}`;
    if (editData.assignedClasses.includes(entry)) {
      setEditData({ ...editData, assignedClasses: editData.assignedClasses.filter(c => c !== entry) });
    } else {
      setEditData({ ...editData, assignedClasses: [...editData.assignedClasses, entry] });
    }
  };

  const handleSaveProfile = async () => {
    if (editData.assignedClasses.length === 0) return alert('Vui lòng có ít nhất một lớp phân công!');
    
    setIsSavingProfile(true);
    const updatedUser = { 
      ...user, 
      assignedClasses: editData.assignedClasses,
      subject: editData.tempSubject // Cập nhật môn dạy chính theo lựa chọn hiện tại
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'users', action: 'save', data: updatedUser })
      });
      alert('Đã cập nhật phân công giảng dạy!');
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-black mb-3 italic">Chào {user.name.split(' ').pop()}!</h1>
            <p className="text-blue-200 font-bold uppercase tracking-[0.3em] text-[10px]">THCS TRẦN HƯNG ĐẠO • {year}</p>
            <div className="mt-8 flex gap-3">
              <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">{user.role}</span>
              <span className="px-5 py-2 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30">{user.subject}</span>
            </div>
          </div>
          <button onClick={() => {
            setEditData({ tempSubject: user.subject, assignedClasses: [...(user.assignedClasses || [])] });
            setShowProfileModal(true);
          }} className="mt-8 md:mt-0 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all active:scale-95">
            Sửa phân công dạy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase italic">Thông báo Tổ</h3>
              {(user.role === UserRole.TCM || user.role === UserRole.TP) && (
                <button onClick={() => setShowNotifModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Đăng tin mới</button>
              )}
            </div>
            <div className="space-y-6">
              {notifications.length > 0 ? notifications.map(notif => (
                <div key={notif.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">{notif.senderName.charAt(0)}</div>
                      <div>
                         <div className="text-sm font-black text-slate-800">{notif.senderName}</div>
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{notif.role} • {notif.date}</div>
                      </div>
                    </div>
                    {notif.isImportant && <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[8px] font-black uppercase">Quan trọng</span>}
                  </div>
                  <p className="text-slate-600 font-bold leading-relaxed mb-4">{notif.content}</p>
                  {notif.executionTime && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[10px] font-black text-slate-500 uppercase">Hạn thực hiện: <span className="text-orange-600">{notif.executionTime}</span></span>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-20 text-center font-black text-slate-300 italic uppercase">Chưa có thông báo mới</div>
              )}
            </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
             <h3 className="text-lg font-black text-slate-800 uppercase italic mb-6">Trạng thái</h3>
             <div className="space-y-4">
                <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                  <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Điểm thi đua</div>
                  <div className="text-4xl font-black text-blue-600 tracking-tighter">189.4</div>
                </div>
                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                  <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Xếp hạng tổ</div>
                  <div className="text-4xl font-black text-emerald-600 tracking-tighter">#2</div>
                </div>
             </div>
           </div>
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center z-50 p-6 overflow-y-auto">
           <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-xl w-full p-12 animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic">Cập nhật phân công chuyên môn</h3>
              <div className="space-y-6">
                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border-2 border-blue-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-blue-800 uppercase tracking-widest">Môn giảng dạy</label>
                    <select value={editData.tempSubject} onChange={e => setEditData({...editData, tempSubject: e.target.value})} className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-xs font-black text-blue-600 outline-none shadow-sm">
                      {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    {GRADES.map(grade => (
                      <div key={grade} className="space-y-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase">Khối {grade}</div>
                        <div className="grid grid-cols-6 gap-2">
                          {CLASSES.map(cls => {
                            const entry = `${editData.tempSubject} ${grade}/${cls}`;
                            const isActive = editData.assignedClasses.includes(entry);
                            return (
                              <button 
                                key={cls} 
                                type="button" 
                                onClick={() => toggleClass(grade, cls)}
                                className={`py-3 rounded-xl text-[10px] font-black transition-all border ${
                                  isActive 
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-md' 
                                  : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'
                                }`}
                              >
                                {grade}/{cls}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {editData.assignedClasses.length > 0 && (
                    <div className="pt-4 border-t border-blue-100">
                      <div className="text-[9px] font-black text-blue-400 uppercase mb-2">Toàn bộ phân công ({editData.assignedClasses.length} lớp):</div>
                      <div className="flex flex-wrap gap-2">
                        {editData.assignedClasses.map(item => (
                          <div key={item} className="flex items-center gap-2 px-2 py-1 bg-white border border-blue-200 rounded-lg text-[8px] font-black text-blue-600">
                            {item}
                            <button onClick={(e) => { e.stopPropagation(); setEditData({...editData, assignedClasses: editData.assignedClasses.filter(i => i !== item)}); }} className="text-red-400 hover:text-red-600">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 italic text-center">Gợi ý: Chọn môn rồi chọn lớp trên lưới để thêm nhanh phân công mới.</div>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowProfileModal(false)} className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hủy bỏ</button>
                <button disabled={isSavingProfile} onClick={handleSaveProfile} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase shadow-xl tracking-widest active:scale-95 transition-all">
                  {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
           </div>
        </div>
      )}

      {showNotifModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center z-50 p-6 overflow-y-auto">
           <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-lg w-full p-12 animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic">Đăng thông báo tổ</h3>
              <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nội dung thông báo</label>
                   <textarea rows={4} value={newNotif.content} onChange={e => setNewNotif({...newNotif, content: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Viết nội dung cho tổ..."></textarea>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Thời gian thực hiện (Nếu có)</label>
                   <input type="date" value={newNotif.executionTime} onChange={e => setNewNotif({...newNotif, executionTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div className="flex gap-4">
                   <label className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                      <input type="checkbox" checked={newNotif.sendEmailReminder} onChange={e => setNewNotif({...newNotif, sendEmailReminder: e.target.checked})} className="w-5 h-5 rounded-md text-blue-600" />
                      <span className="text-[10px] font-black text-slate-600 uppercase">Gửi nhắc nhở</span>
                   </label>
                   <label className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                      <input type="checkbox" checked={newNotif.isImportant} onChange={e => setNewNotif({...newNotif, isImportant: e.target.checked})} className="w-5 h-5 rounded-md text-red-600" />
                      <span className="text-[10px] font-black text-red-600 uppercase">Quan trọng</span>
                   </label>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowNotifModal(false)} className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hủy bỏ</button>
                <button disabled={isPosting} onClick={handlePostNotif} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-slate-200 active:scale-95 transition-all">
                  {isPosting ? 'Đang đăng...' : 'Xác nhận đăng'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
