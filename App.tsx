
import React, { useState, useEffect } from 'react';
import { User, UserRole, SystemNotification } from './types';
import { ADMIN_EMAIL, ADMIN_PASS, ADMIN_USERNAME, SCRIPT_URL } from './constants';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SchedulePage from './pages/SchedulePage';
import CompetitionPage from './pages/CompetitionPage';
import DocumentPage from './pages/DocumentPage';
import SubstitutePage from './pages/SubstitutePage';
import ReportPage from './pages/ReportPage';
import AssignmentPage from './pages/AssignmentPage';
import TeachingDemoPage from './pages/TeachingDemoPage';

const SUBJECT_OPTIONS = ['Toán', 'Tin học', 'Công nghệ', 'Khác'];
const GRADES = [6, 7, 8, 9];
const CLASSES = [1, 2, 3, 4, 5, 6];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [regData, setRegData] = useState({
    name: '', username: '', email: '', password: '',
    role: UserRole.GV, tempSubject: 'Toán', tempGrade: 6, tempClass: 1, isChuNhiem: false
  });
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [uRes, nRes] = await Promise.all([
        fetch(`${SCRIPT_URL}?type=users`),
        fetch(`${SCRIPT_URL}?type=notifications`)
      ]);
      const uData = await uRes.json();
      const nData = await nRes.json();
      if (Array.isArray(uData)) setUsers(uData);
      if (Array.isArray(nData)) setNotifications(nData);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApproveUser = async (userToApprove: User) => {
    // Optimistic UI: Cập nhật danh sách ngay lập tức
    const updatedUser = { ...userToApprove, isApproved: true };
    setUsers(prev => prev.map(u => u.id === userToApprove.id ? updatedUser : u));

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
          type: 'users', 
          action: 'save', 
          data: updatedUser 
        })
      });
      // Giả định thành công vì no-cors
    } catch (e) {
      alert('Lỗi khi lưu phê duyệt! Hệ thống sẽ tải lại dữ liệu.');
      fetchData();
    }
  };

  const addAssignment = () => {
    const entry = `${regData.tempSubject} ${regData.tempGrade}/${regData.tempClass}`;
    if (!assignedClasses.includes(entry)) {
      setAssignedClasses([...assignedClasses, entry]);
    }
  };

  const removeAssignment = (item: string) => {
    setAssignedClasses(assignedClasses.filter(c => c !== item));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignedClasses.length === 0) return alert('Vui lòng thêm ít nhất một phân công lớp dạy!');
    
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: regData.name,
      username: regData.username,
      email: regData.email,
      password: regData.password,
      role: regData.role,
      subject: assignedClasses[0]?.split(' ')[0] || regData.tempSubject,
      isApproved: false,
      assignedClasses,
      duties: [],
      isChuNhiem: regData.isChuNhiem
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'users', action: 'save', data: newUser })
      });
      setUsers([...users, newUser]);
      alert('Đăng ký thành công! Vui lòng chờ Tổ trưởng phê duyệt.');
      setIsRegistering(false);
    } catch (e) {
      alert('Lỗi đăng ký!');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.username === ADMIN_USERNAME && regData.password === ADMIN_PASS) {
      setCurrentUser({
        id: 'admin-001', name: 'Quản trị viên (An Phục)', username: ADMIN_USERNAME, email: ADMIN_EMAIL,
        role: UserRole.TCM, subject: 'Toán', isApproved: true, assignedClasses: [], duties: ['Tổ trưởng chuyên môn']
      });
      return;
    }
    const found = users.find(u => u.username === regData.username && u.password === regData.password);
    if (found) {
      if (!found.isApproved) return alert('Tài khoản chưa được phê duyệt!');
      setCurrentUser(found);
    } else alert('Sai thông tin đăng nhập!');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-300 animate-pulse bg-slate-100 uppercase italic tracking-widest">ĐANG TẢI HỆ THỐNG...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl max-w-md w-full border border-slate-100 overflow-y-auto max-h-[95vh]">
           <div className="mb-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.8rem] flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-blue-500/30 transform rotate-6 mb-4">THĐ</div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">{isRegistering ? 'Đăng ký' : 'Tổ Toán-Tin'}</h1>
          </div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering ? (
              <>
                <input required type="text" placeholder="Họ và tên" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
                <input required type="text" placeholder="Tên đăng nhập" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
                <input required type="email" placeholder="Email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
                
                <div className="p-5 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100 space-y-3">
                  <div className="text-[10px] font-black text-blue-800 uppercase italic tracking-widest">Phân công chuyên môn</div>
                  <div className="space-y-2">
                    <select value={regData.tempSubject} onChange={e => setRegData({...regData, tempSubject: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-black text-blue-600 outline-none">
                      {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <select value={regData.tempGrade} onChange={e => setRegData({...regData, tempGrade: parseInt(e.target.value)})} className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none">
                        {GRADES.map(g => <option key={g} value={g}>Khối {g}</option>)}
                      </select>
                      <select value={regData.tempClass} onChange={e => setRegData({...regData, tempClass: parseInt(e.target.value)})} className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none">
                        {CLASSES.map(c => <option key={c} value={c}>Lớp {c}</option>)}
                      </select>
                      <button type="button" onClick={addAssignment} className="bg-blue-600 text-white px-5 rounded-xl font-black shadow-lg active:scale-90">+</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100">
                    {assignedClasses.length > 0 ? assignedClasses.map(item => (
                      <div key={item} className="flex items-center gap-2 px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-xl text-[10px] font-black shadow-sm">
                        {item}
                        <button type="button" onClick={() => removeAssignment(item)} className="text-red-400 hover:text-red-600 font-black">×</button>
                      </div>
                    )) : (
                      <div className="text-[9px] text-slate-400 italic">Chưa thêm phân công nào</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2">
                  <input type="checkbox" checked={regData.isChuNhiem} onChange={e => setRegData({...regData, isChuNhiem: e.target.checked})} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600" id="isChuNhiem" />
                  <label htmlFor="isChuNhiem" className="text-[11px] font-black text-slate-500 uppercase cursor-pointer">Tôi là giáo viên chủ nhiệm</label>
                </div>

                <input required type="password" placeholder="Mật khẩu" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
              </>
            ) : (
              <>
                <input required type="text" placeholder="Tên đăng nhập" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
                <input required type="password" placeholder="Mật khẩu" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
              </>
            )}
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
              {isRegistering ? 'Hoàn tất đăng ký' : 'Vào hệ thống'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest underline underline-offset-8">
              {isRegistering ? 'Quay lại đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setCurrentUser(null)} currentYear={currentYear} setCurrentYear={setCurrentYear}>
      {activeTab === 'dashboard' && <Dashboard user={currentUser} year={currentYear} notifications={notifications} onRefresh={fetchData} onUpdateProfile={(u) => { setCurrentUser(u); fetchData(); }} />}
      {activeTab === 'schedule' && <SchedulePage user={currentUser} />}
      {activeTab === 'assignment' && <AssignmentPage user={currentUser} users={users} onApprove={handleApproveUser} onChangeRole={(id, r) => { fetchData(); }} onDeleteUser={fetchData} />}
      {activeTab === 'substitute' && <SubstitutePage user={currentUser} />}
      {activeTab === 'competition' && <CompetitionPage user={currentUser} />}
      {activeTab === 'demos' && <TeachingDemoPage user={currentUser} users={users} />}
      {activeTab === 'documents' && <DocumentPage user={currentUser} />}
      {activeTab === 'reports' && <ReportPage user={currentUser} year={currentYear} />}
    </Layout>
  );
};

export default App;
