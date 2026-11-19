import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Clock3, MoreHorizontal, Plus, Search, UserPlus, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { ErrorState, LoadingState } from "../components/RequestState";
import { useApp } from "../context/AppContext";
import useResource from "../hooks/useResource";
import { classroomService } from "../services/api";

const students = [
  ["Mia Chen", "MC", "mint", "mia.chen@email.com", "Today, 10:24 AM", "Present"],
  ["Noah Williams", "NW", "lavender", "noah.w@email.com", "Today, 10:31 AM", "Late"],
  ["Sofia Patel", "SP", "peach", "sofia.p@email.com", "Today, 10:22 AM", "Present"],
  ["Ethan Brooks", "EB", "butter", "ethan.b@email.com", "Yesterday", "Present"],
  ["Ava Thompson", "AT", "coral", "ava.t@email.com", "Yesterday", "Present"],
];

export default function ClassroomDetailPage() {
  const { role } = useApp();
  const { id } = useParams();
  const { data: room, error, loading, retry } = useResource(() => classroomService.get(id || ""), [id]);
  if (loading) return <LoadingState label="Loading classroom details..." />;
  if (error || !room) return <ErrorState message={error || "This classroom could not be found."} onRetry={retry} />;
  const hasStudents = room.students > 0;
  return <div className="dashboard-page detail-page">
    <Link to="/app/classrooms" className="back-link"><ArrowLeft size={15} /> All classrooms</Link>
    <div className={`detail-banner ${room.color}`}><span className="detail-eyebrow">{room.subject} · CLASSROOM</span><h1>{room.title}</h1><p>A welcoming space to learn, ask questions, and grow together.</p><div className="detail-code">CLASS CODE <strong>{room.code}</strong></div><button className="detail-menu" aria-label="More classroom options"><MoreHorizontal size={20} /></button></div>
    <div className="detail-stats"><div><Users size={18} /><strong>{room.students}</strong><span>students enrolled</span></div><div><CalendarDays size={18} /><strong>{hasStudents ? "12" : "0"}</strong><span>classes completed</span></div><div><Clock3 size={18} /><strong>{room.progress}%</strong><span>course progress</span></div><button className="button button-dark" onClick={() => window.location.assign(`/app/live/${room.id}`)}><ArrowUpRight size={15} /> {role === "teacher" ? "Start a class" : "Join class"}</button></div>
    <div className="detail-body"><section className="students-panel"><div className="section-heading"><div><span className="section-kicker">YOUR CLASS COMMUNITY</span><h2>Students <span className="small-count">{room.students}</span></h2></div><button className="button button-outline" onClick={() => window.alert("Student invites are a demo interaction.")}><UserPlus size={15} />Invite student</button></div><div className="list-toolbar detail-toolbar"><div className="list-search"><Search size={16} /><input placeholder="Find a student..." /></div><button className="icon-button"><MoreHorizontal size={19} /></button></div>
      {hasStudents ? <div className="student-table"><div className="student-table-head"><span>STUDENT</span><span>EMAIL</span><span>LAST ACTIVE</span><span>STATUS</span><span /></div>{students.map(([name, initials, color, email, active, status]) => <div className="student-row" key={email}><div className="student-name"><Avatar initials={initials} color={color} size="sm" /><strong>{name}</strong></div><span>{email}</span><span>{active}</span><span className={`attendance-pill ${status === "Late" ? "late" : "present"}`}>{status}</span><button aria-label={`Options for ${name}`}><MoreHorizontal size={17} /></button></div>)}</div> : <EmptyState icon={<Users size={22} />} title="Your class starts here" description="Invite students to join this classroom and learn together." />}
    </section><aside className="detail-side"><div className="section-heading"><div><span className="section-kicker">UP NEXT</span><h2>Next class</h2></div></div>{room.nextClass === "Not scheduled" ? <div className="detail-next"><div className="next-date"><span>CLASS</span><strong>—</strong></div><h3>No class scheduled</h3><p>Your next session will show up here.</p><button className="button button-dark" onClick={() => window.alert("Class scheduling is a demo interaction.")}>Schedule a class <ArrowUpRight size={15} /></button></div> : <div className="detail-next"><div className="next-date"><span>NOV</span><strong>16</strong></div><span className="live-dot" /> TODAY, 10:30 AM<h3>Quadratic equations</h3><p><Clock3 size={14} /> 50 minutes <span>·</span> {room.students} students</p><button className="button button-dark" onClick={() => window.location.assign("/app/live/s1")}>Open classroom <ArrowUpRight size={15} /></button></div>}
      <div className="course-progress"><div><BookOpen size={17} /><strong>Course progress</strong></div><span>{room.progress}%</span><div className="progress-track"><span style={{ width: `${room.progress}%` }} /></div><p>{hasStudents ? "12 of 18 lessons completed" : "No lessons completed yet"}</p></div><button className="add-resource" onClick={() => window.alert("Resource sharing is a demo interaction.")}><Plus size={17} /> Add a resource</button>
    </aside></div>
  </div>;
}
