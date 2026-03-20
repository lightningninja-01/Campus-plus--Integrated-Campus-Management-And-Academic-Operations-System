import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import API from "../api/api";

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const REACTIONS = ["👍","❤️","😂","😮","🔥","👏"];

let socket = null;

export default function GroupChat({ group, token, userId, onBack }) {
  const [messages, setMessages]     = useState([]);
  const [text, setText]             = useState("");
  const [replyTo, setReplyTo]       = useState(null);
  const [showPinned, setShowPinned] = useState(false);
  const [sending, setSending]       = useState(false);
  const [reactingTo, setReactingTo] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const res = await API.get(`/messages/${group._id}`, h(token));
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch { setMessages([]); }
  }, [group._id, token]);

  useEffect(() => {
    loadMessages();

    // Connect socket
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });

    socket.emit("join_group", group._id);

    socket.on("new_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("message_updated", (updated) => {
      setMessages(prev => prev.map(m => String(m._id) === String(updated._id) ? updated : m));
    });

    return () => {
      socket.emit("leave_group", group._id);
      socket.disconnect();
    };
  }, [group._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await API.post(`/messages/${group._id}`, {
        text: text.trim(),
        replyTo: replyTo?._id || null,
      }, h(token));
      setText("");
      setReplyTo(null);
    } catch (e) { console.error(e); }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleReact = async (messageId, emoji) => {
    try {
      await API.post(`/messages/${group._id}/react/${messageId}`, { emoji }, h(token));
      setReactingTo(null);
    } catch { }
  };

  const handlePin = async (messageId) => {
    try {
      await API.post(`/messages/${group._id}/pin/${messageId}`, {}, h(token));
    } catch { }
  };

  const handleDelete = async (messageId) => {
    try {
      await API.delete(`/messages/${group._id}/${messageId}`, h(token));
    } catch { }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const pinnedMessages = messages.filter(m => m.isPinned);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", gap: 0 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <button type="button" onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "7px 12px", borderRadius: 8, fontFamily: "inherit", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{group.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {group.members?.length || 0} members · {group.type} group
            {group.branch     && ` · ${group.branch}`}
            {group.semester   && ` · Sem ${group.semester}`}
            {group.department && ` · ${group.department}`}
            {group.school     && ` · ${group.school}`}
          </p>
        </div>
        {pinnedMessages.length > 0 && (
          <button type="button" onClick={() => setShowPinned(p => !p)} style={{ ...S.iconActionBtn, background: showPinned ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)", color: showPinned ? "#fcd34d" : "rgba(255,255,255,0.5)" }}>
            📌 {pinnedMessages.length}
          </button>
        )}
      </div>

      {/* Pinned messages panel */}
      {showPinned && pinnedMessages.length > 0 && (
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 16px", margin: "0 0 8px", flexShrink: 0 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#fcd34d", textTransform: "uppercase", letterSpacing: "0.5px" }}>📌 Pinned Messages</p>
          {pinnedMessages.map(m => (
            <div key={m._id} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <strong style={{ color: "#fcd34d" }}>{m.sender?.name}: </strong>{m.text}
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0", display: "flex", flexDirection: "column", gap: 2 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12, color: "rgba(255,255,255,0.3)" }}>
            <span style={{ fontSize: 48 }}>💬</span>
            <p style={{ fontSize: 14 }}>No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe      = String(msg.sender?._id || msg.sender) === String(userId);
          const isDeleted = msg.isDeleted;
          const showAvatar = i === 0 || String(messages[i-1].sender?._id) !== String(msg.sender?._id);

          return (
            <div key={msg._id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, padding: "2px 0", group: "message" }}>
              {/* Avatar */}
              {!isMe && (
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `hsl(${(msg.sender?.name?.charCodeAt(0) || 0) * 15},60%,45%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, opacity: showAvatar ? 1 : 0 }}>
                  {(msg.sender?.name || "U")[0].toUpperCase()}
                </div>
              )}

              <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 2, alignItems: isMe ? "flex-end" : "flex-start" }}>
                {/* Sender name */}
                {!isMe && showAvatar && <span style={{ fontSize: 11, fontWeight: 600, color: `hsl(${(msg.sender?.name?.charCodeAt(0) || 0) * 15},60%,65%)`, paddingLeft: 4 }}>{msg.sender?.name}</span>}

                {/* Reply preview */}
                {msg.replyTo && !isDeleted && (
                  <div style={{ background: "rgba(255,255,255,0.06)", borderLeft: "2px solid rgba(99,102,241,0.6)", borderRadius: "6px 6px 0 0", padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.5)", maxWidth: "100%" }}>
                    {msg.replyTo.text?.substring(0, 60)}{msg.replyTo.text?.length > 60 ? "..." : ""}
                  </div>
                )}

                {/* Bubble */}
                <div
                  style={{
                    background: isDeleted ? "rgba(255,255,255,0.04)" : isMe ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isMe ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    padding: "9px 14px",
                    fontSize: 13,
                    color: isDeleted ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                    fontStyle: isDeleted ? "italic" : "normal",
                    position: "relative",
                    cursor: "default",
                  }}
                  onMouseEnter={e => e.currentTarget.querySelector(".msg-actions")?.style && (e.currentTarget.querySelector(".msg-actions").style.opacity = "1")}
                  onMouseLeave={e => e.currentTarget.querySelector(".msg-actions")?.style && (e.currentTarget.querySelector(".msg-actions").style.opacity = "0")}
                >
                  {msg.text}

                  {/* File/link */}
                  {msg.fileUrl && !isDeleted && (
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 6, fontSize: 12, color: "#a5b4fc", textDecoration: "underline" }}>
                      📎 {msg.fileName || "Attachment"}
                    </a>
                  )}

                  {/* Message actions */}
                  {!isDeleted && (
                    <div className="msg-actions" style={{ position: "absolute", top: -28, right: isMe ? 0 : "auto", left: isMe ? "auto" : 0, display: "flex", gap: 4, background: "rgba(20,20,40,0.95)", borderRadius: 8, padding: "3px 6px", opacity: 0, transition: "opacity 0.15s", zIndex: 2 }}>
                      <button type="button" onClick={() => setReactingTo(reactingTo === msg._id ? null : msg._id)} style={S.microBtn} title="React">😊</button>
                      <button type="button" onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }} style={S.microBtn} title="Reply">↩</button>
                      <button type="button" onClick={() => handlePin(msg._id)} style={{ ...S.microBtn, color: msg.isPinned ? "#fcd34d" : "inherit" }} title="Pin">📌</button>
                      {String(msg.sender?._id || msg.sender) === String(userId) && (
                        <button type="button" onClick={() => handleDelete(msg._id)} style={{ ...S.microBtn, color: "#fca5a5" }} title="Delete">🗑</button>
                      )}
                    </div>
                  )}
                </div>

                {/* Reaction picker */}
                {reactingTo === msg._id && (
                  <div style={{ display: "flex", gap: 4, background: "rgba(20,20,40,0.95)", borderRadius: 20, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {REACTIONS.map(emoji => (
                      <button key={emoji} type="button" onClick={() => handleReact(msg._id, emoji)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "2px 3px", borderRadius: 6, transition: "transform 0.1s" }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reactions display */}
                {msg.reactions?.length > 0 && !isDeleted && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {msg.reactions.map(r => (
                      <button key={r.emoji} type="button" onClick={() => handleReact(msg._id, r.emoji)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "2px 8px", fontSize: 12, color: "#e2e8f0", cursor: "pointer", fontFamily: "inherit" }}>
                        {r.emoji} {r.users?.length}
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", paddingInline: 4 }}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  {msg.isPinned && " · 📌"}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(99,102,241,0.1)", borderLeft: "3px solid #6366f1", borderRadius: 8, padding: "8px 12px", flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "#a5b4fc", fontWeight: 600 }}>Replying to {replyTo.sender?.name}</p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{replyTo.text?.substring(0, 80)}</p>
          </div>
          <button type="button" onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 10, padding: "12px 0 0", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={1}
          style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}
        />
        <button type="button" onClick={sendMessage} disabled={sending || !text.trim()} style={{ padding: "0 20px", background: text.trim() ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, color: text.trim() ? "#fff" : "rgba(255,255,255,0.3)", fontFamily: "inherit", fontSize: 20, cursor: text.trim() ? "pointer" : "not-allowed", flexShrink: 0, transition: "all 0.2s" }}>
          {sending ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
}

const S = {
  iconActionBtn: { padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 },
  microBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 4px", color: "rgba(255,255,255,0.7)", borderRadius: 4 },
};