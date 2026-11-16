import type { AttendanceRecord, ChatMessage, ClassSession, Classroom, User } from "../types";

export const teacherUser: User = { id: "u1", name: "Olivia Rhye", email: "olivia@example.com", role: "teacher", initials: "OR", color: "coral" };
export const studentUser: User = { id: "u2", name: "Alex Morgan", email: "alex@example.com", role: "student", initials: "AM", color: "lavender" };
export const classrooms: Classroom[] = [
  { id: "c1", title: "Algebra II", subject: "Mathematics", code: "ALG-204", teacher: "Olivia Rhye", students: 18, color: "mint", nextClass: "Today, 10:30 AM", progress: 68 },
  { id: "c2", title: "Organic Chemistry", subject: "Science", code: "CHEM-118", teacher: "Olivia Rhye", students: 12, color: "peach", nextClass: "Today, 2:00 PM", progress: 42 },
  { id: "c3", title: "Creative Writing", subject: "English", code: "ENG-301", teacher: "Olivia Rhye", students: 9, color: "lavender", nextClass: "Tomorrow, 11:00 AM", progress: 84 },
];
export const sessions: ClassSession[] = [
  { id: "s1", classroomId: "c1", title: "Quadratic equations", date: "Today", time: "10:30 AM", duration: "50 min", students: 18, status: "upcoming" },
  { id: "s2", classroomId: "c2", title: "Molecular structures", date: "Today", time: "2:00 PM", duration: "45 min", students: 12, status: "upcoming" },
  { id: "s3", classroomId: "c3", title: "Finding your voice", date: "Tomorrow", time: "11:00 AM", duration: "60 min", students: 9, status: "upcoming" },
];
export const attendance: AttendanceRecord[] = [
  { id: "a1", student: "Mia Chen", initials: "MC", classroom: "Algebra II", date: "Today, 10:30 AM", status: "present" },
  { id: "a2", student: "Noah Williams", initials: "NW", classroom: "Algebra II", date: "Today, 10:30 AM", status: "late" },
  { id: "a3", student: "Sofia Patel", initials: "SP", classroom: "Organic Chemistry", date: "Today, 9:00 AM", status: "present" },
  { id: "a4", student: "Ethan Brooks", initials: "EB", classroom: "Algebra II", date: "Yesterday, 10:30 AM", status: "absent" },
  { id: "a5", student: "Ava Thompson", initials: "AT", classroom: "Creative Writing", date: "Yesterday, 11:00 AM", status: "present" },
];
export const participants = [
  { name: "Olivia Rhye", initials: "OR", color: "coral", role: "Teacher" },
  { name: "Mia Chen", initials: "MC", color: "mint", role: "Student" },
  { name: "Noah Williams", initials: "NW", color: "lavender", role: "Student" },
  { name: "Sofia Patel", initials: "SP", color: "peach", role: "Student" },
];
export const initialMessages: ChatMessage[] = [
  { id: "m1", sender: "Olivia", initials: "OR", text: "Welcome everyone! We’ll get started in just a minute.", time: "10:28", color: "coral" },
  { id: "m2", sender: "Mia Chen", initials: "MC", text: "Good morning! 👋", time: "10:29", color: "mint" },
  { id: "m3", sender: "Noah Williams", initials: "NW", text: "I’m ready!", time: "10:29", color: "lavender" },
];
