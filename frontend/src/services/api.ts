import { attendance, classrooms, initialMessages, participants, sessions } from "./mockData";
import type { AttendanceRecord, ClassSession, Classroom } from "../types";

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));
let classroomStore = [...classrooms];

export const classroomService = {
  async list(): Promise<Classroom[]> { await delay(); return classroomStore; },
  async get(id: string): Promise<Classroom | undefined> { await delay(); return classroomStore.find((room) => room.id === id); },
  async create(classroom: Classroom): Promise<Classroom> {
    await delay();
    classroomStore = [classroom, ...classroomStore];
    return classroom;
  },
};
export const sessionService = {
  async list(): Promise<ClassSession[]> { await delay(); return sessions; },
};
export const attendanceService = {
  async list(): Promise<AttendanceRecord[]> { await delay(); return attendance; },
};
export const liveClassService = {
  async getRoom(): Promise<{ participants: typeof participants; messages: typeof initialMessages }> {
    await delay();
    return { participants, messages: initialMessages };
  },
};
