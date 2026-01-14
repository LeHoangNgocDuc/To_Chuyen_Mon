
import { User, UserRole, ScheduleItem, DocType, DocStatus, Document, SubstituteRequest, SystemNotification, TeachingDemo, StaffPosition } from './types';

export const ADMIN_EMAIL = 'lehoangngocducnt@gmail.com';
export const ADMIN_PASS = 'Anphuc01';
export const ADMIN_USERNAME = 'Anphuc';

// Dữ liệu thực tế sẽ được fetch từ Sheets, khởi tạo mảng trống
export const MOCK_USERS: User[] = [];
export const MOCK_SCHEDULE: ScheduleItem[] = [];
export const MOCK_SUBSTITUTES: SubstituteRequest[] = [];
export const MOCK_NOTIFICATIONS: SystemNotification[] = [];
export const MOCK_DEMOS: TeachingDemo[] = [];
export const MOCK_DOCS: Document[] = [];

export const ACADEMIC_YEARS = ['2023-2024', '2024-2025', '2025-2026'];
export const DRIVE_LINK = "https://drive.google.com/drive/folders/1drU0oZOez7T5g0vxEqyipD4TqVlnTfFk?usp=sharing";
