
export enum UserRole {
  GV = 'Giáo viên',
  NV = 'Nhân viên',
  TCM = 'Tổ trưởng chuyên môn',
  TP = 'Tổ phó',
  BGH = 'Ban giám hiệu'
}

export enum StaffPosition {
  NONE = 'Không',
  THIET_BI = 'Nhân viên Thiết bị',
  THU_VIEN = 'Nhân viên Thư viện'
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  subject: 'Toán' | 'Tin' | 'Khác';
  staffPosition?: StaffPosition;
  isApproved: boolean;
  assignedClasses?: string[];
  gradeLevel?: number[]; // Khối 6, 7, 8, 9
  isChuNhiem?: boolean;
  chuNhiemLop?: string;
  kiemNhiem?: string;
  duties?: string[];
}

export interface TeacherScoreRow {
  teacherId: string;
  tt: number; dn: number; sh: number; nq: number; qt: number;
  ga: number; sd: number; dg: number; lbg: number; tb: number; dt_hsss: number;
  ngc: number; bc: number; dt_ngaycong: number;
  tg: number; thct: number; clbm: number; dt_ctcm: number;
  chuNhiem: number;
  kiemNhiem: number;
  congTacKhac: number;
}

export interface ScheduleItem {
  id: string;
  teacherId: string;
  subject: string;
  className: string;
  period: number;
  dayOfWeek: number;
  session: 'Morning' | 'Afternoon';
  note?: string;
  isSubstitute?: boolean;
}

export interface SubstituteRequest {
  id: string;
  absentTeacherId: string;
  substituteTeacherId: string;
  reason: string;
  date: string;
  period: number;
  className: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  pointsAwarded: number;
}

// Added missing types to resolve import errors
export enum DocType {
  GKI = 'GKI',
  CKI = 'CKI',
  GKII = 'GKII',
  CKII = 'CKII'
}

export enum DocStatus {
  Approved = 'Đã duyệt',
  Draft = 'Chờ duyệt',
  NeedsEdit = 'Cần chỉnh sửa'
}

export interface Document {
  id: string;
  title: string;
  category: 'Đề cương' | 'Đề thi';
  type: string;
  grade: number;
  authorId: string;
  status: DocStatus;
  uploadDate: string;
  fileUrl?: string;
}

export interface SystemNotification {
  id: string;
  role: string;
  date: string;
  sender: string;
  content: string;
  isImportant?: boolean;
}

export interface TeachingDemo {
  id: string;
  date: string;
  teacherId: string;
  className: string;
  period: number;
  topic: string;
  result: string;
  notes?: string;
}
