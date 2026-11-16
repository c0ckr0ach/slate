import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import Avatar from "./Avatar";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, role, setRole } = useApp();
  return <header className="topbar"><button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button><div className="crumb">Workspace <span>/</span> <strong>{role === "teacher" ? "Overview" : "My learning"}</strong></div><div className="topbar-right"><button className="search-trigger"><Search size={16} /><span>Search anything</span><kbd>⌘ K</kbd></button><button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button><div className="user-chip"><Avatar initials={user.initials} color={user.color} size="sm" /><span>{user.name}</span><ChevronDown size={15} /></div><select aria-label="Preview user role" className="role-select" value={role} onChange={(event) => setRole(event.target.value as "teacher" | "student")}><option value="teacher">Teacher preview</option><option value="student">Student preview</option></select></div></header>;
}
