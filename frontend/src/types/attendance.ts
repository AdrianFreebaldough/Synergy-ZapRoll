export type AttendanceCategory = 'student' | 'employee' | 'guest' | 'poster';

export interface AttendanceBase {
  category: AttendanceCategory;
  session?: 'am' | 'pm' | 'out';
  token?: string;
  timestamp?: string;
}

export interface StudentAttendance extends AttendanceBase {
  category: 'student';
  studentId: string;
}

export interface EmployeeAttendance extends AttendanceBase {
  category: 'employee';
  name: string;
}

export interface GuestAttendance extends AttendanceBase {
  category: 'guest';
  name: string;
}

export interface PosterAttendance extends AttendanceBase {
  category: 'poster';
  studentId: string;
}

export type AttendanceFormData = StudentAttendance | EmployeeAttendance | GuestAttendance | PosterAttendance;
