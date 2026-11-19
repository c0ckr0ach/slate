import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  MoreHorizontal,
  PhoneOff,
  Send,
  ScreenShare,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import { ErrorState, LoadingState } from "../components/RequestState";
import { useApp } from "../context/AppContext";
import useResource from "../hooks/useResource";
import { liveClassService } from "../services/api";
import type { ChatMessage } from "../types";

type LivePanel = "chat" | "people";

export default function LiveClassPage() {
  const navigate = useNavigate();
  const videoStageRef = useRef<HTMLElement>(null);
  const { role } = useApp();
  const isTeacher = role === "teacher";
  const { data: room, error, loading, retry } = useResource(liveClassService.getRoom);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [mutedParticipants, setMutedParticipants] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [panel, setPanel] = useState<LivePanel>("chat");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    if (room) setMessages(room.messages);
  }, [room]);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(document.fullscreenElement === videoStageRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  if (loading) return <LoadingState label="Joining the classroom..." />;
  if (error || !room) {
    return <ErrorState message={error || "The classroom could not be opened."} onRetry={retry} />;
  }

  const participants = room.participants;
  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages([
      ...messages,
      {
        id: String(Date.now()),
        sender: "You",
        initials: "OR",
        text: draft.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        color: "coral",
      },
    ]);
    setDraft("");
  };
  const toggleChat = () => {
    setChatOpen((open) => {
      if (!open) setPanel("chat");
      return !open;
    });
  };
  const toggleParticipantMute = (name: string) => {
    setMutedParticipants((current) =>
      current.includes(name) ? current.filter((participant) => participant !== name) : [...current, name],
    );
  };
  const togglePresentationFullscreen = async () => {
    const stage = videoStageRef.current;
    if (!stage) return;
    setFullscreenError("");
    try {
      if (document.fullscreenElement === stage) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch {
      setFullscreenError("Fullscreen mode could not be changed.");
    }
  };

  const renderParticipants = () => (
    <div className="people-list people-panel">
      <div className="people-list-title">
        <strong>In this classroom</strong>
        <span><Users size={14} />{participants.length}</span>
      </div>
      {participants.map((person) => {
        const participantMuted = mutedParticipants.includes(person.name);
        return (
          <div className="person-row" key={person.name}>
            <Avatar initials={person.initials} color={person.color} size="sm" />
            <div><strong>{person.name}</strong><span>{person.role}</span></div>
            {isTeacher && person.role === "Student" ? (
              <button
                className={`participant-mute ${participantMuted ? "participant-muted" : ""}`}
                aria-label={`${participantMuted ? "Unmute" : "Mute"} ${person.name}`}
                aria-pressed={participantMuted}
                onClick={() => toggleParticipantMute(person.name)}
              >
                {participantMuted ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            ) : (
              <Mic size={15} />
            )}
          </div>
        );
      })}
      <button className="back-dashboard" onClick={() => navigate("/app")}>
        <ArrowLeft size={14} /> Back to dashboard
      </button>
    </div>
  );

  return (
    <div className="live-page">
      <header className="live-header">
        <Link to="/app" className="live-brand">
          <span className="brand-mark"><Video size={18} /></span>
          <strong>classroom<span>lite</span></strong>
        </Link>
        <div className="live-room-name"><span className="live-dot" />Algebra II <span>/</span> Quadratic equations</div>
        <div className="live-header-right">
          <div className="live-timer"><i /> LIVE <span>00:18:42</span></div>
          {isTeacher && <button className="icon-button" aria-label="More class options"><MoreHorizontal size={20} /></button>}
          {isTeacher && (
            <button className="live-end-button" onClick={() => navigate("/app")}>
              End class <X size={15} />
            </button>
          )}
        </div>
      </header>

      <main className={`live-main ${chatOpen ? "" : "live-main-chat-closed"}`}>
        <section className="video-stage" ref={videoStageRef}>
          <div className={`teacher-video ${screenShared ? "screen-sharing" : ""}`}>
            {screenShared ? (
              <div className="screen-share-preview">
                <ScreenShare size={34} />
                <strong>Olivia is sharing their screen</strong>
                <span>Presentation view</span>
              </div>
            ) : (
              <>
                <div className="video-sun" />
                <div className="video-placeholder-mark"><Video size={30} /></div>
                <div className="video-placeholder-title">{camera ? "Teacher camera" : "Teacher camera is off"}</div>
                <p>{camera ? <>The teacher's video appears here<br />for the whole class.</> : "Waiting for the teacher to turn on their camera."}</p>
              </>
            )}
            <div className="teacher-label">
              <Avatar initials="OR" color="coral" size="sm" /> Olivia Rhye <span>Teacher</span>
            </div>
            <span className="video-caption">{screenShared ? "Screen share" : camera ? "Camera" : "Camera off"}</span>
            <button
              className="fullscreen-toggle"
              onClick={() => void togglePresentationFullscreen()}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-pressed={isFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
            {fullscreenError && <span className="fullscreen-error" role="status">{fullscreenError}</span>}
          </div>

          <div className="call-controls">
            {isTeacher && (
              <>
                <button
                  className={`call-control ${muted ? "control-off" : ""}`}
                  onClick={() => setMuted(!muted)}
                  aria-label={muted ? "Turn microphone on" : "Turn microphone off"}
                >
                  {muted ? <MicOff size={19} /> : <Mic size={19} />}
                  <span>{muted ? "Unmute" : "Mute"}</span>
                </button>
                <button
                  className={`call-control ${!camera ? "control-off" : ""}`}
                  onClick={() => setCamera(!camera)}
                  aria-label={camera ? "Turn camera off" : "Turn camera on"}
                >
                  {camera ? <Video size={19} /> : <VideoOff size={19} />}
                  <span>Camera</span>
                </button>
                <button
                  className={`call-control ${screenShared ? "control-selected" : ""}`}
                  onClick={() => setScreenShared(!screenShared)}
                  aria-pressed={screenShared}
                >
                  <ScreenShare size={19} />
                  <span>{screenShared ? "Stop sharing" : "Share screen"}</span>
                </button>
              </>
            )}
            {!isTeacher && (
              <button
                className={`call-control ${handRaised ? "control-raised" : ""}`}
                onClick={() => setHandRaised(!handRaised)}
                aria-pressed={handRaised}
              >
                <Hand size={19} /><span>{handRaised ? "Lower hand" : "Raise hand"}</span>
              </button>
            )}
            <button
              className={`call-control chat-toggle ${chatOpen ? "control-selected" : ""}`}
              onClick={toggleChat}
              aria-expanded={chatOpen}
              aria-controls="live-class-sidebar"
            >
              <MessageCircle size={19} /><span>{chatOpen ? "Hide chat" : "Show chat"}</span>
            </button>
            <button className="leave-call" onClick={() => navigate("/app")}>
              <PhoneOff size={18} /><span>Leave class</span>
            </button>
          </div>
        </section>

        {chatOpen && (
          <aside className="live-sidebar" id="live-class-sidebar">
            <div className="live-chat-head">
              <div>
                <strong>{panel === "chat" ? "Class chat" : "People in this classroom"}</strong>
                {panel === "chat" && <span>Messages are just for this class</span>}
              </div>
              <button className="icon-button" onClick={toggleChat} aria-label="Close chat"><X size={17} /></button>
            </div>
            <div className="live-tabs">
              <button className={panel === "chat" ? "active" : ""} onClick={() => setPanel("chat")}>
                Chat <span>{messages.length}</span>
              </button>
              <button className={panel === "people" ? "active" : ""} onClick={() => setPanel("people")}>
                People <span>{participants.length}</span>
              </button>
            </div>
            {panel === "chat" ? (
              <>
                <div className="chat-messages">
                  {messages.map((message) => (
                    <div className="chat-message" key={message.id}>
                      <Avatar initials={message.initials} color={message.color} size="sm" />
                      <div>
                        <div className="chat-meta"><strong>{message.sender}</strong><span>{message.time}</span></div>
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form className="chat-compose" onSubmit={send}>
                  <input placeholder="Write a message..." value={draft} onChange={(event) => setDraft(event.target.value)} />
                  <button type="submit" aria-label="Send message" disabled={!draft.trim()}><Send size={17} /></button>
                  <span>Be kind. We're all learning.</span>
                </form>
              </>
            ) : renderParticipants()}
          </aside>
        )}
      </main>
    </div>
  );
}
