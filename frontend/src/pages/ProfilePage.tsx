import { ArrowRight, Check, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useApp } from "../context/AppContext";
import Avatar from "../components/Avatar";
import { useState } from "react";

export default function ProfilePage() {
  const { user, role } = useApp();
  const [saved, setSaved] = useState(false);
  return <div className="dashboard-page"><div className="welcome-row page-title-row"><div><div className="welcome-date">YOUR LITTLE CORNER <span>✳</span></div><h1>Your profile</h1><p>A few details about the person behind the classroom.</p></div></div><div className="profile-card"><div className="profile-cover"><span>✳</span></div><div className="profile-content"><Avatar initials={user.initials} color={user.color} size="lg" /><div className="profile-heading"><h2>{user.name}</h2><span className="profile-role">{role}</span><p>{user.role === "teacher" ? "Independent educator" : "Curious learner"}</p></div><button className="button button-outline" onClick={() => setSaved(true)}>{saved ? <><Check size={15} />Saved</> : "Save changes"}</button></div><div className="profile-fields"><label><span><UserRound size={15} /> Full name</span><input defaultValue={user.name} /></label><label><span><Mail size={15} /> Email address</span><input type="email" defaultValue={user.email} /></label><label><span><ShieldCheck size={15} /> Account type</span><input value={role === "teacher" ? "Teacher account" : "Student account"} readOnly /></label></div><div className="profile-note"><span>✦</span><div><strong>This is your space.</strong><p>Profile updates are saved locally in this demo. Connect your API to make them stick.</p></div><ArrowRight size={16} /></div></div></div>;
}
