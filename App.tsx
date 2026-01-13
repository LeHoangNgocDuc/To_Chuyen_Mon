
import React, { useState, useEffect } from 'react';
import { User, UserRole, StaffPosition } from './types';
import { MOCK_USERS, ADMIN_EMAIL, ADMIN_PASS, ADMIN_USERNAME } from './constants';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SchedulePage from './pages/SchedulePage';
import CompetitionPage from './pages/CompetitionPage';
import DocumentPage from './pages/DocumentPage';
import SubstitutePage from './pages/SubstitutePage';
import ReportPage from './pages/ReportPage';
import AssignmentPage from './pages/AssignmentPage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('thd_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  const [isRegistering, setIsRegistering] = useState(false);

  // Auth States
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.GV);
  const [authStaffPos, setAuthStaffPos] = useState<StaffPosition>(StaffPosition.NONE);
  const [authSubject, setAuthSubject] = useState<'Toán' | 'Tin' | 'Khác'>('Toán');

  useEffect(() => {
    localStorage.setItem('thd_users', JSON.stringify(users));
  }, [users]);

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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.username.toLowerCase() === authUsername.toLowerCase())) {
      alert('Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.');
      return;
    }
    if (users.find(u => u.email.toLowerCase() === authEmail.toLowerCase())) {
      alert('Email đã được sử dụng!');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: authUsername,
      name: authName,
      email: authEmail,
      password: authPass,
      role: authRole,
      staffPosition: authRole === UserRole.NV ? authStaffPos : StaffPosition.NONE,
      subject: authSubject,
      isApproved: authEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase(), // Auto approve admin email
    };

    setUsers([...users, newUser]);
    alert('Đăng ký thành công! Vui lòng chờ Tổ trưởng (Admin) duyệt tài khoản của bạn.');
    setIsRegistering(false);
    // Reset fields
    setAuthUsername('');
    setAuthPass('');
    setAuthEmail('');
    setAuthName('');
  };

  const handleApprove = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isApproved: true } : u));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100">
          <div className="mb-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/30 transform rotate-3">THĐ</div>
            <h1 className="text-3xl font-black text-slate-800 text-center mt-6">
              {isRegistering ? 'Đăng ký mới' : 'Chào mừng trở lại'}
            </h1>
            <p className="text-slate-400 text-center text-[10px] font-black uppercase tracking-[0.2em] mt-2">THCS Trần Hưng Đạo • Tổ Toán - Tin</p>
          </div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Họ và tên giáo viên</label>
                    <input required type="text" value={authName} onChange={e => setAuthName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" placeholder="Ví dụ: Nguyễn Văn Đức" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên đăng nhập (Dễ nhớ)</label>
                    <input required type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" placeholder="Ví dụ: ducnv" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email liên lạc</label>
                    <input required type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" placeholder="để nhận báo cáo/thông báo" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Đối tượng</label>
                    <select value={authRole} onChange={e => setAuthRole(e.target.value as UserRole)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all">
                      <option value={UserRole.GV}>Giáo viên</option>
                      <option value={UserRole.NV}>Nhân viên</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vị trí/Môn</label>
                    {authRole === UserRole.GV ? (
                      <select value={authSubject} onChange={e => setAuthSubject(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all">
                        <option value="Toán">Toán</option>
                        <option value="Tin">Tin học</option>
                        <option value="Khác">Khác</option>
                      </select>
                    ) : (
                      <select value={authStaffPos} onChange={e => setAuthStaffPos(e.target.value as StaffPosition)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all">
                        <option value={StaffPosition.THIET_BI}>NV Thiết bị</option>
                        <option value={StaffPosition.THU_VIEN}>NV Thư viện</option>
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mật khẩu</label>
                  <input required type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" placeholder="••••••••" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên đăng nhập</label>
                  <input required type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" placeholder="Nhập tên đăng nhập của bạn" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mật khẩu</label>
                  <input required type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all" placeholder="••••••••" />
                </div>
              </>
            )}
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all mt-6">
              {isRegistering ? 'Gửi yêu cầu phê duyệt' : 'Đăng nhập ngay'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthUsername('');
                setAuthPass('');
              }}
              className="text-blue-600 text-[10px] font-black hover:underline uppercase tracking-widest"
            >
              {isRegistering ? 'Đã có tài khoản? Quay lại đăng nhập' : 'Chưa có tài khoản? Đăng ký tại đây'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} year={currentYear} />;
      case 'schedule': return <SchedulePage user={currentUser} />;
      case 'assignment': return <AssignmentPage user={currentUser} users={users} onApprove={handleApprove} />;
      case 'substitute': return <SubstitutePage user={currentUser} />;
      case 'competition': return <CompetitionPage user={currentUser} />;
      case 'documents': return <DocumentPage user={currentUser} />;
      case 'reports': return <ReportPage user={currentUser} year={currentYear} />;
      default: return <Dashboard user={currentUser} year={currentYear} />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={() => setCurrentUser(null)}
      currentYear={currentYear}
      setCurrentYear={setCurrentYear}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
