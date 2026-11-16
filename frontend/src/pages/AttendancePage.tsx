import { ArrowDownToLine, ChartNoAxesColumn, Check, Clock3, X } from "lucide-react";
import { useState } from "react";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { ErrorState, LoadingState } from "../components/RequestState";
import { attendanceService } from "../services/api";
import useResource from "../hooks/useResource";
import { useApp } from "../context/AppContext";

export default function AttendancePage() {
  const [filter, setFilter] = useState("All classes");
  const { role } = useApp();
  const { data: attendance, error, loading, retry } = useResource(attendanceService.list);
  if (loading) return <LoadingState label="Loading attendance..." />;
  if (error || !attendance) return <ErrorState message={error || "Attendance data is unavailable."} onRetry={retry} />;
  const records = attendance.filter((record) => filter === "All classes" || record.classroom === filter);
  return <div className="dashboard-page"><div className="welcome-row page-title-row"><div><div className="welcome-date">SHOWING UP IS A BIG DEAL <span>✳</span></div><h1>{role === "teacher" ? "Attendance" : "My attendance"}</h1><p>Small moments of showing up add up to something wonderful.</p></div><button className="button button-outline" onClick={() => window.alert("Attendance export is a demo interaction.")}><ArrowDownToLine size={15} />Download report</button></div><div className="attendance-summary"><div className="attendance-main-stat"><span className="section-kicker">AVERAGE ATTENDANCE</span><strong>94<small>%</small></strong><span className="up-note">↗ 3.2% <i>compared to last month</i></span><div className="spark-bars">{[42, 60, 53, 78, 64, 88, 70, 96, 76, 100, 84, 90].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div><div className="attendance-side-stats"><div><span className="attendance-side-icon present"><Check size={17} /></span><div><strong>126</strong><span>Present this month</span></div></div><div><span className="attendance-side-icon late"><Clock3 size={17} /></span><div><strong>8</strong><span>Arrived a little late</span></div></div><div><span className="attendance-side-icon absent"><X size={17} /></span><div><strong>5</strong><span>Missed a class</span></div></div></div></div><div className="section-heading attendance-table-heading"><div><span className="section-kicker">THE EVERYDAY WINS</span><h2>Recent class attendance</h2></div><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All classes</option><option>Algebra II</option><option>Organic Chemistry</option><option>Creative Writing</option></select></div>{records.length ? <div className="attendance-table"><div className="attendance-table-head"><span>STUDENT</span><span>CLASSROOM</span><span>DATE & TIME</span><span>STATUS</span></div>{records.map((record, index) => <div className="attendance-row" key={record.id}><div className="student-name"><Avatar initials={record.initials} color={["mint", "lavender", "peach", "butter", "coral"][index % 5]} size="sm" /><strong>{record.student}</strong></div><span>{record.classroom}</span><span>{record.date}</span><span className={`attendance-pill ${record.status}`}>{record.status}</span></div>)}</div> : <EmptyState icon={<ChartNoAxesColumn size={22} />} title="No attendance records here yet" description="Choose another class to see its attendance." />}</div>;
}
