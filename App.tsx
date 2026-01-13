
import React, { useState, useEffect } from 'react';
import { User, UserRole, StaffPosition } from './types';
import { ADMIN_EMAIL, ADMIN_PASS, ADMIN_USERNAME } from './constants';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SchedulePage from './pages/SchedulePage';
import CompetitionPage from './pages/CompetitionPage';
import DocumentPage from './pages/DocumentPage';
import SubstitutePage from './pages/SubstitutePage';
import ReportPage from './pages/ReportPage';
import AssignmentPage from './pages/AssignmentPage';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJYsC2pw7Dnp88JVzPLs5CwhrUwaUnd8_BgRNHOTivzsNQ93lcdUxS1_JdH1a4JTW6/exec';

const DUTIES_OPTIONS = ['Tổ phó', 'Thanh tra', 'Quản lý phòng tin', 'Quản lý phòng thiết bị'];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [regData, setRegData] = useState({
    name: '', username: '', email: '', password: '',
    role: UserRole.GV, subject: 'Toán',
    grade: '6', classNum: '1',
    isChuNhiem: false
  });
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [selectedDuties, setSelectedDuties] = useState<string[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?type=users`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddClass = () => {
    const newClass = `${regData.grade}/${regData.classNum}`;
    if (!assignedClasses.includes(newClass)) {
      setAssignedClasses([...assignedClasses, newClass]);
    }
  };

  const toggleDuty = (duty: string) => {
    setSelectedDuties(prev => 
      prev.includes(duty) ? prev.filter(d => d !== duty) : [...prev, duty]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.username === regData.username)) {
      alert('Tên đăng nhập đã tồn tại!'); return;
    }

    const finalSubject = regData.isChuNhiem ? `${regData.subject}, Hoạt động trải nghiệm` : regData.subject;

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: regData.name,
      username: regData.username,
      email: regData.email,
      password: regData.password,
      role: regData.role,
      subject: finalSubject,
      isApproved: regData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      assignedClasses: assignedClasses,
      duties: selectedDuties,
      isChuNhiem: regData.isChuNhiem
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'users', action: 'save', data: newUser })
      });
      setUsers([...users, newUser]);
      alert('Gửi yêu cầu thành công! Vui lòng chờ phê duyệt.');
      setIsRegistering(false);
    } catch (e) {
      alert('Lỗi đăng ký!');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.username === regData.username && u.password === regData.password);
    if (found) {
      if (!found.isApproved) return alert('Chờ duyệt!');
      setCurrentUser(found);
    } else alert('Sai thông tin!');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 animate-pulse italic">KẾT NỐI HỆ THỐNG...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-md w-full border border-slate-100 overflow-y-auto max-h-[90vh]">
          <div className="mb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-blue-500/30 transform rotate-3 mb-4">THĐ</div>
            <h1 className="text-3xl font-black text-slate-800">{isRegistering ? 'Đăng ký mới' : 'Chào mừng'}</h1>
          </div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering ? (
              <>
                <input required type="text" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Họ và tên" />
                <input required type="text" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Tên đăng nhập" />
                <input required type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Email" />
                
                <div className="grid grid-cols-2 gap-3">
                  <select value={regData.role} onChange={e => setRegData({...regData, role: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                    <option value={UserRole.GV}>Giáo viên</option>
                    <option value={UserRole.NV}>Nhân viên</option>
                  </select>
                  <select value={regData.subject} onChange={e => setRegData({...regData, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold">
                    <option value="Toán">Toán</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Phân công lớp</label>
                  <div className="flex gap-2 mb-3">
                    <select value={regData.grade} onChange={e => setRegData({...regData, grade: e.target.value})} className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold">
                      {[6,7,8,9].map(g => <option key={g} value={g}>Khối {g}</option>)}
                    </select>
                    <select value={regData.classNum} onChange={e => setRegData({...regData, classNum: e.target.value})} className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold">
                      {[1,2,3,4,5,6].map(c => <option key={c} value={c}>Lớp {c}</option>)}
                    </select>
                    <button type="button" onClick={handleAddClass} className="bg-blue-600 text-white px-3 rounded-xl font-bold">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {assignedClasses.map(c => (
                      <span key={c} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black">{c}</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Kiêm nhiệm</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DUTIES_OPTIONS.map(duty => (
                      <button type="button" key={duty} onClick={() => toggleDuty(duty)} className={`p-2 text-[9px] font-black rounded-lg border transition-all ${selectedDuties.includes(duty) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                        {duty}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                   <input type="checkbox" checked={regData.isChuNhiem} onChange={e => setRegData({...regData, isChuNhiem: e.target.checked})} className="w-5 h-5 rounded-md text-blue-600" />
                   <span className="text-sm font-bold text-slate-700 italic">Tôi là Giáo viên Chủ nhiệm</span>
                </label>

                <input required type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Mật khẩu" />
              </>
            ) : (
              <>
                <input required type="text" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Tên đăng nhập" />
                <input required type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Mật khẩu" />
              </>
            )}
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-black transition-all mt-4 shadow-xl">
              {isRegistering ? 'GỬI YÊU CẦU' : 'VÀO HỆ THỐNG'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest">
              {isRegistering ? 'Quay lại Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setCurrentUser(null)} currentYear={currentYear} setCurrentYear={setCurrentYear}>
      {activeTab === 'dashboard' && <Dashboard user={currentUser} year={currentYear} />}
      {activeTab === 'schedule' && <SchedulePage user={currentUser} />}
      {activeTab === 'assignment' && <AssignmentPage user={currentUser} users={users} onApprove={fetchUsers} onDeleteUser={fetchUsers} />}
      {activeTab === 'substitute' && <SubstitutePage user={currentUser} />}
      {activeTab === 'competition' && <CompetitionPage user={currentUser} />}
      {activeTab === 'documents' && <DocumentPage user={currentUser} />}
      {activeTab === 'reports' && <ReportPage user={currentUser} year={currentYear} />}
    </Layout>
  );
};

export default App;
