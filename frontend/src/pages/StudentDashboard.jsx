/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { courseAPI, assignmentAPI, attendanceAPI, resultAPI, noticeAPI, timetableAPI } from "../api/index";
import CampusLogo from "../components/CampusLogo";
import StudyGroups from "./StudyGroups";
import TimetableBoard from "../components/TimetableBoard";

// ─── Configs ──────────────────────────────────────────────────────────────────
const STATUS = {
  ongoing:   { bg: "rgba(99,102,241,0.18)",  color: "#a5b4fc", label: "Ongoing"   },
  upcoming:  { bg: "rgba(34,197,94,0.15)",   color: "#86efac", label: "Upcoming"  },
  overdue:   { bg: "rgba(239,68,68,0.15)",   color: "#fca5a5", label: "Overdue"   },
  pending:   { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d", label: "Pending"   },
  submitted: { bg: "rgba(99,102,241,0.15)",  color: "#a5b4fc", label: "Submitted" },
  graded:    { bg: "rgba(34,197,94,0.15)",   color: "#86efac", label: "Graded"    },
  late:      { bg: "rgba(239,68,68,0.15)",   color: "#fca5a5", label: "Late"      },
  good:      { bg: "rgba(34,197,94,0.15)",   color: "#86efac", label: "Good"      },
  warning:   { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d", label: "Low"       },
  danger:    { bg: "rgba(239,68,68,0.15)",   color: "#fca5a5", label: "Critical"  },
};

const NOTICE_CAT = {
  exam:        { bg: "rgba(239,68,68,0.15)",   color: "#fca5a5" },
  scholarship: { bg: "rgba(34,197,94,0.15)",   color: "#86efac" },
  placement:   { bg: "rgba(99,102,241,0.15)",  color: "#a5b4fc" },
  general:     { bg: "rgba(156,163,175,0.15)", color: "#d1d5db" },
  event:       { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d" },
  fee:         { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d" },
};

const GRADE_COLOR = { "A+": "#22c55e", A: "#86efac", "B+": "#6366f1", B: "#a5b4fc", C: "#f59e0b", D: "#ef4444", F: "#ef4444" };
const COURSE_COLORS = ["#6366f1","#f59e0b","#ef4444","#22c55e","#8b5cf6","#06b6d4","#ec4899","#f97316"];

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard",   label: "Dashboard",   icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: "courses",     label: "My Courses",  icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { key: "registration",label: "Course Registration", icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> },
  { key: "timetable",   label: "Timetable",   icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="16" y1="14" x2="16" y2="18"/></svg> },
  { key: "assignments", label: "Assignments", icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg> },
  { key: "attendance",  label: "Attendance",  icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg> },
  { key: "results",     label: "Results",     icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { key: "notices",     label: "Notices",     icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { key: "studygroups", label: "Study Groups", icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: "tickets",     label: "My Tickets",  icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { key: "profile",     label: "Profile",     icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, token, logout } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [regStatus, setRegStatus] = useState(null);

  const fetchRegStatus = useCallback(async () => {
    try {
      const data = await courseAPI.getRegistrationStatus(token);
      setRegStatus(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchRegStatus();
  }, [fetchRegStatus]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const firstName = (user?.name || "Student").split(" ")[0];

  return (
    <div style={S.root}>
      {/* ── Sidebar ── */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 220 : 64 }}>
        <div style={S.logo}>
          <CampusLogo height={sidebarOpen ? 48 : 30} />
        </div>
        <nav style={S.nav}>
          {NAV.map(({ key, label, icon }) => {
            const on = active === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                style={{
                  ...S.navBtn,
                  background: on ? "rgba(99,102,241,0.18)" : "transparent",
                  color: on ? "#a5b4fc" : "rgba(255,255,255,0.55)",
                  borderLeft: on ? "2px solid #6366f1" : "2px solid transparent",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  cursor: "pointer",
                  opacity: 1,
                }}
              >
                <span style={{ flexShrink: 0, display: "flex" }}>{icon()}</span>
                {sidebarOpen && <span style={{ fontSize: 13, marginLeft: 2 }}>{label}</span>}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          style={{ ...S.navBtn, marginTop: "auto", color: "rgba(239,68,68,0.8)", justifyContent: sidebarOpen ? "flex-start" : "center" }}
        >
          <span style={{ display: "flex" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </span>
          {sidebarOpen && <span style={{ fontSize: 13, marginLeft: 2 }}>Logout</span>}
        </button>
      </aside>

      {/* ── Main ── */}
      <div style={S.main}>
        {/* Topbar */}
        <header style={S.topbar}>
          <button type="button" onClick={() => setSidebarOpen(p => !p)} style={S.iconBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={S.searchBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search..." style={S.searchInput} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <div style={{ position: "relative" }}>
              <button type="button" style={S.iconBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </button>
              <span style={S.notifDot} />
            </div>
            <button type="button" onClick={() => setActive("profile")} style={{ ...S.avatar, cursor: "pointer", border: active === "profile" ? "2px solid #6366f1" : "2px solid transparent" }}>
              {firstName[0]?.toUpperCase()}
            </button>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{firstName}</span>
          </div>
        </header>

        {/* Content */}
        <div style={S.content}>
          {active === "dashboard"   && <DashView greeting={greeting} firstName={firstName} user={user} token={token} setActive={setActive} regStatus={regStatus} />}
          {active === "courses"     && <CoursesView token={token} />}
          {active === "registration" && <RegistrationView token={token} onEnrollChange={fetchRegStatus} />}
          {active === "timetable"   && <TimetableView token={token} user={user} />}
          {active === "assignments" && <AssignmentsView token={token} />}
          {active === "attendance"  && <AttendanceView token={token} />}
          {active === "results"     && <ResultsView token={token} />}
          {active === "notices"     && <NoticesView token={token} />}
          {active === "studygroups" && <StudyGroups token={token} />}
          {active === "tickets"     && <ComingSoon title="My Tickets" icon="🎫" desc="Need Help? We are here. Coming soon!" />}
          {active === "profile"     && <ProfileView user={user} token={token} />}
        </div>
      </div>
    </div>
  );
}

function TimetableView({ token, user }) {
  const [data, setData] = useState({ entries: [], settings: null, generatedAt: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    timetableAPI.getStudent(token)
      .then((result) => {
        setData({
          entries: Array.isArray(result.entries) ? result.entries : [],
          settings: result.settings || null,
          generatedAt: result.generatedAt || null,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader />;

  return (
    <TimetableBoard
      title="My Timetable"
      subtitle={`${user?.branch || "Branch"} · Semester ${user?.semester || "—"}`}
      entries={data.entries}
      settings={data.settings}
      generatedAt={data.generatedAt}
      emptyMessage="No timetable has been generated for your class yet."
    />
  );
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────
function DashView({ greeting, firstName, user, token, setActive, regStatus }) {
  const [courses, setCourses]         = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices]         = useState([]);
  const [timetable, setTimetable]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isEditingCanvas, setIsEditingCanvas] = useState(false);

  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("student_canvas_layout");
    return saved ? JSON.parse(saved) : [
      { id: "stats", type: "stats", visible: true, size: "full", title: "Overview Stats" },
      { id: "timetable_glance", type: "timetable_glance", visible: true, size: "half", title: "Today's Schedule Glance" },
      { id: "enrolled_courses", type: "enrolled_courses", visible: true, size: "half", title: "My Courses" },
      { id: "recent_assignments", type: "recent_assignments", visible: true, size: "full", title: "Recent Assignments" },
      { id: "notices", type: "notices", visible: true, size: "full", title: "Latest Notices" },
      { id: "notes", type: "notes", visible: false, size: "half", title: "My Study Reminders" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("student_canvas_layout", JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    Promise.all([
      courseAPI.getAll(token).catch(() => []),
      assignmentAPI.getMy(token).catch(() => []),
      noticeAPI.getAll(token).catch(() => []),
      timetableAPI.getStudent(token).catch(() => null),
    ]).then(([c, a, n, t]) => {
      setCourses(Array.isArray(c) ? c : []);
      setAssignments(Array.isArray(a) ? a : []);
      setNotices(Array.isArray(n) ? n.slice(0, 3) : []);
      setTimetable(t);
      setLoading(false);
    });
  }, [token]);

  const moveUp = (idx) => {
    if (idx === 0) return;
    setLayout(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next;
    });
  };

  const moveDown = (idx) => {
    if (idx === layout.length - 1) return;
    setLayout(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next;
    });
  };

  const toggleSize = (idx) => {
    setLayout(prev => prev.map((item, i) => i === idx ? { ...item, size: item.size === "full" ? "half" : "full" } : item));
  };

  const toggleVisibility = (id) => {
    setLayout(prev => prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
  };

  const renameWidget = (id, title) => {
    setLayout(prev => prev.map(item => item.id === id ? { ...item, title } : item));
  };

  const resetLayout = () => {
    setLayout([
      { id: "stats", type: "stats", visible: true, size: "full", title: "Overview Stats" },
      { id: "timetable_glance", type: "timetable_glance", visible: true, size: "half", title: "Today's Schedule Glance" },
      { id: "enrolled_courses", type: "enrolled_courses", visible: true, size: "half", title: "My Courses" },
      { id: "recent_assignments", type: "recent_assignments", visible: true, size: "full", title: "Recent Assignments" },
      { id: "notices", type: "notices", visible: true, size: "full", title: "Latest Notices" },
      { id: "notes", type: "notes", visible: false, size: "half", title: "My Study Reminders" }
    ]);
  };

  const enrolled = courses.filter(c => c.isEnrolled);
  const pending  = assignments.filter(a => a.status === "pending").length;
  const overdue  = assignments.filter(a => a.status === "overdue").length;

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={S.pageTitle}>{greeting}, {firstName} 👋</h1>
          <p style={S.pageSub}>
            Semester: <strong>{user?.semester ? `${user.semester}th` : "—"} {user?.branch || ""}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={S.datePill}>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
          <button 
            type="button" 
            onClick={() => setIsEditingCanvas(!isEditingCanvas)}
            style={{ 
              padding: "8px 16px", 
              background: isEditingCanvas ? "rgba(16,185,129,0.18)" : "rgba(99,102,241,0.18)", 
              border: isEditingCanvas ? "1px solid #10b981" : "1px solid rgba(99,102,241,0.3)", 
              color: isEditingCanvas ? "#34d399" : "#a5b4fc", 
              borderRadius: 12, 
              fontSize: 12, 
              fontWeight: 600, 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s"
            }}
          >
            {isEditingCanvas ? "💾 Save Layout" : "🛠️ Customize Canvas"}
          </button>
        </div>
      </div>

      {/* Course Registration Warning Banner */}
      {regStatus && regStatus.isOpen && regStatus.currentCredits < regStatus.minCredits && (
        <div style={{
          padding: "16px 20px",
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 16,
          color: "#fcd34d",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <strong style={{ color: "#fff", display: "block", marginBottom: 2 }}>Pending Action: Course Registration is Open!</strong>
              <span>You have only registered for {regStatus.currentCredits} of the minimum {regStatus.minCredits} credits. Please complete registration before the deadline.</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setActive("registration")} 
            style={{ 
              padding: "8px 16px", 
              background: "#f59e0b", 
              color: "#0f172a", 
              fontWeight: 600, 
              border: "none", 
              borderRadius: 10, 
              fontSize: 12, 
              cursor: "pointer", 
              whiteSpace: "nowrap" 
            }}
          >
            Go to Registration
          </button>
        </div>
      )}

      {isEditingCanvas && (
        <div style={{ padding: "16px 20px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>🛠️ Canvas Design Studio: Active Widgets</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {layout.map(w => (
              <button 
                key={w.id}
                type="button"
                onClick={() => toggleVisibility(w.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  border: "none",
                  background: w.visible ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
                  color: w.visible ? "#a5b4fc" : "rgba(255,255,255,0.3)",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>{w.visible ? "👁️" : "🛇"}</span>
                {w.title}
              </button>
            ))}
            <button 
              type="button" 
              onClick={resetLayout} 
              style={{
                marginLeft: "auto",
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontFamily: "inherit",
                cursor: "pointer",
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.08)",
                color: "#fca5a5"
              }}
            >
              Reset Default
            </button>
          </div>
        </div>
      )}

      {/* Customizable Canvas Container */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {layout.map((w, idx) => {
          if (!w.visible) return null;
          const isFullWidth = w.size === "full";

          return (
            <div 
              key={w.id} 
              style={{ 
                width: isFullWidth ? "100%" : "calc(50% - 12px)", 
                display: "flex", 
                flexDirection: "column",
                transition: "all 0.25s ease",
                minWidth: 300,
                border: isEditingCanvas ? "1px dashed #6366f1" : "1px solid transparent",
                borderRadius: 16
              }}
            >
              {/* Widget Header Controls */}
              {isEditingCanvas && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(99,102,241,0.08)", borderBottom: "1px solid rgba(99,102,241,0.15)", padding: "8px 16px", borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 12 }}>
                  <input 
                    type="text" 
                    value={w.title} 
                    onChange={(e) => renameWidget(w.id, e.target.value)} 
                    style={{ background: "none", border: "none", color: "#fff", fontWeight: 600, fontSize: 13, borderBottom: "1px dashed rgba(255,255,255,0.3)", outline: "none", width: "100%", maxWidth: 180 }} 
                  />
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button type="button" onClick={() => moveUp(idx)} style={S.canvasMinBtn} title="Move Up">↑</button>
                    <button type="button" onClick={() => moveDown(idx)} style={S.canvasMinBtn} title="Move Down">↓</button>
                    <button type="button" onClick={() => toggleSize(idx)} style={S.canvasMinBtn} title="Toggle Width">
                      {w.size === "full" ? "Half Width" : "Full Width"}
                    </button>
                    <button type="button" onClick={() => toggleVisibility(w.id)} style={{ ...S.canvasMinBtn, color: "#fca5a5" }} title="Hide Widget">✕</button>
                  </div>
                </div>
              )}

              {/* Real Widget Card Content */}
              <div 
                style={{ 
                  ...S.card, 
                  flex: 1, 
                  borderTopLeftRadius: isEditingCanvas ? 0 : 16, 
                  borderTopRightRadius: isEditingCanvas ? 0 : 16 
                }}
              >
                <div style={S.cardHead}>
                  <span style={S.cardTitle}>{w.title}</span>
                  {w.type === "enrolled_courses" && enrolled.length > 0 && (
                    <button type="button" style={S.seeAll} onClick={() => setActive("courses")}>View All →</button>
                  )}
                  {w.type === "recent_assignments" && assignments.length > 0 && (
                    <button type="button" style={S.seeAll} onClick={() => setActive("assignments")}>View All →</button>
                  )}
                  {w.type === "notices" && notices.length > 0 && (
                    <button type="button" style={S.seeAll} onClick={() => setActive("notices")}>See All →</button>
                  )}
                  {w.type === "timetable_glance" && (
                    <button type="button" style={S.seeAll} onClick={() => setActive("timetable")}>Full Schedule →</button>
                  )}
                </div>

                {w.type === "stats" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
                    <StatCard icon="📚" value={enrolled.length} label="Enrolled Courses" accent="#6366f1" onClick={() => setActive("courses")} />
                    <StatCard icon="📝" value={pending}          label="Pending Assignments" accent="#f59e0b" onClick={() => setActive("assignments")} />
                    <StatCard icon="⚠️" value={overdue}          label="Overdue" accent="#ef4444" onClick={() => setActive("assignments")} />
                  </div>
                )}

                {w.type === "timetable_glance" && (
                  <TimetableGlanceWidget timetable={timetable} />
                )}

                {w.type === "enrolled_courses" && (
                  enrolled.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
                      {enrolled.slice(0, 6).map((c, i) => (
                        <div key={c._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 14, borderTop: `3px solid ${COURSE_COLORS[i % COURSE_COLORS.length]}` }}>
                          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{c.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.code} · {c.credits} Credits</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty message="No courses enrolled yet. Go to My Courses to enroll." action={{ label: "Go to Courses →", onClick: () => setActive("courses") }} />
                  )
                )}

                {w.type === "recent_assignments" && assignments.length > 0 && (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Title","Course","Due Date","Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {assignments.slice(0, 5).map(a => {
                        const st = STATUS[a.status] || STATUS.pending;
                        return (
                          <tr key={a._id}>
                            <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{a.title}</td>
                            <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{a.course?.name}</td>
                            <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{new Date(a.dueDate).toLocaleDateString("en-IN")}</td>
                            <td style={S.td}><span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {w.type === "notices" && notices.length > 0 && (
                  <div>
                    {notices.map(n => {
                      const cat = NOTICE_CAT[n.category] || NOTICE_CAT.general;
                      return (
                        <div key={n._id} style={{ paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ ...S.badge, background: cat.bg, color: cat.color, fontSize: 10, textTransform: "uppercase" }}>{n.category}</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{new Date(n.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{n.title}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{n.body}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {w.type === "notes" && (
                  <StudentNotesWidget />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Student Canvas Widget Components ────────────────────────────────────────
function StudentNotesWidget() {
  const [content, setContent] = useState(() => localStorage.getItem("student_scratchpad_notes") || "");
  const handleChange = (e) => {
    setContent(e.target.value);
    localStorage.setItem("student_scratchpad_notes", e.target.value);
  };
  return (
    <textarea
      value={content}
      onChange={handleChange}
      placeholder="Jot down assignment reminders, equations, or notes here... (Autosaved)"
      style={{
        width: "100%",
        height: 180,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 12,
        color: "#fff",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        resize: "none",
        lineHeight: 1.5
      }}
    />
  );
}

function TimetableGlanceWidget({ timetable }) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = weekdays[new Date().getDay()];
  
  const todayEntries = timetable && Array.isArray(timetable.entries)
    ? timetable.entries.filter(e => e.day === today)
    : [];

  if (!timetable) {
    return <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No active timetable found.</div>;
  }

  if (todayEntries.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 120, gap: 10, color: "rgba(255,255,255,0.4)" }}>
        <span style={{ fontSize: 32 }}>☕</span>
        <span style={{ fontSize: 13 }}>No classes scheduled for today ({today}). Rest up!</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Your agenda for today ({today}):</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {todayEntries.map((e, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
            <div style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
              Period {e.period}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#fff" }}>{e.courseName}</span>
              <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{e.startTime} - {e.endTime} · Room {e.room}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
}

// ─── My Courses ───────────────────────────────────────────────────────────────
function CoursesView({ token }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    courseAPI.getAll(token)
      .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleEnroll = async (id, isEnrolled) => {
    setActionId(id);
    setMsg("");
    try {
      const res = isEnrolled
        ? await courseAPI.unenroll(id, token)
        : await courseAPI.enroll(id, token);
      setMsg(res.message || "Done!");
      load();
    } catch { setMsg("Something went wrong."); }
    setActionId(null);
  };

  if (loading) return <Loader />;

  const enrolled  = courses.filter(c => c.isEnrolled);
  const available = courses.filter(c => !c.isEnrolled);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="My Courses" sub={`${enrolled.length} enrolled · ${available.length} available to join`} />
      {msg && <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, color: "#86efac", fontSize: 13 }}>{msg}</div>}

      {enrolled.length > 0 && (
        <>
          <SectionLabel>Enrolled ({enrolled.length})</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {enrolled.map((c, i) => <CourseCard key={c._id} course={c} color={COURSE_COLORS[i % COURSE_COLORS.length]} enrolled onAction={() => handleEnroll(c._id, true)} loading={actionId === c._id} />)}
          </div>
        </>
      )}

      {available.length > 0 && (
        <>
          <SectionLabel>Available to Enroll ({available.length})</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {available.map((c, i) => <CourseCard key={c._id} course={c} color={COURSE_COLORS[(enrolled.length + i) % COURSE_COLORS.length]} enrolled={false} onAction={() => handleEnroll(c._id, false)} loading={actionId === c._id} />)}
          </div>
        </>
      )}

      {courses.length === 0 && <Empty message="No courses found. Ask your admin to create courses for your semester and branch." />}
    </div>
  );
}

function CourseCard({ course, color, enrolled, onAction, loading }) {
  return (
    <div style={{ ...S.card, borderTop: `3px solid ${color}`, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{course.name}</p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{course.code} · {course.credits} Credits · Sem {course.semester}</p>
        </div>
        <span style={{ ...S.badge, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{course.branch}</span>
      </div>
      {course.faculty && <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>👨‍🏫 {course.faculty.name}</p>}
      {course.description && <p style={{ margin: "0 0 10px", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{course.description}</p>}
      <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>👥 {course.enrolledCount || 0} students enrolled</p>
      <button
        type="button"
        onClick={onAction}
        disabled={!!loading}
        style={{ width: "100%", padding: "9px", borderRadius: 10, border: `1px solid ${enrolled ? "rgba(239,68,68,0.3)" : color}`, background: enrolled ? "rgba(239,68,68,0.1)" : `${color}22`, color: enrolled ? "#fca5a5" : color, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "..." : enrolled ? "Unenroll" : "Enroll Now"}
      </button>
    </div>
  );
}

// ─── Assignments ──────────────────────────────────────────────────────────────
function AssignmentsView({ token }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");
  const [submitting, setSubmitting]   = useState(null);
  const [notes, setNotes]             = useState({});
  const [msg, setMsg]                 = useState("");

  const load = useCallback(() => {
    assignmentAPI.getMy(token)
      .then(d => { setAssignments(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (id) => {
    setSubmitting(id);
    setMsg("");
    try {
      const res = await assignmentAPI.submit(id, { note: notes[id] || "" }, token);
      setMsg(res.message || "Submitted!");
      load();
    } catch { setMsg("Submission failed."); }
    setSubmitting(null);
  };

  const filtered = filter === "all" ? assignments : assignments.filter(a => a.status === filter);

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Assignments" sub={`${assignments.filter(a => a.status === "pending").length} pending · ${assignments.filter(a => a.status === "overdue").length} overdue`} />

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["all","pending","submitted","graded","overdue","late"].map(f => (
          <button key={f} type="button" onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid", borderColor: filter === f ? "#6366f1" : "rgba(255,255,255,0.1)", background: filter === f ? "rgba(99,102,241,0.18)" : "transparent", color: filter === f ? "#a5b4fc" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, color: "#86efac", fontSize: 13 }}>{msg}</div>}

      {filtered.length === 0
        ? <Empty message={filter === "all" ? "No assignments yet. Enroll in courses first." : `No ${filter} assignments.`} />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(a => {
              const st = STATUS[a.status] || STATUS.pending;
              const canSubmit = a.status === "pending" || a.status === "overdue";
              return (
                <div key={a._id} style={{ ...S.card, padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{a.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                        {a.course?.name} · Due: {new Date(a.dueDate).toLocaleDateString("en-IN")} · {a.totalMarks} marks
                      </p>
                    </div>
                    <span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  {a.description && <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{a.description}</p>}
                  {a.submission?.marks != null && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(34,197,94,0.08)", borderRadius: 10, border: "1px solid rgba(34,197,94,0.2)" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#86efac" }}>
                        ✅ Marks: <strong>{a.submission.marks}/{a.totalMarks}</strong>
                        {a.submission.feedback && <span style={{ color: "rgba(255,255,255,0.5)" }}> · {a.submission.feedback}</span>}
                      </p>
                    </div>
                  )}
                  {canSubmit && (
                    <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                      <input
                        value={notes[a._id] || ""}
                        onChange={e => setNotes(p => ({ ...p, [a._id]: e.target.value }))}
                        placeholder="Add a note (optional)..."
                        style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontFamily: "inherit", fontSize: 13, outline: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmit(a._id)}
                        disabled={submitting === a._id}
                        style={{ padding: "8px 20px", background: "rgba(99,102,241,0.8)", border: "none", borderRadius: 8, color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                      >
                        {submitting === a._id ? "..." : "Submit"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

// ─── Attendance ───────────────────────────────────────────────────────────────
function AttendanceView({ token }) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getMy(token)
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader />;

  const overall = data.length > 0
    ? Math.round(data.reduce((s, a) => s + a.percent, 0) / data.length)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Attendance" sub="Current semester attendance record" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard icon="📊" value={`${overall}%`} label="Overall Attendance" accent={overall >= 75 ? "#22c55e" : "#ef4444"} />
        <StatCard icon="✅" value={data.filter(a => a.status === "good").length}    label="Above 75%" accent="#22c55e" />
        <StatCard icon="⚠️" value={data.filter(a => a.status !== "good").length}   label="Below 75%" accent="#ef4444" />
      </div>
      {data.length === 0
        ? <Empty message="No attendance data yet. Attend classes and your faculty will mark attendance." />
        : (
          <div style={S.card}>
            <div style={S.cardHead}><span style={S.cardTitle}>Subject-wise Attendance</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {data.map(a => {
                const barColor = a.status === "good" ? "#22c55e" : a.status === "warning" ? "#f59e0b" : "#ef4444";
                const st = STATUS[a.status] || STATUS.good;
                return (
                  <div key={a.course._id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{a.course.name}</span>
                        <span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{a.present}/{a.total} classes</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: barColor }}>{a.percent}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${a.percent}%`, background: barColor, borderRadius: 8 }} />
                    </div>
                    {a.status !== "good" && (
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: "#fcd34d" }}>
                        ⚠ Need {Math.max(0, Math.ceil((0.75 * a.total - a.present) / 0.25))} more classes to reach 75%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      }
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────
function ResultsView({ token }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resultAPI.getMy(token)
      .then(d => { setResults(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader />;

  const total    = results.reduce((s, r) => s + r.totalMarks, 0);
  const maxTotal = results.reduce((s, r) => s + r.maxMarks, 0);
  const percent  = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Results" sub="Academic performance record" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard icon="📈" value={`${percent}%`} label="Overall Score" accent="#6366f1" />
        <StatCard icon="🏆" value={results.filter(r => r.grade?.startsWith("A")).length} label="A Grades" accent="#22c55e" />
        <StatCard icon="📚" value={results.length} label="Subjects" accent="#f59e0b" />
      </div>
      {results.length === 0
        ? <Empty message="No results published yet. Check back after your exams." />
        : (
          <div style={S.card}>
            <div style={S.cardHead}><span style={S.cardTitle}>Subject-wise Results</span></div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Subject","Code","Internal","External","Total","Grade"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {results.map(r => (
                  <tr key={r._id}>
                    <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{r.course?.name}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{r.course?.code}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.6)" }}>{r.internalMarks}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.6)" }}>{r.externalMarks}</td>
                    <td style={{ ...S.td, fontWeight: 700, color: "#e2e8f0" }}>{r.totalMarks}/{r.maxMarks}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: `${GRADE_COLOR[r.grade] || "#6366f1"}22`, color: GRADE_COLOR[r.grade] || "#a5b4fc", fontWeight: 800, fontSize: 13 }}>{r.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 8, paddingTop: 14, display: "flex", justifyContent: "flex-end", gap: 32 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Total: <strong style={{ color: "#e2e8f0" }}>{total}/{maxTotal}</strong></span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Overall: <strong style={{ color: "#a5b4fc" }}>{percent}%</strong></span>
            </div>
          </div>
        )
      }
    </div>
  );
}

// ─── Notices ─────────────────────────────────────────────────────────────────
function NoticesView({ token }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    noticeAPI.getAll(token)
      .then(d => { setNotices(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Notices" sub={`${notices.length} active notices`} />
      {notices.length === 0
        ? <Empty message="No notices posted yet." />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notices.map(n => {
              const cat = NOTICE_CAT[n.category] || NOTICE_CAT.general;
              const open = selected === n._id;
              return (
                <div key={n._id} onClick={() => setSelected(open ? null : n._id)} style={{ ...S.card, padding: "16px 20px", cursor: "pointer", borderLeft: `3px solid ${cat.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ ...S.badge, background: cat.bg, color: cat.color, textTransform: "capitalize" }}>{n.category}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{n.title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{new Date(n.createdAt).toLocaleDateString("en-IN")}</span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
                    </div>
                  </div>
                  {open && <p style={{ margin: "12px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>{n.body}</p>}
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────
function ProfileView({ user, token }) {
  const [form, setForm] = useState({
    name:        user?.name || "",
    email:       user?.email || "",
    semester:    user?.semester || "",
    branch:      user?.branch || "",
    section:     user?.section || "",
    school:      user?.school || "",
    rollNumber:  user?.rollNumber || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");
  const [isError, setIsError] = useState(false);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const API = (await import("../api/api.js")).default;
      await API.put("/auth/profile", form, { headers: { Authorization: `Bearer ${token}` } });
      setMsg("Profile updated successfully!");
      setIsError(false);
    } catch (e) {
      setMsg(e.response?.data?.message || "Failed to update profile.");
      setIsError(true);
    }
    setSaving(false);
  };

  const firstName = (user?.name || "S").split(" ")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
      <PageHeader title="My Profile" sub="View and update your personal information" />

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {firstName[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>{user?.name}</p>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{user?.email}</p>
          <span style={{ ...S.badge, background: "rgba(99,102,241,0.15)", color: "#a5b4fc", marginTop: 6, display: "inline-block", textTransform: "capitalize" }}>{user?.role}</span>
        </div>
      </div>

      {/* Form */}
      <div style={S.card}>
        <div style={S.cardHead}><span style={S.cardTitle}>Edit Information</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Full Name",    key: "name",       type: "text",   placeholder: "Your full name" },
            { label: "Email",        key: "email",      type: "email",  placeholder: "you@college.edu" },
            { label: "Roll Number",  key: "rollNumber", type: "text",   placeholder: "e.g. 21CSE001" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Semester</label>
              <select value={form.semester} onChange={e => update("semester", e.target.value)} style={{ width: "100%", background: "#1a1b35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none" }}>
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}th Sem</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Branch</label>
              <select value={form.branch} onChange={e => update("branch", e.target.value)} style={{ width: "100%", background: "#1a1b35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none" }}>
                <option value="">Select</option>
                {["CSE","AI/ML","Data Science","Cyber Security","Full Stack Development","UI/UX Design","Cloud Computing","Robotics"].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Section</label>
              <select value={form.section} onChange={e => update("section", e.target.value)} style={{ width: "100%", background: "#1a1b35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none" }}>
                <option value="">Select</option>
                {["A","B","C","D","E","F","G"].map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>School</label>
              <select value={form.school} onChange={e => update("school", e.target.value)} style={{ width: "100%", background: "#1a1b35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none" }}>
                <option value="">Select</option>
                {["SOET","SOMC","SOAD","SOLS","SOAS"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {msg && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: isError ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", border: `1px solid ${isError ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 10, color: isError ? "#fca5a5" : "#86efac", fontSize: 13 }}>
            {msg}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 20, width: "100%", padding: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Coming Soon ──────────────────────────────────────────────────────────────
function ComingSoon({ title, icon = "🚧", desc }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
      <span style={{ fontSize: 56 }}>{icon}</span>
      <h2 style={{ ...S.pageTitle, margin: 0 }}>{title}</h2>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 360, lineHeight: 1.7 }}>{desc || "This section is under construction. Coming soon!"}</p>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function StatCard({ icon, value, label, accent, onClick }) {
  return (
    <div onClick={onClick} style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${accent}22`, border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{label}</div>
      </div>
      <div style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", width: 80, height: 80, borderRadius: "50%", background: accent, opacity: 0.06, filter: "blur(20px)", pointerEvents: "none" }} />
    </div>
  );
}

function PageHeader({ title, sub }) {
  return <div><h1 style={S.pageTitle}>{title}</h1>{sub && <p style={S.pageSub}>{sub}</p>}</div>;
}

function SectionLabel({ children }) {
  return <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>{children}</p>;
}

function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
      <div style={{ width: 24, height: 24, border: "2px solid rgba(99,102,241,0.3)", borderTop: "2px solid #6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading...
    </div>
  );
}

function Empty({ message, action }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12, textAlign: "center" }}>
      <span style={{ fontSize: 40 }}>📭</span>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>{message}</p>
      {action && <button type="button" onClick={action.onClick} style={{ padding: "8px 20px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, color: "#a5b4fc", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>{action.label}</button>}
    </div>
  );
}

function RegistrationView({ token, onEnrollChange }) {
  const [status, setStatus] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  const load = useCallback(async () => {
    try {
      const statusData = await courseAPI.getRegistrationStatus(token);
      const coursesData = await courseAPI.getAll(token);
      setStatus(statusData);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      console.error(err);
      setMsg("Failed to load registration details.");
      setMsgType("error");
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleEnroll = async (courseId, isEnrolled) => {
    setActionId(courseId);
    setMsg("");
    try {
      const res = isEnrolled
        ? await courseAPI.unenroll(courseId, token)
        : await courseAPI.enroll(courseId, token);
      setMsg(res.message || "Action completed!");
      setMsgType("success");
      await load();
      if (typeof onEnrollChange === "function") {
        await onEnrollChange();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong.";
      setMsg(errMsg);
      setMsgType("error");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <Loader />;
  if (!status) return <Empty message="Failed to load registration status." />;

  const { isOpen, minCredits = 12, maxCredits = 24, currentCredits = 0, window: activeWindow } = status;

  if (!isOpen) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, textAlign: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 40 }}>
        <span style={{ fontSize: 48 }}>🔒</span>
        <h2 style={{ margin: 0, fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>Course Registration is Closed</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
          Registration is not open for your semester or branch at this time. Please contact the academic advisor or check again later.
        </p>
        {activeWindow && (
          <div style={{ marginTop: 8, padding: "8px 16px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, color: "#fcd34d", fontSize: 13 }}>
            Scheduled window: {new Date(activeWindow.startDate).toLocaleDateString()} to {new Date(activeWindow.endDate).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  }

  const coreCourses = courses.filter(c => c.category === "core" || !c.category);
  const electiveCourses = courses.filter(c => c.category === "elective");
  const vacCourses = courses.filter(c => c.category === "vac");

  let progressColor = "#6366f1";
  if (currentCredits > maxCredits) progressColor = "#ef4444";
  else if (currentCredits >= minCredits) progressColor = "#22c55e";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <PageHeader title="Academic Course Registration" sub="Select courses for your current semester and branch. Review time-slots to prevent clashes." />

      {/* Curriculum Requirements Alert */}
      <div style={{ 
        padding: "16px 20px", 
        background: "rgba(139,92,246,0.08)", 
        border: "1px solid rgba(139,92,246,0.2)", 
        borderRadius: 16, 
        color: "#c084fc", 
        fontSize: 13,
        lineHeight: 1.6,
        display: "flex",
        flexDirection: "column",
        gap: 6
      }}>
        <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>🎓 Curriculum Requirements:</span>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Register for all core academic subjects (Required).</li>
          <li>Choose exactly <strong>1 open elective</strong> out of the elective choices (Max 1).</li>
          <li>Choose exactly <strong>1 Value Added Course (VAC)</strong> out of the VAC choices (Max 1).</li>
        </ul>
      </div>

      {msg && (
        <div style={{ 
          padding: "12px 18px", 
          background: msgType === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", 
          border: msgType === "success" ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.25)", 
          borderRadius: 12, 
          color: msgType === "success" ? "#86efac" : "#fca5a5", 
          fontSize: 13,
          fontWeight: 500
        }}>
          {msgType === "success" ? "✅" : "⚠️"} {msg}
        </div>
      )}

      {/* Credit Progress Bar */}
      <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12, padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Registered Credits</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
            {currentCredits} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>/ {maxCredits} max</span>
          </span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
          <div style={{ height: "100%", width: `${Math.min((currentCredits / maxCredits) * 100, 100)}%`, background: progressColor, borderRadius: 4, transition: "width 0.3s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          <span>Min allowance: {minCredits} credits</span>
          <span>Max allowance: {maxCredits} credits</span>
        </div>
      </div>

      {/* Core Courses Section */}
      {coreCourses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionLabel>Core Academic Courses ({coreCourses.length})</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {coreCourses.map((c, i) => (
              <RegistrationCourseCard 
                key={c._id} 
                course={c} 
                color={COURSE_COLORS[i % COURSE_COLORS.length]} 
                onAction={() => handleEnroll(c._id, c.isEnrolled)} 
                actionLoading={actionId === c._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Elective Courses Section */}
      {electiveCourses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionLabel>Elective Choices ({electiveCourses.length})</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {electiveCourses.map((c, i) => (
              <RegistrationCourseCard 
                key={c._id} 
                course={c} 
                color={COURSE_COLORS[(coreCourses.length + i) % COURSE_COLORS.length]} 
                onAction={() => handleEnroll(c._id, c.isEnrolled)} 
                actionLoading={actionId === c._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Value Added Courses Section */}
      {vacCourses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionLabel>Value Added Courses (VAC) ({vacCourses.length})</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {vacCourses.map((c, i) => (
              <RegistrationCourseCard 
                key={c._id} 
                course={c} 
                color={COURSE_COLORS[(coreCourses.length + electiveCourses.length + i) % COURSE_COLORS.length]} 
                onAction={() => handleEnroll(c._id, c.isEnrolled)} 
                actionLoading={actionId === c._id}
              />
            ))}
          </div>
        </div>
      )}

      {courses.length === 0 && <Empty message="No courses available for registration in your semester and department." />}
    </div>
  );
}

function RegistrationCourseCard({ course, color, onAction, actionLoading }) {
  const isEnrolled = !!course.isEnrolled;
  const capacity = course.capacity || 60;
  const enrolledCount = course.enrolledCount || 0;
  const isFull = enrolledCount >= capacity;
  const fillPercent = Math.min((enrolledCount / capacity) * 100, 100);

  return (
    <div style={{ ...S.card, borderTop: `3px solid ${color}`, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16, height: "100%", padding: 20 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{course.name}</span>
          <span style={{ ...S.badge, background: course.category === "elective" ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)", color: course.category === "elective" ? "#fcd34d" : "#86efac", border: course.category === "elective" ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(34,197,94,0.2)" }}>
            {course.category === "elective" ? "Elective" : "Core"}
          </span>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          {course.code} · {course.credits} Credits
        </p>

        {course.slot && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, margin: "0 0 12px", padding: "4px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 12, color: "#e2e8f0" }}>
            <span>🕒 Slot:</span>
            <strong style={{ color: "#a5b4fc" }}>{course.slot}</strong>
          </div>
        )}

        {course.description && (
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            {course.description}
          </p>
        )}
      </div>

      <div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "0 0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
            <span>Capacity</span>
            <span style={{ color: isFull ? "#fca5a5" : "rgba(255,255,255,0.5)" }}>
              {enrolledCount} / {capacity} Seats
            </span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${fillPercent}%`, background: isFull ? "#ef4444" : "#22c55e", borderRadius: 2 }} />
          </div>
        </div>

        <button
          type="button"
          onClick={onAction}
          disabled={actionLoading || (!isEnrolled && isFull)}
          style={{ 
            width: "100%", 
            padding: "10px", 
            borderRadius: 12, 
            border: isEnrolled ? "1px solid rgba(239,68,68,0.25)" : `1px solid ${color}`, 
            background: isEnrolled ? "rgba(239,68,68,0.08)" : `${color}18`, 
            color: isEnrolled ? "#fca5a5" : color, 
            fontFamily: "inherit", 
            fontSize: 13, 
            fontWeight: 600, 
            cursor: actionLoading || (!isEnrolled && isFull) ? "not-allowed" : "pointer", 
            transition: "all 0.2s", 
            opacity: actionLoading ? 0.6 : 1 
          }}
        >
          {actionLoading ? "Processing..." : isEnrolled ? "Drop Course" : isFull ? "Course Full" : "Register Course"}
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root:       { display: "flex", minHeight: "100vh", background: "#0d0e1a", fontFamily: "'DM Sans',sans-serif", color: "#fff", overflow: "hidden" },
  sidebar:    { background: "#10112a", borderRight: "1px solid rgba(99,102,241,0.15)", display: "flex", flexDirection: "column", padding: "20px 0", transition: "width 0.25s cubic-bezier(.4,0,.2,1)", overflow: "hidden", flexShrink: 0, minHeight: "100vh", position: "sticky", top: 0 },
  logo:       { display: "flex", alignItems: "center", gap: 10, padding: "0 18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8, whiteSpace: "nowrap" },
  logoText:   { fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff" },
  nav:        { display: "flex", flexDirection: "column", gap: 2, padding: "0 8px", flex: 1 },
  navBtn:     { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, transition: "all 0.15s", whiteSpace: "nowrap", width: "100%", textAlign: "left" },
  main:       { flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 },
  topbar:     { display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,14,26,0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 },
  iconBtn:    { background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 8, display: "flex", borderRadius: 8 },
  searchBox:  { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 320 },
  searchInput:{ background: "none", border: "none", outline: "none", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 13, width: "100%" },
  notifDot:   { position: "absolute", top: 2, right: 2, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: "1.5px solid #0d0e1a" },
  avatar:     { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", border: "2px solid transparent", transition: "border 0.2s" },
  content:    { padding: "28px 32px", flex: 1 },
  pageTitle:  { fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, margin: 0 },
  pageSub:    { color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "4px 0 0" },
  datePill:   { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", borderRadius: 20, padding: "6px 14px", fontSize: 12 },
  card:       { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px" },
  cardHead:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  cardTitle:  { fontSize: 15, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" },
  seeAll:     { background: "none", border: "none", color: "#6366f1", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 },
  th:         { textAlign: "left", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingRight: 12 },
  td:         { padding: "12px 12px 12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
  badge:      { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  canvasMinBtn:{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", padding: "4px 8px", fontSize: 11, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }
};
