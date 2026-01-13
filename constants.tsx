
import { User, UserRole, ScheduleItem, DocType, DocStatus, Document, SubstituteRequest, SystemNotification, TeachingDemo, StaffPosition } from './types';

export const ADMIN_EMAIL = 'lehoangngocducnt@gmail.com';
export const ADMIN_PASS = 'Anphuc01';
export const ADMIN_USERNAME = 'admin';

export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    username: ADMIN_USERNAME,
    name: 'Đức', 
    email: ADMIN_EMAIL, 
    password: ADMIN_PASS,
    role: UserRole.TCM, 
    subject: 'Toán', 
    isApproved: true,
    duties: ['Quản lý phòng Tin'] 
  },
  { id: '2', username: 'dungtv', name: 'Dũng', email: 'dung@school.vn', password: '123', role: UserRole.GV, subject: 'Toán', assignedClasses: ['9/1', '9/2'], duties: ['Chủ nhiệm 9/1'], isApproved: true },
  { id: '3', username: 'dieplt', name: 'Diệp', email: 'diep@school.vn', password: '123', role: UserRole.GV, subject: 'Tin', assignedClasses: ['8/1', '8/2'], duties: ['Dạy bồi dưỡng'], isApproved: true },
  { id: '4', username: 'hienpv', name: 'Hiền', email: 'hien@school.vn', password: '123', role: UserRole.GV, subject: 'Toán', assignedClasses: ['6/1', '6/2'], isApproved: true },
  { id: '5', username: 'haiv', name: 'Hải', email: 'hai@school.vn', password: '123', role: UserRole.NV, staffPosition: StaffPosition.THIET_BI, subject: 'Khác', isApproved: true },
  { id: '6', username: 'anhnt', name: 'T.Anh', email: 'tanh@school.vn', password: '123', role: UserRole.GV, subject: 'Toán', isApproved: true },
  { id: '7', username: 'anhlv', name: 'L.Anh', email: 'lanh@school.vn', password: '123', role: UserRole.GV, subject: 'Toán', isApproved: true },
  { id: '8', username: 'ngantpt', name: 'Ngân(TPT)', email: 'ngan.tpt@school.vn', password: '123', role: UserRole.TP, subject: 'Toán', isApproved: true },
];

export const MOCK_SCHEDULE: ScheduleItem[] = [
  // Fixed missing 'session' property on lines 30 and 31
  { id: 's1', teacherId: '2', subject: 'Toán', className: '9/1', period: 1, dayOfWeek: 2, session: 'Morning' },
  { id: 's2', teacherId: '3', subject: 'Tin', className: '8/2', period: 3, dayOfWeek: 3, session: 'Morning' },
];

export const MOCK_SUBSTITUTES: SubstituteRequest[] = [
  { 
    id: 'sub1', absentTeacherId: '2', substituteTeacherId: '3', 
    reason: 'Đi họp', date: '2024-10-25', period: 2, className: '9/1', status: 'Approved', pointsAwarded: 0.25 
  }
];

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  { id: 'n1', sender: 'Nguyễn Văn Đức', role: 'Tổ trưởng', content: 'Họp tổ chuyên môn định kỳ tháng 11 tại phòng 202.', date: '2024-10-30', isImportant: true },
  { id: 'n2', sender: 'Ngân', role: 'Tổ phó', content: 'Cập nhật đề cương ôn tập GK1 lên hệ thống trước ngày 05/11.', date: '2024-10-28', isImportant: false },
];

export const MOCK_DEMOS: TeachingDemo[] = [
  { id: 'td1', teacherId: '2', topic: 'Chuyên đề: Giải bài toán bằng cách lập phương trình', date: '2024-11-10', className: '9/1', period: 2, status: 'Scheduled' },
  { id: 'td2', teacherId: '3', topic: 'Thao giảng: Lập trình Python', date: '2024-11-15', className: '8/2', period: 4, status: 'Scheduled' },
];

export const MOCK_DOCS: Document[] = [
  { id: 'd1', title: 'Đề cương Toán 9 GK1', type: DocType.GKI, category: 'Đề cương', grade: 9, authorId: '2', uploadDate: '2024-10-15', fileUrl: '#', status: DocStatus.Approved },
];

export const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026'];
export const DRIVE_LINK = "https://drive.google.com/drive/folders/1drU0oZOez7T5g0vxEqyipD4TqVlnTfFk?usp=sharing";
