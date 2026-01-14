
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
    role: UserRole.GV, tempSubject: 'Toán', isChuNhiem: false
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

  const toggleClass = (grade: number, cls: number) => {
    const entry = `${regData.tempSubject} ${grade}/${cls}`;
    if (assignedClasses.includes(entry)) {
      setAssignedClasses(assignedClasses.filter(c => c !== entry));
    } else {
      setAssignedClasses([...assignedClasses, entry]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignedClasses.length === 0) return alert('Vui lòng chọn ít nhất một lớp giảng dạy!');
    if (users.find(u => u.username === regData.username)) return alert('Tên đăng nhập đã tồn tại!');

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: regData.name,
      username: regData.username,
      email: regData.email,
      password: regData.password,
      role: regData.role,
      subject: regData.tempSubject, // Môn dạy chính là môn đang chọn khi đăng ký
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-300 animate-pulse bg-slate-100 uppercase italic tracking-widest">KẾT NỐI HỆ THỐNG DRIVE...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="bg-white p-10 rounded-[4rem] shadow-2xl max-w-2xl w-full border border-slate-100 overflow-y-auto max-h-[95vh]">
           <div className="mb-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/30 transform rotate-6 mb-4">THĐ</div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">{isRegistering ? 'Đăng ký thành viên' : 'Hệ thống Tổ Toán-Tin'}</h1>
          </div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            {isRegistering ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Họ và tên" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
                  <input required type="text" placeholder="Tên đăng nhập" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
                </div>
                <input required type="email" placeholder="Email liên lạc" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
                
                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border-2 border-blue-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-blue-800 uppercase tracking-widest italic">Phân công chuyên môn</label>
                    <select value={regData.tempSubject} onChange={e => setRegData({...regData, tempSubject: e.target.value})} className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-xs font-black text-blue-600 outline-none">
                      {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-6">
                    {GRADES.map(grade => (
                      <div key={grade} className="space-y-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Khối {grade}</div>
                        <div className="grid grid-cols-6 gap-2">
                          {CLASSES.map(cls => {
                            const entry = `${regData.tempSubject} ${grade}/${cls}`;
                            const isActive = assignedClasses.includes(entry);
                            return (
                              <button 
                                key={cls} 
                                type="button" 
                                onClick={() => toggleClass(grade, cls)}
                                className={`py-3 rounded-xl text-[10px] font-black transition-all border ${
                                  isActive 
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg' 
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

                  {assignedClasses.length > 0 && (
                    <div className="pt-4 border-t border-blue-100">
                      <div className="text-[9px] font-black text-blue-400 uppercase mb-2">Đã chọn ({assignedClasses.length} lớp):</div>
                      <div className="flex flex-wrap gap-2">
                        {assignedClasses.map(item => (
                          <span key={item} className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-[8px] font-black text-blue-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 px-2">
                  <input type="checkbox" checked={regData.isChuNhiem} onChange={e => setRegData({...regData, isChuNhiem: e.target.checked})} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600" id="isChuNhiem" />
                  <label htmlFor="isChuNhiem" className="text-[11px] font-black text-slate-500 uppercase cursor-pointer">Tôi là giáo viên chủ nhiệm</label>
                </div>

                <input required type="password" placeholder="Mật khẩu bảo mật" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
              </>
            ) : (
              <>
                <input required type="text" placeholder="Tên đăng nhập" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
                <input required type="password" placeholder="Mật khẩu" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" />
              </>
            )}
            <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-95">
              {isRegistering ? 'Hoàn tất đăng ký' : 'Vào hệ thống'}
            </button>
          </form>
          <div className="mt-10 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest underline underline-offset-8 decoration-2">
              {isRegistering ? 'Quay lại màn hình đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
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
      {activeTab === 'assignment' && <AssignmentPage user={currentUser} users={users} onApprove={() => fetchData()} onChangeRole={() => fetchData()} onDeleteUser={fetchData} />}
      {activeTab === 'substitute' && <SubstitutePage user={currentUser} />}
      {activeTab === 'competition' && <CompetitionPage user={currentUser} />}
      {activeTab === 'demos' && <TeachingDemoPage user={currentUser} users={users} />}
      {activeTab === 'documents' && <DocumentPage user={currentUser} />}
      {activeTab === 'reports' && <ReportPage user={currentUser} year={currentYear} />}
    </Layout>
  );
};

export default App;
