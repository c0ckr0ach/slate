import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { studentUser, teacherUser } from "../services/mockData";
import type { User, UserRole } from "../types";

interface AppContextValue {
  user: User;
  role: UserRole;
  setRole: (role: UserRole) => void;
  signIn: (role: UserRole, name?: string) => void;
}
const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => localStorage.getItem("classroomlite-role") === "student" ? "student" : "teacher");
  const [names, setNames] = useState<Record<UserRole, string>>(() => ({
    teacher: localStorage.getItem("classroomlite-name-teacher") || "",
    student: localStorage.getItem("classroomlite-name-student") || "",
  }));
  const baseUser = role === "teacher" ? teacherUser : studentUser;
  const displayName = names[role];
  const user = displayName
    ? { ...baseUser, name: displayName, initials: displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() }
    : baseUser;
  const setRole = (nextRole: UserRole) => {
    localStorage.setItem("classroomlite-role", nextRole);
    setRoleState(nextRole);
  };
  const signIn = (nextRole: UserRole, name?: string) => {
    setRole(nextRole);
    if (name?.trim()) {
      localStorage.setItem(`classroomlite-name-${nextRole}`, name.trim());
      setNames((current) => ({ ...current, [nextRole]: name.trim() }));
    }
  };
  const value = useMemo(() => ({ user, role, setRole, signIn }), [user, role]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used within AppProvider");
  return value;
}
