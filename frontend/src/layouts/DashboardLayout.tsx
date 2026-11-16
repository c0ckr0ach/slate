import { useState } from "react";
import { BookOpen, CalendarDays, ChartNoAxesColumn, CircleHelp, GraduationCap, LayoutDashboard, LogOut, Settings, Users, X } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { role } = useApp();
  const navigate = useNavigate();
  const navItems = role === "teacher"
    ? [{ label: "Overview", to: "/app", icon: <LayoutDashboard size={18} />, end: true }, { label: "Classrooms", to: "/app/classrooms", icon: <BookOpen size={18} /> }, { label: "Students", to: "/app/students", icon: <Users size={18} /> }, { label: "Schedule", to: "/app/schedule", icon: <CalendarDays size={18} /> }, { label: "Attendance", to: "/app/attendance", icon: <ChartNoAxesColumn size={18} /> }]
    : [{ label: "My learning", to: "/app", icon: <LayoutDashboard size={18} />, end: true }, { label: "Classrooms", to: "/app/classrooms", icon: <BookOpen size={18} /> }, { label: "Schedule", to: "/app/schedule", icon: <CalendarDays size={18} /> }, { label: "Attendance", to: "/app/attendance", icon: <ChartNoAxesColumn size={18} /> }];
  const sidebar = <><div className="brand-lockup"><span className="brand-mark"><GraduationCap size={21} /></span><span>classroom<span className="brand-light">lite</span></span><button className="icon-button close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18} /></button></div><div className="workspace-label">WORKSPACE</div><nav className="side-nav">{navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>{item.icon}{item.label}{item.label === "Students" && <span className="nav-count">39</span>}</NavLink>)}</nav><div className="sidebar-bottom"><div className="upgrade-card"><span className="upgrade-spark">✦</span><strong>Make more room<br />to grow</strong><p>Bring your whole teaching community together.</p><button onClick={() => navigate("/app/classrooms")}>Explore classrooms <span>↗</span></button></div><NavLink to="/app/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}><Settings size={18} />Settings</NavLink><button className="nav-item support-item"><CircleHelp size={18} />Help & support</button><button className="nav-item logout-item" onClick={() => navigate("/login")}><LogOut size={18} />Log out</button></div><div className="sidebar-footer">© 2026 ClassroomLite <span>v1.0.0</span></div></>;
  return <div className="app-shell"><aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>{sidebar}</aside>{menuOpen && <button className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu overlay" />}<div className="main-panel"><Topbar onMenu={() => setMenuOpen(true)} /><main className="page-content"><Outlet /></main></div></div>;
}
