import { ArrowRight, BookOpen, Plus, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ClassroomCard from "../components/ClassroomCard";
import EmptyState from "../components/EmptyState";
import { ErrorState, LoadingState } from "../components/RequestState";
import { useApp } from "../context/AppContext";
import useResource from "../hooks/useResource";
import { classroomService } from "../services/api";
import type { Classroom } from "../types";

export default function ClassroomsPage() {
  const { data: initialRooms, error: loadError, loading, retry } = useResource(classroomService.list);
  const [rooms, setRooms] = useState<Classroom[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All classrooms");
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [error, setError] = useState("");
  const { role, user } = useApp();
  const visible = useMemo(() => rooms.filter((room) => `${room.title} ${room.subject}`.toLowerCase().includes(query.toLowerCase()) && (filter === "All classrooms" || room.subject === filter)), [rooms, query, filter]);
  useEffect(() => { if (initialRooms) setRooms(initialRooms); }, [initialRooms]);
  if (loading) return <LoadingState label="Loading your classrooms..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={retry} />;
  const createClassroom = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = title.trim();
    if (!name) {
      setError("Add a classroom name to continue.");
      return;
    }
    const newRoom: Classroom = {
      id: `c${Date.now()}`,
      title: name,
      subject,
      code: `${subject.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      teacher: user.name,
      students: 0,
      color: ["mint", "peach", "lavender"][rooms.length % 3],
      nextClass: "Not scheduled",
      progress: 0,
    };
    try {
      const created = await classroomService.create(newRoom);
      setRooms((current) => [created, ...current]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The classroom could not be created.");
      return;
    }
    setTitle("");
    setError("");
    setFilter("All classrooms");
    setQuery("");
    setCreateOpen(false);
  };
  return <div className="dashboard-page"><div className="welcome-row page-title-row"><div><div className="welcome-date">{role === "teacher" ? "YOUR TEACHING SPACE" : "YOUR LEARNING SPACE"} <span>✳</span></div><h1>{role === "teacher" ? "Classrooms" : "My classrooms"}</h1><p>Good things happen when everyone has a place to learn.</p></div>{role === "teacher" && <button className="button button-dark" onClick={() => setCreateOpen(true)}><Plus size={16} />Create classroom</button>}</div><div className="list-toolbar"><div className="list-search"><Search size={17} /><input placeholder="Find a classroom..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All classrooms</option><option>Mathematics</option><option>Science</option><option>English</option></select><span className="results-count">{visible.length} classrooms</span></div>{visible.length ? <div className="classroom-grid full-class-grid">{visible.map((classroom) => <ClassroomCard key={classroom.id} classroom={classroom} />)}</div> : <EmptyState icon={<BookOpen size={23} />} title="No classrooms found" description="Try another search or choose a different subject filter." />}<div className="classroom-footnote"><Users size={17} /><span>Small classes make a big difference. Your rooms support up to 40 students.</span><Link to="/app/schedule">Explore your schedule <ArrowRight size={14} /></Link></div>
    {createOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false); }}><section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><button className="modal-close" aria-label="Close dialog" onClick={() => setCreateOpen(false)}><X size={18} /></button><span className="section-kicker">MAKE A LITTLE ROOM</span><h2 id="create-title">Create a classroom</h2><p>Give your next learning space a name and a subject.</p><form onSubmit={createClassroom}><label>Classroom name<input autoFocus value={title} onChange={(event) => { setTitle(event.target.value); setError(""); }} placeholder="e.g. Algebra II" /></label><label>Subject<select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Mathematics</option><option>Science</option><option>English</option><option>Other</option></select></label>{error && <span className="form-error">{error}</span>}<div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setCreateOpen(false)}>Cancel</button><button type="submit" className="button button-dark"><Plus size={15} />Create classroom</button></div><small>This demo saves your classroom in local page state only.</small></form></section></div>}
  </div>;
}
