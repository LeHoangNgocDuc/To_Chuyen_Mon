
import React, { useState, useEffect } from 'react';
import { User, UserRole, TeachingDemo, ScheduleItem } from '../types';
import { SCRIPT_URL } from '../constants';

interface TeachingDemoPageProps {
  user: User;
  users: User[];
}

const TeachingDemoPage: React.FC<TeachingDemoPageProps> = ({ user, users }) => {
  const [demos, setDemos] = useState<TeachingDemo[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isAdmin = user.role === UserRole.TCM || user.role === UserRole.TP;

  const [formData, setFormData] = useState<Partial<TeachingDemo>>({
    week: 1,
    date: new Date().toISOString().split('T')[0],
    period: 1,
    className: '',
    teacherId: user.id,
    tct: 1,
    lessonName: '',
    reporterId: '',
    note: '',
    session: 'Morning'
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [demoRes, schRes] = await Promise.all([
        fetch(`${SCRIPT_URL}?type=demos`),
        fetch(`${SCRIPT_URL}?type=schedule`)
      ]);
      const demoData = await demoRes.json();
      const schData = await schRes.json();
      
      if (Array.isArray(demoData)) setDemos(demoData);
      if (Array.isArray(schData)) setSchedule(schData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getAvailableTeachers = (dayOfWeek: number, period: number, session: 'Morning' | 'Afternoon') => {
    // Tìm những GV KHÔNG có lịch dạy vào thời điểm này
    const busyTeacherIds = schedule
      .filter(s => s.dayOfWeek === dayOfWeek && s.period === period && s.session === session)
      .map(s => s.teacherId);
    
    return users.filter(u => !busyTeacherIds.includes(u.id) && u.isApproved && u.role !== UserRole.NV);
  };

  // Tính thứ trong tuần từ ngày chọn (2-7, CN=8)
  const getDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr).getDay();
    return d === 0 ? 8 : d + 1;
  };

  const handleSave = async () => {
    if (!formData.lessonName || !formData.className) return alert('Vui lòng điền đủ thông tin bài dạy!');
    setIsSaving(true);
    
    const dayOfWeek = getDayOfWeek(formData.date || '');
    const available = getAvailableTeachers(dayOfWeek, formData.period || 1, formData.session || 'Morning').map(u => u.id);

    const dataToSave = { 
      ...formData, 
      id: `demo-${Date.now()}`,
      availableTeachers: available
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'demos', action: 'save', data: dataToSave })
      });
      alert('Đăng ký thao giảng thành công!');
      setShowModal(false);
      fetchData();
    } catch (e) {
      alert('Lỗi khi lưu!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (demo: TeachingDemo, field: 'isCancelled' | 'isLate', value: boolean) => {
    if (!isAdmin) return;
    const updatedDemo = { ...demo, [field]: value };
    // Optimistic update
    setDemos(prev => prev.map(d => d.id === demo.id ? updatedDemo : d));
    
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ type: 'demos', action: 'save', data: updatedDemo })
    });
  };

  const totalDemos = demos.length;
  const cancelledDemos = demos.filter(d => d.isCancelled).length;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase">Kế hoạch thao giảng</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Dành cho giáo viên tổ Toán-Tin đăng ký dạy tốt</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="text-[10px] font-black text-slate-400 uppercase">Tổng số tiết: <span className="text-blue-600 text-lg">{totalDemos}</span></div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="text-[10px] font-black text-slate-400 uppercase">Đã hủy: <span className="text-red-500 text-lg">{cancelledDemos}</span></div>
           </div>
           <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Đăng ký mới</button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest">
                  <th className="p-6 w-16 text-center">STT</th>
                  <th className="p-6 w-20 text-center">Tuần</th>
                  <th className="p-6">Ngày dạy</th>
                  <th className="p-6 w-20 text-center">Tiết</th>
                  <th className="p-6 w-24 text-center">Lớp</th>
                  <th className="p-6">GV Thao giảng</th>
                  <th className="p-6">Tên bài dạy</th>
                  <th className="p-6">GV Dự giờ (Trống tiết)</th>
                  <th className="p-6 text-center">Trạng thái (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={9} className="p-20 text-center font-black text-slate-300 italic animate-pulse">Đang đồng bộ dữ liệu...</td></tr>
                ) : demos.length > 0 ? demos.map((demo, idx) => (
                  <tr key={demo.id} className={`transition-colors ${demo.isCancelled ? 'bg-red-50 opacity-70' : 'hover:bg-slate-50'}`}>
                    <td className="p-6 text-center font-black text-slate-400">{idx + 1}</td>
                    <td className="p-6 text-center font-black text-slate-800">{demo.week}</td>
                    <td className="p-6 font-bold text-slate-600 text-sm">
                       {demo.date}
                       {demo.isLate && <span className="block text-[9px] text-orange-500 font-black uppercase mt-1">Đến trễ</span>}
                    </td>
                    <td className="p-6 text-center font-black text-blue-600">{demo.period}</td>
                    <td className="p-6 text-center font-black text-slate-800">{demo.className}</td>
                    <td className="p-6">
                       <div className="font-black text-slate-800 text-sm">{users.find(u => u.id === demo.teacherId)?.name || 'N/A'}</div>
                       <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">TCT: {demo.tct}</div>
                    </td>
                    <td className="p-6 font-black text-slate-800 text-sm italic">{demo.lessonName}</td>
                    <td className="p-6">
                       <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {demo.availableTeachers?.length ? demo.availableTeachers.map(tid => {
                             const tName = users.find(u => u.id === tid)?.name.split(' ').pop();
                             return <span key={tid} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold">{tName}</span>
                          }) : <span className="text-xs text-slate-400 italic">Không có GV trống</span>}
                       </div>
                    </td>
                    <td className="p-6 text-center">
                       {isAdmin ? (
                         <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 px-3 py-1 rounded-lg hover:border-red-300">
                               <input type="checkbox" checked={demo.isCancelled || false} onChange={e => handleStatusChange(demo, 'isCancelled', e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                               <span className="text-[9px] font-black text-red-500 uppercase">Bỏ tiết</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 px-3 py-1 rounded-lg hover:border-orange-300">
                               <input type="checkbox" checked={demo.isLate || false} onChange={e => handleStatusChange(demo, 'isLate', e.target.checked)} className="w-4 h-4 text-orange-500 rounded" />
                               <span className="text-[9px] font-black text-orange-500 uppercase">Đến trễ</span>
                            </label>
                         </div>
                       ) : (
                          <div className="space-y-1">
                             {demo.isCancelled && <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase block">Đã bỏ tiết</span>}
                             {demo.isLate && <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[9px] font-black uppercase block">Đến trễ</span>}
                             {!demo.isCancelled && !demo.isLate && <span className="text-emerald-500 text-[10px] font-bold">Bình thường</span>}
                          </div>
                       )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={9} className="p-20 text-center font-black text-slate-300 italic uppercase">Chưa có bản đăng ký nào</td></tr>
                )}
              </tbody>
           </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl flex items-center justify-center z-50 p-6 overflow-y-auto">
           <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full p-12 my-8 animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic">Đăng ký thao giảng</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tuần học</label>
                   <input type="number" value={formData.week} onChange={e => setFormData({...formData, week: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Ngày dạy</label>
                   <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tiết dạy</label>
                   <select value={formData.period} onChange={e => setFormData({...formData, period: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                      {[1,2,3,4,5].map(p => <option key={p} value={p}>Tiết {p}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Lớp</label>
                   <input type="text" placeholder="VD: 9/1" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div className="col-span-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tên bài dạy</label>
                   <input type="text" value={formData.lessonName} onChange={e => setFormData({...formData, lessonName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" placeholder="VD: Bài toán về tỉ số phần trăm..." />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Tiết CT (TCT)</label>
                   <input type="number" value={formData.tct} onChange={e => setFormData({...formData, tct: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">GV Viết phiếu</label>
                   <select value={formData.reporterId} onChange={e => setFormData({...formData, reporterId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                      <option value="">-- Chọn GV --</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                   </select>
                </div>
                <div className="col-span-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Ghi chú</label>
                   <textarea rows={2} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold"></textarea>
                </div>
              </div>
              <div className="mt-10 flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-[10px]">Hủy bỏ</button>
                <button disabled={isSaving} onClick={handleSave} className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                  {isSaving ? 'Đang lưu...' : 'Lưu đăng ký'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeachingDemoPage;
