import { Download, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { ErrorState, LoadingState } from "../components/RequestState";
import { attendanceService } from "../services/api";
import useResource from "../hooks/useResource";

export default function StudentsPage() {
  const [query, setQuery] = useState("");
  const { data: attendance, error, loading, retry } = useResource(attendanceService.list);
  const students = useMemo(() => (attendance || []).filter((record) => `${record.student} ${record.classroom}`.toLowerCase().includes(query.toLowerCase())).filter((record, index, list) => list.findIndex((item) => item.student === record.student) === index), [attendance, query]);
  if (loading) return <LoadingState label="Loading your students..." />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  return <div className="dashboard-page"><div className="welcome-row page-title-row"><div><div className="welcome-date">YOUR CLASS COMMUNITY <span>✳</span></div><h1>Students</h1><p>All the lovely people learning in your classrooms.</p></div><button className="button button-outline" onClick={() => window.alert("Student export is a demo interaction.")}><Download size={15} />Export list</button></div><div className="list-toolbar"><div className="list-search"><Search size={17} /><input placeholder="Find a student..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><span className="results-count">{students.length} students</span></div>{students.length ? <div className="student-directory">{students.map((student, index) => <article key={student.id} className="directory-card"><Avatar initials={student.initials} color={["mint", "lavender", "peach", "butter", "coral"][index % 5]} size="lg" /><div><h3>{student.student}</h3><p>Learning in {student.classroom}</p><span>Last active {student.date}</span></div><span className={`attendance-pill ${student.status}`}>{student.status}</span></article>)}</div> : <EmptyState icon={<Users size={23} />} title="No students found" description="Try searching for a different student or classroom." />}</div>;
}
