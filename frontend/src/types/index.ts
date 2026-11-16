export type UserRole = "teacher" | "student";
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  color: string;
}
export interface Classroom {
  id: string;
  title: string;
  subject: string;
  code: string;
  teacher: string;
  students: number;
  color: string;
  nextClass: string;
  progress: number;
}
export interface ClassSession {
  id: string;
  classroomId: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  students: number;
  status: "upcoming" | "live" | "completed";
}
export interface AttendanceRecord {
  id: string;
  student: string;
  initials: string;
  classroom: string;
  date: string;
  status: "present" | "late" | "absent";
}
export interface ChatMessage {
  id: string;
  sender: string;
  initials: string;
  text: string;
  time: string;
  color: string;
}
