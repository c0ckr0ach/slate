import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { UserRole } from "../types";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const [role, setRole] = useState<UserRole>("teacher");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useApp();
  const navigate = useNavigate();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => { signIn(role, name); navigate("/app"); }, 350);
  };
  return <div className="auth-page"><div className="auth-side"><Link to="/" className="landing-brand"><span className="brand-mark"><GraduationCap size={21} /></span>classroom<span>lite</span></Link><div className="auth-side-quote"><div className="auth-quote-mark">“</div><h2>Good teaching<br />changes <em>everything.</em></h2><p>A little more space to focus. A little more room to grow.</p><div className="auth-side-foot">A place for the people who make learning matter. <span>✳</span></div></div></div><main className="auth-main"><Link to="/" className="back-home"><ArrowLeft size={15} /> Back to home</Link><div className="auth-form-wrap"><span className="section-kicker">{mode === "login" ? "WELCOME BACK" : "YOUR CLASSROOM STARTS HERE"}</span><h1>{mode === "login" ? "Good to see you." : "Let's make room."}</h1><p>{mode === "login" ? "Pick up right where your class left off." : "Create your free account. No fuss, just learning."}</p><form onSubmit={submit}>{mode === "register" && <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Olivia Rhye" required /></label>}<label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" placeholder="At least 8 characters" minLength={8} required /></label><fieldset className="role-options"><legend>I’m joining as a...</legend><button type="button" className={role === "teacher" ? "role-option selected" : "role-option"} onClick={() => setRole("teacher")}><span>✦</span><strong>Teacher</strong><small>I’m here to teach</small></button><button type="button" className={role === "student" ? "role-option selected" : "role-option"} onClick={() => setRole("student")}><span>↗</span><strong>Student</strong><small>I’m here to learn</small></button></fieldset><button className="button button-dark auth-submit" type="submit" disabled={loading}>{loading ? "Just a moment..." : mode === "login" ? "Log in to your classroom" : "Create your free account"}<ArrowRight size={16} /></button></form><div className="auth-switch">{mode === "login" ? "New around here?" : "Already have an account?"} <Link to={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Log in"}</Link></div><small className="mock-auth-note">Demo mode — any email and password will work.</small></div></main></div>;
}
