
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
const SUBJECT_OPTIONS = ['Toán', 'Tin học', 'Công nghệ', 'Khác'];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form States cho Đăng ký
  const [regData, setRegData] = useState({
    name: '', username: '', email: '', password: '',
    role: UserRole.GV, 
    tempSubject: 'Toán',
    tempGrade: '6', 
    tempClass: '1',
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

  const handleAddAssignment = () => {
    const entry = `${regData.tempSubject} ${regData.tempGrade}/${regData.tempClass}`;
    if (!assignedClasses.includes(entry)) {
      setAssignedClasses([...assignedClasses, entry]);
    }
  };

  const removeAssignment = (item: string) => {
    setAssignedClasses(assignedClasses.filter(i => i !== item));
  };

  const toggleDuty = (duty: string) => {
    setSelectedDuties(prev => 
      prev.includes(duty) ? prev.filter(d => d !== duty) : [...prev, duty]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignedClasses.length === 0) {
      alert('Vui lòng thêm ít nhất một phân công lớp dạy!');
      return;
    }
    if (users.find(u => u.username === regData.username)) {
      alert('Tên đăng nhập đã tồn tại!'); return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: regData.name,
      username: regData.username,
      email: regData.email,
      password: regData.password,
      role: regData.role,
      subject: assignedClasses[0]?.split(' ')[0] || 'Toán', // Môn chính là môn đầu tiên chọn
      isApproved: false, // Tất cả cần được duyệt
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
      alert('Đăng ký thành công! Vui lòng chờ Tổ trưởng chuyên môn phê duyệt.');
      setIsRegistering(false);
    } catch (e) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra Admin cứng trước
    if (regData.username === ADMIN_USERNAME && regData.password === ADMIN_PASS) {
      setCurrentUser({
        id: 'admin-001',
        name: 'Quản trị viên (An Phục)',
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        role: UserRole.TCM,
        subject: 'Toán',
        isApproved: true,
        assignedClasses: [],
        duties: ['Tổ trưởng chuyên môn']
      });
      return;
    }

    // Kiểm tra DB
    const found = users.find(u => u.username === regData.username && u.password === regData.password);
    if (found) {
      if (!found.isApproved) return alert('Tài khoản của bạn đang chờ Tổ trưởng phê duyệt!');
      setCurrentUser(found);
    } else alert('Thông tin đăng nhập không chính xác!');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 animate-pulse italic bg-slate-100 uppercase tracking-widest">Đang tải dữ liệu thực tế...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border border-slate-100 overflow-y-auto max-h-[95vh] animate-in fade-in zoom-in duration-500">
          <div className="mb-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.8rem] flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-blue-500/30 transform rotate-6 mb-4">THĐ</div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">{isRegistering ? 'Đăng ký mới' : 'Hệ thống Tổ'}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">THCS TRẦN HƯNG ĐẠO</p>
          </div>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering ? (
              <>
                <input required type="text" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Họ và tên" />
                <input required type="text" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Tên đăng nhập" />
                <input required type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Email" />
                
                <div className="grid grid-cols-2 gap-3">
                  <select value={regData.role} onChange={e => setRegData({...regData, role: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none appearance-none">
                    <option value={UserRole.GV}>Giáo viên</option>
                    <option value={UserRole.NV}>Nhân viên</option>
                  </select>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer group">
                     <input type="checkbox" checked={regData.isChuNhiem} onChange={e => setRegData({...regData, isChuNhiem: e.target.checked})} className="w-5 h-5 rounded-md text-blue-600 focus:ring-blue-500" />
                     <span className="text-[11px] font-black text-slate-600 group-hover:text-blue-600 transition-colors uppercase">Chủ nhiệm</span>
                  </label>
                </div>

                {/* Chọn Phân công Đa môn Đa lớp */}
                <div className="p-5 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100 space-y-3">
                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 ml-1">Phân công lớp dạy</label>
                  <div className="space-y-2">
                    <select value={regData.tempSubject} onChange={e => setRegData({...regData, tempSubject: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none shadow-sm">
                      {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <select value={regData.tempGrade} onChange={e => setRegData({...regData, tempGrade: e.target.value})} className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none shadow-sm">
                        {[6,7,8,9].map(g => <option key={g} value={g}>Khối {g}</option>)}
                      </select>
                      <select value={regData.tempClass} onChange={e => setRegData({...regData, tempClass: e.target.value})} className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none shadow-sm">
                        {[1,2,3,4,5,6].map(c => <option key={c} value={c}>Lớp {c}</option>)}
                      </select>
                      <button type="button" onClick={handleAddAssignment} className="bg-blue-600 text-white px-5 rounded-xl font-black shadow-lg shadow-blue-500/30 active:scale-90 transition-all">+</button>
                    </div>
                  </div>
                  
                  {assignedClasses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-blue-100">
                      {assignedClasses.map(item => (
                        <div key={item} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-xl text-[10px] font-black shadow-sm group">
                          {item}
                          <button type="button" onClick={() => removeAssignment(item)} className="text-red-400 hover:text-red-600 font-black">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chọn Kiêm nhiệm Multi-select */}
                <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Chức vụ kiêm nhiệm</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DUTIES_OPTIONS.map(duty => (
                      <button 
                        type="button" 
                        key={duty} 
                        onClick={() => toggleDuty(duty)} 
                        className={`p-2.5 text-[9px] font-black rounded-xl border transition-all ${
                          selectedDuties.includes(duty) 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {duty}
                      </button>
                    ))}
                  </div>
                </div>

                <input required type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Mật khẩu" />
              </>
            ) : (
              <>
                <input required type="text" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Tên đăng nhập" />
                <input required type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Mật khẩu" />
              </>
            )}
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all mt-6 shadow-2xl active:scale-95">
              {isRegistering ? 'GỬI YÊU CẦU ĐĂNG KÝ' : 'VÀO HỆ THỐNG'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
              {isRegistering ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký tại đây'}
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
