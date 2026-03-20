import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import GroupChat from "./GroupChat";

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const BRANCHES  = ["CSE","AI/ML","Data Science","Cyber Security","Full Stack Development","UI/UX Design","Cloud Computing","Robotics"];
const SCHOOLS   = ["SOET","SOMC","SOAD","SOLS","SOAS"];
const SEMESTERS = [1,2,3,4,5,6,7,8];

const TYPE_META = {
  school:     { color: "#22c55e",  label: "School"     },
  semester:   { color: "#06b6d4",  label: "Semester"   },
  department: { color: "#f59e0b",  label: "Department" },
  class:      { color: "#6366f1",  label: "Class"      },
  section:    { color: "#8b5cf6",  label: "Section"    },
  subject:    { color: "#ec4899",  label: "Subject"    },
  custom:     { color: "#f97316",  label: "Custom"     },
};

export default function StudyGroups({ token }) {
  const { user } = useAuth();
  const [tab, setTab]             = useState("mine");   // "mine" | "browse"
  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [actionId, setActionId]   = useState(null);
  const [msg, setMsg]             = useState({ text: "", error: false });
  const [typeFilter, setTypeFilter] = useState("all");

  const [form, setForm] = useState({
    name: "", description: "", type: "custom",
    school: "", semester: "", branch: "", section: "",
  });

  const canCreate = user?.role === "faculty" || user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // students use tab param; faculty/admin get everything
      if (user?.role === "student") params.set("tab", tab);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await API.get(`/studygroups?${params}`, h(token));
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch { setGroups([]); }
    setLoading(false);
  }, [token, tab, typeFilter, user?.role]);

  useEffect(() => { load(); }, [load]);

  const handleJoin = async (g) => {
    setActionId(g._id);
    setMsg({ text: "", error: false });
    try {
      await API.post(`/studygroups/${g._id}/join`, {}, h(token));
      setMsg({ text: `Joined "${g.name}"! Click Open Chat to start.`, error: false });
      load();
    } catch (e) {
      setMsg({ text: e.response?.data?.message || "Failed to join", error: true });
    }
    setActionId(null);
  };

  const handleLeave = async (g) => {
    if (!window.confirm(`Leave "${g.name}"?`)) return;
    setActionId(g._id);
    try {
      await API.post(`/studygroups/${g._id}/leave`, {}, h(token));
      setMsg({ text: "Left group.", error: false });
      load();
    } catch { setMsg({ text: "Failed to leave", error: true }); }
    setActionId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await API.delete(`/studygroups/${id}`, h(token));
      setMsg({ text: "Group deleted.", error: false });
      load();
    } catch (e) {
      setMsg({ text: e.response?.data?.message || "Cannot delete this group", error: true });
    }
  };

  const handleCreate = async () => {
    if (!form.name) { setMsg({ text: "Group name required", error: true }); return; }
    try {
      await API.post("/studygroups", {
        ...form,
        semester: form.semester ? Number(form.semester) : null,
      }, h(token));
      setMsg({ text: "Group created!", error: false });
      setShowCreate(false);
      setForm({ name: "", description: "", type: "custom", school: "", semester: "", branch: "", section: "" });
      load();
    } catch (e) {
      setMsg({ text: e.response?.data?.message || "Failed to create", error: true });
    }
  };

  if (activeGroup) {
    return (
      <GroupChat
        group={activeGroup}
        token={token}
        userId={user?.id || user?._id}
        onBack={() => { setActiveGroup(null); load(); }}
      />
    );
  }

  const isStudent = user?.role === "student";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={S.pageTitle}>Study Groups</h1>
          <p style={S.pageSub}>Connect, collaborate and learn together</p>
        </div>
        {canCreate && (
          <button type="button" onClick={() => setShowCreate(p => !p)} style={S.primaryBtn}>
            {showCreate ? "✕ Cancel" : "+ Create Group"}
          </button>
        )}
      </div>

      {/* Feedback */}
      {msg.text && (
        <div style={{ padding: "10px 16px", background: msg.error ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", border: `1px solid ${msg.error ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 10, color: msg.error ? "#fca5a5" : "#86efac", fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      {/* Create form */}
      {showCreate && canCreate && (
        <div style={{ ...S.card, border: "1px solid rgba(99,102,241,0.3)" }}>
          <div style={S.cardHead}><span style={S.cardTitle}>Create New Group</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>Group Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. AI/ML Project Team" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={S.select}>
                <option value="custom">Custom</option>
                <option value="subject">Subject</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Branch (optional)</label>
              <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} style={S.select}>
                <option value="">All Branches</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Semester (optional)</label>
              <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} style={S.select}>
                <option value="">All Semesters</option>
                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this group about?" style={S.input} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={handleCreate} style={S.primaryBtn}>Create Group</button>
            <button type="button" onClick={() => setShowCreate(false)} style={S.secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs — only for students */}
      {isStudent && (
        <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4, alignSelf: "flex-start" }}>
          {[
            { key: "mine",   label: "📚 My Groups",     desc: "Your relevant groups" },
            { key: "browse", label: "🌐 Browse Others",  desc: "Explore other groups" },
          ].map(t => (
            <button key={t.key} type="button" onClick={() => { setTab(t.key); setTypeFilter("all"); }} style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: tab === t.key ? "rgba(99,102,241,0.3)" : "transparent", color: tab === t.key ? "#a5b4fc" : "rgba(255,255,255,0.45)", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Info banners */}
      {isStudent && tab === "mine" && (
        <div style={{ padding: "10px 16px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          💡 These are your <strong style={{ color: "#a5b4fc" }}>relevant groups</strong> based on your school, branch, semester and section. Join them to start chatting!
        </div>
      )}
      {isStudent && tab === "browse" && (
        <div style={{ padding: "10px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          🌐 Browsing groups outside your profile. You can request to join — <strong style={{ color: "#fcd34d" }}>class and section groups from other semesters are restricted.</strong>
        </div>
      )}

      {/* Type filter pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["all", ...Object.keys(TYPE_META)].map(t => (
          <button key={t} type="button" onClick={() => setTypeFilter(t)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid", borderColor: typeFilter === t ? "#6366f1" : "rgba(255,255,255,0.1)", background: typeFilter === t ? "rgba(99,102,241,0.18)" : "transparent", color: typeFilter === t ? "#a5b4fc" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
            {t === "all" ? "All Types" : TYPE_META[t]?.label}
          </button>
        ))}
      </div>

      {/* Groups grid */}
      {loading ? <Loader /> : groups.length === 0 ? (
        <Empty message={
          isStudent && tab === "mine"
            ? "No relevant groups found. Make sure your profile has semester, branch, section and school filled in."
            : "No groups found."
        } />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {groups.map(g => {
            const uid     = String(user?.id || user?._id);
            const isMember  = g.members?.some(m => String(m._id || m) === uid);
            const isCreator = String(g.createdBy?._id || g.createdBy) === uid;
            const isPredefined = !["subject","custom"].includes(g.type);
            const meta = TYPE_META[g.type] || TYPE_META.custom;
            const color = meta.color;

            return (
              <div key={g._id} style={{ ...S.card, borderTop: `3px solid ${color}`, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Title row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>{g.name}</p>
                  {isCreator && !isPredefined && (
                    <button type="button" onClick={() => handleDelete(g._id)} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", fontSize: 15, padding: "0 0 0 8px", flexShrink: 0 }}>🗑</button>
                  )}
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ ...S.badge, background: `${color}22`, color }}>{meta.label}</span>
                  {isPredefined && <span style={{ ...S.badge, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", fontSize: 10 }}>Predefined</span>}
                  {g.school   && <span style={S.tagPill}>{g.school}</span>}
                  {g.branch   && <span style={S.tagPill}>{g.branch}</span>}
                  {g.semester && <span style={S.tagPill}>Sem {g.semester}</span>}
                  {g.section  && <span style={S.tagPill}>Section {g.section}</span>}
                </div>

                {g.description && (
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{g.description}</p>
                )}

                {/* Member avatars */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex" }}>
                    {(g.members || []).slice(0, 5).map((m, i) => (
                      <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: `hsl(${i * 55},55%,45%)`, border: "2px solid #0d0e1a", marginLeft: i > 0 ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                        {(m.name || "U")[0].toUpperCase()}
                      </div>
                    ))}
                    {(g.members?.length || 0) > 5 && (
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2px solid #0d0e1a", marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                        +{g.members.length - 5}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{g.members?.length || 0} member{g.members?.length !== 1 ? "s" : ""}</span>
                  {isMember && <span style={{ ...S.badge, background: "rgba(34,197,94,0.12)", color: "#86efac", fontSize: 10 }}>✓ Joined</span>}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {isMember ? (
                    <>
                      <button type="button" onClick={() => setActiveGroup(g)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${color}cc,${color}88)`, color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        💬 Open Chat
                      </button>
                      <button type="button" onClick={() => handleLeave(g)} disabled={actionId === g._id} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {actionId === g._id ? "..." : "Leave"}
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => handleJoin(g)} disabled={actionId === g._id} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${color}55`, background: `${color}15`, color, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      {actionId === g._id ? "Joining..." : "Join Group"}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
      <div style={{ width: 22, height: 22, border: "2px solid rgba(99,102,241,0.3)", borderTop: "2px solid #6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading groups...
    </div>
  );
}

function Empty({ message }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12 }}>
      <span style={{ fontSize: 40 }}>💬</span>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}

const S = {
  pageTitle:   { fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, margin: 0 },
  pageSub:     { color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "4px 0 0" },
  card:        { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px" },
  cardHead:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  cardTitle:   { fontSize: 15, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" },
  label:       { display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  input:       { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select:      { width: "100%", background: "#1a1b35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 13, outline: "none", cursor: "pointer" },
  badge:       { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  tagPill:     { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" },
  primaryBtn:  { padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  secondaryBtn:{ padding: "10px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
};