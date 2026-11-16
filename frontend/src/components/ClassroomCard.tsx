import { ArrowUpRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Classroom } from "../types";

export default function ClassroomCard({ classroom }: { classroom: Classroom }) {
  return <Link to={`/app/classrooms/${classroom.id}`} className="classroom-card">
    <div className={`class-art ${classroom.color}`}><span className="art-shape" /><span className="class-code">{classroom.code}</span><span className="art-subject">{classroom.subject}</span></div>
    <div className="classroom-info"><div className="class-title-row"><h3>{classroom.title}</h3><ArrowUpRight size={17} /></div><div className="class-meta"><span><Users size={14} /> {classroom.students} students</span><span>{classroom.progress}% complete</span></div><div className="progress-track"><span style={{ width: `${classroom.progress}%` }} /></div><div className="class-next">Next class <strong>{classroom.nextClass}</strong></div></div>
  </Link>;
}
