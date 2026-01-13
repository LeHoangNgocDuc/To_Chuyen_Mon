
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

export interface TeachingDemo {
  id: string;
  teacherId: string;
  topic: string;
  date: string;
  className: string;
  period: number;
  status: 'Scheduled' | 'Completed';
}

export interface SystemNotification {
  id: string;
  sender: string;
  role: string;
  content: string;
  date: string;
  isImportant: boolean;
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

export enum DocType {
  GKI = 'GKI',
  CKI = 'CKI',
  GKII = 'GKII',
  CKII = 'CKII'
}

export enum DocStatus {
  Draft = 'Chưa duyệt',
  Approved = 'Đã duyệt',
  NeedsEdit = 'Cần chỉnh sửa'
}

export interface Document {
  id: string;
  title: string;
  type: DocType;
  category: 'Đề cương' | 'Đề thi';
  grade: number;
  authorId: string;
  uploadDate: string;
  fileUrl: string;
  status: DocStatus;
  isSpecialNeeds?: boolean;
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
