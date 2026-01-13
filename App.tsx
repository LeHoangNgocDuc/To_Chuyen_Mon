
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Registration States
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.GV);
  const [authSubject, setAuthSubject] = useState<'Toán' | 'Tin' | 'Khác'>('Toán');
  const [authGrade, setAuthGrade] = useState('9');
  const [authClasses, setAuthClasses] = useState('');
  const [authKiemNhiem, setAuthKiemNhiem] = useState('');
  const [authIsChuNhiem, setAuthIsChuNhiem] = useState(false);
  const [authPass, setAuthPass] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?type=users`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const hasAdmin = data.some(u => u.username === ADMIN_USERNAME);
        if (!hasAdmin && data.length === 0) {
           const admin: User = { 
             id: '1', username: ADMIN_USERNAME, name: 'Quản trị viên', 
             email: ADMIN_EMAIL, password: ADMIN_PASS, role: UserRole.TCM, 
             subject: 'Toán', isApproved: true 
           };
           setUsers([admin]);
        } else {
           setUsers(data);
        }
      }
    } catch (e) {
      console.error("Lỗi tải thành viên:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === authUsername.toLowerCase());
    if (user) {
      if (user.password === authPass) {
        if (!user.isApproved) {
          alert('Tài khoản đang chờ Tổ trưởng phê duyệt!');
          return;
        }
        setCurrentUser(user);
      } else {
        alert('Sai mật khẩu!');
      }
    } else {
      alert('Tên đăng nhập không tồn tại!');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.username.toLowerCase() === authUsername.toLowerCase())) {
      alert('Tên đăng nhập đã tồn tại!');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: authUsername,
      name: authName,
      email: authEmail,
      password: authPass,
      role: authRole,
      subject: authSubject,
      gradeLevel: [parseInt(authGrade)],
      assignedClasses: authClasses.split(',').map(c => c.trim()).filter(c => c !== ''),
      kiemNhiem: authKiemNhiem,
      isChuNhiem: authIsChuNhiem,
      isApproved: authEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase(), 
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ type: 'users', action: 'save', data: newUser })
      });
      setUsers([...users, newUser]);
      alert('Đăng ký thành công! Vui lòng chờ Tổ trưởng duyệt.');
      setIsRegistering(false);
    } catch (e) {
      alert('Có lỗi khi đăng ký!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="font-black text-slate-400 uppercase tracking-widest animate-pulse italic">Đang tải dữ liệu thực tế từ Google Sheet...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-md w-full border border-slate-100 animate-in fade-in duration-500">
          <div className="mb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-blue-500/30 transform rotate-3 mb-4">THĐ</div>
            <h1 className="text-3xl font-black text-slate-800 text-center">
              {isRegistering ? 'Đăng ký mới' : 'Chào mừng'}
            </h1>
          </div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-3">
            {isRegistering ? (
              <>
                <input required type="text" value={authName} onChange={e => setAuthName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Họ và tên" />
                <input required type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Tên đăng nhập" />
                <input required type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Email" />
                
                <div className="grid grid-cols-2 gap-3">
                  <select value={authRole} onChange={e => setAuthRole(e.target.value as UserRole)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none">
                    <option value={UserRole.GV}>Giáo viên</option>
                    <option value={UserRole.NV}>Nhân viên</option>
                    <option value={UserRole.TCM}>Tổ trưởng</option>
                  </select>
                  <select value={authSubject} onChange={e => setAuthSubject(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none">
                    <option value="Toán">Toán</option>
                    <option value="Tin">Tin học</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                   <select value={authGrade} onChange={e => setAuthGrade(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none">
                      {[6, 7, 8, 9].map(g => <option key={g} value={g}>Khối {g}</option>)}
                   </select>
                   <input type="text" value={authClasses} onChange={e => setAuthClasses(e.target.value)} className="col-span-2 w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Lớp dạy (VD: 9/1, 9/2)" />
                </div>

                <input type="text" value={authKiemNhiem} onChange={e => setAuthKiemNhiem(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Chức vụ kiêm nhiệm (nếu có)" />
                
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer group">
                   <input type="checkbox" checked={authIsChuNhiem} onChange={e => setAuthIsChuNhiem(e.target.checked)} className="w-5 h-5 rounded-md text-blue-600 focus:ring-blue-500" />
                   <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Tôi là Giáo viên Chủ nhiệm</span>
                </label>

                <input required type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Mật khẩu" />
              </>
            ) : (
              <>
                <input required type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Tên đăng nhập" />
                <input required type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Mật khẩu" />
              </>
            )}
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-black transition-all mt-4 shadow-xl active:scale-95">
              {isRegistering ? 'Gửi yêu cầu' : 'Vào hệ thống'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">
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
