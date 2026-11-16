import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { ErrorState, LoadingState } from "../components/RequestState";
import useResource from "../hooks/useResource";
import { sessionService } from "../services/api";
import { useApp } from "../context/AppContext";

export default function SchedulePage() {
  const { role } = useApp();
  const { data: sessions, error, loading, retry } = useResource(sessionService.list);
  if (loading) return <LoadingState label="Loading your schedule..." />;
  if (error || !sessions) return <ErrorState message={error || "Schedule data is unavailable."} onRetry={retry} />;
  return <div className="dashboard-page"><div className="welcome-row page-title-row"><div><div className="welcome-date">A LITTLE LOOK AHEAD <span>✳</span></div><h1>Your schedule</h1><p>A good week starts with knowing what's coming.</p></div><button className="button button-outline" onClick={() => window.alert("Calendar syncing will be available with a backend integration.")}><CalendarDays size={15} />Sync calendar</button></div><div className="schedule-date-heading"><div><span>MONDAY</span><strong>November 16</strong><p>2 classes · 1 hour 35 minutes of learning</p></div><span className="schedule-date-flower">✳</span></div><div className="timeline">{sessions.map((session, index) => <article className="timeline-item" key={session.id}><div className="timeline-time">{session.time}<small>{session.duration}</small></div><span className={`timeline-dot ${index === 0 ? "current" : ""}`} /><div className={`schedule-card ${index === 0 ? "schedule-highlight" : ""}`}><div className={`schedule-card-art ${["mint", "peach", "lavender"][index]}`}><span>{session.classroomId.toUpperCase()}</span><strong>{session.title}</strong></div><div className="schedule-card-details"><span><Clock3 size={14} /> {session.duration}</span><span>{session.students} students</span><Link to={`/app/live/${session.id}`} className="button button-dark">{role === "teacher" ? "Start class" : "Join class"}<ArrowRight size={14} /></Link></div></div></article>)}</div><EmptyState icon={<CalendarDays size={22} />} title="That's all for today" description="A little breathing room is a good thing. Your next class is tomorrow." /></div>;
}
