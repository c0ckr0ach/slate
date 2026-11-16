import { ArrowLeft, Hand, MessageCircle, Mic, MicOff, MoreHorizontal, PhoneOff, Send, ScreenShare, Users, Video, VideoOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import { ErrorState, LoadingState } from "../components/RequestState";
import useResource from "../hooks/useResource";
import { liveClassService } from "../services/api";
import type { ChatMessage } from "../types";

type LivePanel = "chat" | "people";

export default function LiveClassPage() {
  const navigate = useNavigate();
  const { data: room, error, loading, retry } = useResource(liveClassService.getRoom);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [panel, setPanel] = useState<LivePanel>("chat");
  useEffect(() => { if (room) setMessages(room.messages); }, [room]);
  if (loading) return <LoadingState label="Joining the classroom..." />;
  if (error || !room) return <ErrorState message={error || "The classroom could not be opened."} onRetry={retry} />;
  const participants = room.participants;
  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages([...messages, { id: String(Date.now()), sender: "You", initials: "OR", text: draft.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), color: "coral" }]);
    setDraft("");
  };
  const renderParticipants = () => <div className="people-list people-panel"><div className="people-list-title"><strong>In this classroom</strong><span><Users size={14} />{participants.length}</span></div>{participants.map((person) => <div className="person-row" key={person.name}><Avatar initials={person.initials} color={person.color} size="sm" /><div><strong>{person.name}</strong><span>{person.role}</span></div><Mic size={15} /></div>)}<button className="back-dashboard" onClick={() => navigate("/app")}><ArrowLeft size={14} /> Back to dashboard</button></div>;

  return <div className="live-page"><header className="live-header"><Link to="/app" className="live-brand"><span className="brand-mark"><Video size={18} /></span><strong>classroom<span>lite</span></strong></Link><div className="live-room-name"><span className="live-dot" />Algebra II <span>/</span> Quadratic equations</div><div className="live-header-right"><div className="live-timer"><i /> LIVE <span>00:18:42</span></div><button className="icon-button" aria-label="More class options"><MoreHorizontal size={20} /></button><button className="live-end-button" onClick={() => navigate("/app")}>End class <X size={15} /></button></div></header>
    <main className="live-main"><section className="video-stage"><div className="teacher-video"><div className="video-sun" /><div className="video-placeholder-mark"><Video size={30} /></div><div className="video-placeholder-title">Your video space</div><p>In a real classroom, this is where<br />everyone comes together.</p><div className="teacher-label"><Avatar initials="OR" color="coral" size="sm" /> Olivia Rhye <span>Teacher</span></div><span className="video-caption">{camera ? "Camera preview placeholder" : "Your camera is off"}</span></div><div className="participant-tiles">{participants.slice(1).map((person) => <div key={person.name} className={`participant-tile tile-${person.color}`}><div className="tile-avatar"><Avatar initials={person.initials} color={person.color} size="lg" /></div><span>{person.name}</span><i><Mic size={12} /></i></div>)}</div><div className="call-controls"><button className={`call-control ${muted ? "control-off" : ""}`} onClick={() => setMuted(!muted)} aria-label={muted ? "Turn microphone on" : "Turn microphone off"}>{muted ? <MicOff size={19} /> : <Mic size={19} />}<span>{muted ? "Unmute" : "Mute"}</span></button><button className={`call-control ${!camera ? "control-off" : ""}`} onClick={() => setCamera(!camera)} aria-label={camera ? "Turn camera off" : "Turn camera on"}>{camera ? <Video size={19} /> : <VideoOff size={19} />}<span>Camera</span></button><button className="call-control" onClick={() => window.alert("Screen sharing is a UI-only demo control.")}><ScreenShare size={19} /><span>Share screen</span></button><button className={`call-control ${handRaised ? "control-raised" : ""}`} onClick={() => setHandRaised(!handRaised)}><Hand size={19} /><span>{handRaised ? "Lower hand" : "Raise hand"}</span></button><button className={`call-control mobile-chat-toggle ${chatOpen ? "control-selected" : ""}`} onClick={() => setChatOpen(!chatOpen)}><MessageCircle size={19} /><span>Chat</span></button><button className="leave-call" onClick={() => navigate("/app")}><PhoneOff size={18} /><span>Leave class</span></button></div></section>
      <aside className={`live-sidebar ${chatOpen ? "" : "chat-hidden"}`}><div className="live-tabs"><button className={panel === "chat" ? "active" : ""} onClick={() => setPanel("chat")}>Chat <span>{messages.length}</span></button><button className={panel === "people" ? "active" : ""} onClick={() => setPanel("people")}>People <span>{participants.length}</span></button></div>{panel === "chat" ? <><div className="live-chat-head"><div><strong>Class chat</strong><span>Messages are just for this class</span></div><button className="icon-button" onClick={() => setChatOpen(false)} aria-label="Close chat"><X size={17} /></button></div><div className="chat-messages">{messages.map((message) => <div className="chat-message" key={message.id}><Avatar initials={message.initials} color={message.color} size="sm" /><div><div className="chat-meta"><strong>{message.sender}</strong><span>{message.time}</span></div><p>{message.text}</p></div></div>)}</div><form className="chat-compose" onSubmit={send}><input placeholder="Write a message..." value={draft} onChange={(event) => setDraft(event.target.value)} /><button type="submit" aria-label="Send message" disabled={!draft.trim()}><Send size={17} /></button><span>Be kind. We're all learning.</span></form>{renderParticipants()}</> : renderParticipants()}</aside>
    </main><div className="demo-banner">DEMO CLASSROOM <span>Video, audio and chat are UI-only. No one can hear or see you.</span></div></div>;
}
