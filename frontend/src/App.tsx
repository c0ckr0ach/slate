import { useCallback, useEffect, useState, type FormEvent } from "react";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import { io, type Socket } from "socket.io-client";
import "@livekit/components-styles";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

type User = { id: string; name: string; email: string; role: "TEACHER" | "STUDENT" };
type Session = { id: string; status: "ACTIVE" | "ENDED"; startedAt: string };
type Classroom = {
  id: string;
  title: string;
  description?: string | null;
  inviteCode?: string;
  sessions: Session[];
  _count?: { enrollments: number };
};
type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; role: User["role"] };
};
type AuthResponse = { user: User; token: string };

export default function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(() => {
    const stored = localStorage.getItem("classroomlite-auth");
    return stored ? JSON.parse(stored) as AuthResponse : null;
  });
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selection, setSelection] = useState<{ token: string; serverUrl: string; session: Session } | null>(null);
  const [error, setError] = useState("");

  const request = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
        ...init.headers,
      },
    });
    const result = await response.json() as T & { error?: string };
    if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status})`);
    return result;
  }, [auth]);

  async function refreshClassrooms() {
    const result = await request<{ classrooms: Classroom[] }>("/classrooms");
    setClassrooms(result.classrooms);
  }

  useEffect(() => {
    if (auth) void refreshClassrooms().catch((cause: unknown) => setError(messageOf(cause)));
  }, [auth]);

  async function authenticate(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    const data = new FormData(form.currentTarget);
    const isRegister = data.get("mode") === "register";
    try {
      const result = await request<AuthResponse>(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
          ...(isRegister ? { name: data.get("name"), role: data.get("role") } : {}),
        }),
      });
      localStorage.setItem("classroomlite-auth", JSON.stringify(result));
      setAuth(result);
      setError("");
    } catch (cause) {
      setError(messageOf(cause));
    }
  }

  async function startClassroom(classroomId: string) {
    try {
      const { session } = await request<{ session: Session }>(`/sessions/classrooms/${classroomId}/sessions`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await joinSession(session);
      await refreshClassrooms();
    } catch (cause) {
      setError(messageOf(cause));
    }
  }

  async function joinSession(session: Session) {
    try {
      const result = await request<{ token: string; serverUrl: string }>(`/sessions/${session.id}/token`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setSelection({ ...result, session });
      setError("");
    } catch (cause) {
      setError(messageOf(cause));
    }
  }

  async function endSession(sessionId: string) {
    try {
      await request(`/sessions/${sessionId}/end`, { method: "POST", body: JSON.stringify({}) });
      setSelection(null);
      await refreshClassrooms();
    } catch (cause) {
      setError(messageOf(cause));
    }
  }

  async function createClassroom(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    const formElement = form.currentTarget;
    const data = new FormData(formElement);
    try {
      await request("/classrooms", {
        method: "POST",
        body: JSON.stringify({ title: data.get("title"), description: data.get("description") }),
      });
      formElement.reset();
      await refreshClassrooms();
    } catch (cause) {
      setError(messageOf(cause));
    }
  }

  async function enroll(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    const formElement = form.currentTarget;
    const data = new FormData(formElement);
    try {
      await request("/classrooms/enroll", {
        method: "POST",
        body: JSON.stringify({ inviteCode: data.get("inviteCode") }),
      });
      formElement.reset();
      await refreshClassrooms();
    } catch (cause) {
      setError(messageOf(cause));
    }
  }

  function signOut() {
    localStorage.removeItem("classroomlite-auth");
    setSelection(null);
    setAuth(null);
  }

  if (!auth) {
    return <AuthScreen onSubmit={authenticate} error={error} />;
  }

  if (selection) {
    return (
      <main className="classroom-screen">
        <header className="room-header">
          <div><span className="eyebrow">LIVE CLASSROOM</span><h1>{classrooms.find((item) => item.sessions.some((s) => s.id === selection.session.id))?.title ?? "Class session"}</h1></div>
          <div className="room-actions">
            {auth.user.role === "TEACHER" && <button className="button end-session" onClick={() => void endSession(selection.session.id)}>End session</button>}
            <button className="button subtle" onClick={() => setSelection(null)}>Leave classroom</button>
          </div>
        </header>
        <div className="room-layout">
          <section className="video-panel">
            <LiveKitRoom
              serverUrl={selection.serverUrl}
              token={selection.token}
              connect
              onError={(cause) => setError(cause.message)}
              onDisconnected={() => setSelection(null)}
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </section>
          <ChatPanel auth={auth} session={selection.session} request={request} />
        </div>
        {error && <div className="toast error">{error}</div>}
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">C</span> ClassroomLite</a>
        <div className="account"><span className="avatar">{auth.user.name.charAt(0).toUpperCase()}</span><span>{auth.user.name}</span><button className="text-button" onClick={signOut}>Sign out</button></div>
      </header>
      <div className="content">
        <section className="welcome">
          <div><span className="eyebrow">YOUR LEARNING SPACE</span><h1>Good to see you, {auth.user.name.split(" ")[0]}.</h1><p>Bring your next class to life.</p></div>
          <span className="welcome-graphic">✳</span>
        </section>
        {error && <div className="alert">{error}</div>}
        <div className="section-title"><div><span className="eyebrow">OVERVIEW</span><h2>Your classrooms</h2></div><span className="count-pill">{classrooms.length} total</span></div>
        <div className="class-grid">
          {classrooms.map((classroom) => {
            const activeSession = classroom.sessions.find((session) => session.status === "ACTIVE");
            return (
              <article className="class-card" key={classroom.id}>
                <div className="card-accent"><span className="class-icon">▣</span><span className={activeSession ? "status-live" : "status-idle"}>{activeSession ? "LIVE NOW" : "READY"}</span></div>
                <h3>{classroom.title}</h3>
                <p className="description">{classroom.description || "A place for your next great lesson."}</p>
                <div className="class-meta"><span>◉ {classroom._count?.enrollments ?? "—"} students</span>{classroom.inviteCode && <span>Code <b>{classroom.inviteCode}</b></span>}</div>
                {auth.user.role === "TEACHER"
                  ? <button className="button primary full" onClick={() => activeSession ? void joinSession(activeSession) : void startClassroom(classroom.id)}>{activeSession ? "Rejoin live class" : "Start a class"} <span>→</span></button>
                  : <button className="button primary full" disabled={!activeSession} onClick={() => activeSession && void joinSession(activeSession)}>{activeSession ? "Join live class" : "Waiting for teacher"} <span>→</span></button>}
              </article>
            );
          })}
          {classrooms.length === 0 && <div className="empty-state">Your classrooms will appear here after you create or join one.</div>}
        </div>
        <div className="action-grid">
          {auth.user.role === "TEACHER"
            ? <form className="action-card" onSubmit={createClassroom}><span className="eyebrow">TEACHER TOOLS</span><h3>Create a classroom</h3><label>Class name<input name="title" placeholder="e.g. Algebra II" required maxLength={120} /></label><label>Short description<input name="description" placeholder="What are you teaching?" maxLength={1000} /></label><button className="button dark">Create classroom <span>→</span></button></form>
            : <form className="action-card" onSubmit={enroll}><span className="eyebrow">GET STARTED</span><h3>Join a classroom</h3><label>Invitation code<input name="inviteCode" placeholder="Enter your class code" required /></label><button className="button dark">Join classroom <span>→</span></button></form>}
          <aside className="tip-card"><div className="tip-icon">✦</div><span className="eyebrow">QUICK TIP</span><h3>{auth.user.role === "TEACHER" ? "Share your invitation code" : "Your class isn't live yet?"}</h3><p>{auth.user.role === "TEACHER" ? "Students can use the classroom code to join. You can find it on each class card." : "Your teacher will open the room when class begins. You can join as soon as the room is live."}</p></aside>
        </div>
        <footer>Made for better learning, together. <span>ClassroomLite · {new Date().getFullYear()}</span></footer>
      </div>
    </main>
  );
}

function AuthScreen({ onSubmit, error }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; error: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="brand" href="#"><span className="brand-mark">C</span> ClassroomLite</a>
        <div className="auth-copy"><span className="eyebrow">YOUR CLASSROOM, REIMAGINED</span><h1>{mode === "login" ? "Welcome back." : "Make room to learn."}</h1><p>Live lessons, real connection, all in one place.</p></div>
        <form onSubmit={onSubmit} className="auth-form">
          <input type="hidden" name="mode" value={mode === "register" ? "register" : "login"} />
          {mode === "register" && <><label>Your name<input name="name" autoComplete="name" required maxLength={80} /></label><label>I am a<select name="role"><option value="STUDENT">Student</option><option value="TEACHER">Teacher</option></select></label></>}
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></label>
          {error && <div className="alert">{error}</div>}
          <button className="button primary full">{mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
        </form>
        <p className="auth-switch">{mode === "login" ? "New to ClassroomLite?" : "Already have an account?"} <button className="text-button" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
      </section>
      <aside className="auth-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-copy"><span className="visual-star">✳</span><p>Great teaching<br />happens together.</p><span className="visual-caption">Simple, live classrooms for curious minds.</span></div><div className="visual-note">LEARN · SHARE · GROW</div></aside>
    </main>
  );
}

function ChatPanel({
  auth,
  session,
  request,
}: {
  auth: AuthResponse;
  session: Session;
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void request<{ messages: ChatMessage[] }>(`/sessions/${session.id}/chat`)
      .then(({ messages: initial }) => { if (active) setMessages(initial); })
      .catch((cause: unknown) => { if (active) setNotice(messageOf(cause)); });
    const connection = io(SOCKET_URL, { auth: { token: auth.token } });
    connection.on("connect", () => connection.emit("session:join", { sessionId: session.id }));
    connection.on("chat:message", (message: ChatMessage) => setMessages((items) => [...items.filter((item) => item.id !== message.id), message]));
    connection.on("chat:deleted", ({ messageId }: { messageId: string }) => setMessages((items) => items.filter((item) => item.id !== messageId)));
    connection.on("classroom:announcement", ({ content, teacher }: { content: string; teacher: string }) => setNotice(`${teacher}: ${content}`));
    connection.on("connect_error", (cause: Error) => setNotice(cause.message));
    setSocket(connection);
    return () => { active = false; connection.disconnect(); };
  }, [auth.token, request, session.id]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || !socket) return;
    socket.emit("chat:send", { sessionId: session.id, content: draft }, (result: { ok: boolean; error?: string }) => {
      if (result?.ok) setDraft("");
      else setNotice(result?.error ?? "Couldn't send message");
    });
  }

  return (
    <aside className="chat-panel">
      <div className="chat-title"><div><span className="eyebrow">CLASSROOM</span><h2>Live chat</h2></div><span className="live-dot">● LIVE</span></div>
      <div className="chat-messages">
        {notice && <div className="chat-notice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
        {messages.map((message) => <div className="message" key={message.id}><span className="message-avatar">{message.user.name.charAt(0).toUpperCase()}</span><div><div className="message-meta"><b>{message.user.name}</b><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div><p>{message.content}</p></div></div>)}
        {messages.length === 0 && <div className="chat-empty">Say hello to your class!</div>}
      </div>
      <div className="chat-tools"><button onClick={() => socket?.emit("hand:raise", { sessionId: session.id })}>✋ Raise hand</button></div>
      <form className="chat-form" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message your class..." maxLength={2000} /><button aria-label="Send message" disabled={!draft.trim()}>↑</button></form>
    </aside>
  );
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
