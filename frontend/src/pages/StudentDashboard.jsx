import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STATS = { enrolledCourses: 6, pendingAssignments: 3, attendance: 82 };

const MOCK_CLASSES = [
  { id: 1, subject: "OS", faculty: "Dr. K. Sharma", time: "9:00 AM – 10:00 AM", room: "A-101", status: "ongoing" },
  { id: 2, subject: "DBMS", faculty: "Prof. A. Verma", time: "11:00 AM – 12:00 PM", room: "B-204", status: "upcoming" },
  { id: 3, subject: "C.R. Networks", faculty: "Dr. S. Kulkarni", time: "2:00 PM – 3:00 PM", room: "C-301", status: "upcoming" },
  { id: 4, subject: "Algorithms", faculty: "Dr. R. Mehta", time: "3:00 PM – 4:00 PM", room: "A-105", status: "upcoming" },
];

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: "Exam Schedule Published", date: "Apr 22", body: "The semester exam timetable has been released. Check the portal for room and slot details.", tag: "exam" },
  { id: 2, title: "Semester Fee Payment Reminder", date: "Apr 20", body: "Last date for fee payment is 30th April. Late fee will be applicable after that.", tag: "fee" },
  { id: 3, title: "Student Council Elections Next Week", date: "Apr 18", body: "Nominations are open until Friday. All students are encouraged to participate.", tag: "event" },
];

const MOCK_COURSES = [
  { id: 1, name: "Computer Networks", code: "CS401", faculty: "Dr. S. Kulkarni", progress: 60, total: 5, done: 3, status: "ongoing", color: "#6366f1", credits: 4 },
  { id: 2, name: "Database Management", code: "CS302", faculty: "Prof. A. Verma", progress: 75, total: 4, done: 2, status: "upcoming", color: "#f59e0b", credits: 3 },
  { id: 3, name: "Operating Systems", code: "CS303", faculty: "Dr. K. Sharma", progress: 20, total: 5, done: 1, status: "overdue", color: "#ef4444", credits: 4 },
  { id: 4, name: "Algorithms", code: "CS304", faculty: "Dr. R. Mehta", progress: 45, total: 6, done: 3, status: "ongoing", color: "#22c55e", credits: 3 },
  { id: 5, name: "Software Engineering", code: "CS305", faculty: "Prof. M. Singh", progress: 80, total: 4, done: 4, status: "ongoing", color: "#8b5cf6", credits: 3 },
  { id: 6, name: "Computer Architecture", code: "CS306", faculty: "Dr. P. Kumar", progress: 35, total: 5, done: 2, status: "upcoming", color: "#06b6d4", credits: 4 },
];

const MOCK_ASSIGNMENTS = [
  { id: 1, title: "TCP/IP Protocol Analysis", subject: "Computer Networks", due: "Apr 25, 2026", status: "pending", marks: null, total: 20 },
  { id: 2, title: "ER Diagram Design", subject: "Database Management", due: "Apr 22, 2026", status: "submitted", marks: null, total: 15 },
  { id: 3, title: "Process Scheduling Report", subject: "Operating Systems", due: "Apr 18, 2026", status: "overdue", marks: null, total: 25 },
  { id: 4, title: "Sorting Algorithm Analysis", subject: "Algorithms", due: "Apr 30, 2026", status: "pending", marks: null, total: 20 },
  { id: 5, title: "UML Diagram for Library System", subject: "Software Engineering", due: "Apr 28, 2026", status: "graded", marks: 18, total: 20 },
  { id: 6, title: "Cache Memory Design", subject: "Computer Architecture", due: "May 2, 2026", status: "pending", marks: null, total: 15 },
];

const MOCK_ATTENDANCE = [
  { id: 1, subject: "Computer Networks", total: 32, present: 28, percent: 87, status: "good" },
  { id: 2, subject: "Database Management", total: 28, present: 22, percent: 78, status: "warning" },
  { id: 3, subject: "Operating Systems", total: 30, present: 18, percent: 60, status: "danger" },
  { id: 4, subject: "Algorithms", total: 26, present: 24, percent: 92, status: "good" },
  { id: 5, subject: "Software Engineering", total: 24, present: 21, percent: 87, status: "good" },
  { id: 6, subject: "Computer Architecture", total: 28, present: 20, percent: 71, status: "warning" },
];

const MOCK_RESULTS = [
  { id: 1, subject: "Data Structures", code: "CS201", internal: 28, external: 62, total: 90, max: 100, grade: "A", semester: 4 },
  { id: 2, subject: "Computer Organization", code: "CS202", internal: 24, external: 55, total: 79, max: 100, grade: "B+", semester: 4 },
  { id: 3, subject: "Discrete Mathematics", code: "MA201", internal: 30, external: 68, total: 98, max: 100, grade: "A+", semester: 4 },
  { id: 4, subject: "OOP", code: "CS203", internal: 22, external: 58, total: 80, max: 100, grade: "A", semester: 4 },
  { id: 5, subject: "Digital Electronics", code: "EC201", internal: 18, external: 48, total: 66, max: 100, grade: "B", semester: 4 },
];

const MOCK_NOTICES = [
  { id: 1, title: "Mid-Semester Examination Schedule", category: "exam", date: "Apr 22, 2026", body: "Mid-semester exams from May 5–12. Check individual subject slots on the notice board." },
  { id: 2, title: "Scholarship Applications Open", category: "scholarship", date: "Apr 20, 2026", body: "Merit-cum-means scholarship applications are open. Last date: May 1, 2026." },
  { id: 3, title: "Campus Placement Drive — TCS", category: "placement", date: "Apr 18, 2026", body: "TCS will be visiting campus on April 30. Eligible students must register by April 25." },
  { id: 4, title: "Library Timing Change", category: "general", date: "Apr 15, 2026", body: "Library will remain open till 10 PM from April 20 onwards during exam season." },
  { id: 5, title: "Sports Day Registration", category: "event", date: "Apr 12, 2026", body: "Annual Sports Day on May 15. Register for your preferred sport before April 28." },
];

// ─── Status & Tag configs ────────────────────────────────────────────────────
const STATUS = {
  ongoing:   { bg: "rgba(99,102,241,0.18)",  color: "#a5b4fc", label: "Ongoing" },
  upcoming:  { bg: "rgba(34,197,94,0.15)",   color: "#86efac", label: "Upcoming" },
  overdue:   { bg: "rgba(239,68,68,0.15)",   color: "#fca5a5", label: "Overdue" },
  pending:   { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d", label: "Pending" },
  submitted: { bg: "rgba(99,102,241,0.15)",  color: "#a5b4fc", label: "Submitted" },
  graded:    { bg: "rgba(34,197,94,0.15)",   color: "#86efac", label: "Graded" },
  good:      { bg: "rgba(34,197,94,0.15)",   color: "#86efac", label: "Good" },
  warning:   { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d", label: "Low" },
  danger:    { bg: "rgba(239,68,68,0.15)",   color: "#fca5a5", label: "Critical" },
};

const NOTICE_CATEGORY = {
  exam:        { bg: "rgba(239,68,68,0.15)",   color: "#fca5a5" },
  scholarship: { bg: "rgba(34,197,94,0.15)",   color: "#86efac" },
  placement:   { bg: "rgba(99,102,241,0.15)",  color: "#a5b4fc" },
  general:     { bg: "rgba(156,163,175,0.15)", color: "#d1d5db" },
  event:       { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d" },
  fee:         { bg: "rgba(245,158,11,0.15)",  color: "#fcd34d" },
};

const GRADE_COLOR = { "A+": "#22c55e", A: "#86efac", "B+": "#6366f1", B: "#a5b4fc", C: "#f59e0b", D: "#ef4444" };

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard",   label: "Dashboard",   icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: "courses",     label: "My Courses",  icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { key: "assignments", label: "Assignments", icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg> },
  { key: "attendance",  label: "Attendance",  icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg> },
  { key: "results",     label: "Results",     icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { key: "notices",     label: "Notices",     icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [greeting, setGreeting] = useState("Hi");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good Morning");
    else if (h < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const firstName = (user?.name || "Student").split(" ")[0];

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 220 : 64 }}>
        <div style={S.logo}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🎓</span>
          {sidebarOpen && <span style={S.logoText}>Campus<span style={{ color: "#6366f1" }}>+</span></span>}
        </div>
        <nav style={S.nav}>
          {NAV.map(({ key, label, icon: Icon }) => {
            const on = active === key;
            return (
              <button key={key} onClick={() => setActive(key)} style={{
                ...S.navBtn,
                background: on ? "rgba(99,102,241,0.18)" : "transparent",
                color: on ? "#a5b4fc" : "rgba(255,255,255,0.5)",
                borderLeft: on ? "2px solid #6366f1" : "2px solid transparent",
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}>
                <span style={{ flexShrink: 0 }}><Icon /></span>
                {sidebarOpen && <span style={{ fontSize: 13 }}>{label}</span>}
              </button>
            );
          })}
        </nav>
        <button onClick={logout} style={{ ...S.navBtn, marginTop: "auto", color: "rgba(239,68,68,0.7)", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {sidebarOpen && <span style={{ fontSize: 13 }}>Logout</span>}
        </button>
      </aside>

      {/* Main */}
      <div style={S.main}>
        {/* Topbar */}
        <header style={S.topbar}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={S.iconBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={S.searchBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search..." style={S.searchInput} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <div style={{ position: "relative", ...S.iconBtn }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={S.notifDot} />
            </div>
            <div style={S.avatar}>{firstName[0]?.toUpperCase()}</div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{firstName}</span>
          </div>
        </header>

        {/* Content */}
        <div style={S.content}>
          {active === "dashboard"   && <DashView greeting={greeting} firstName={firstName} user={user} />}
          {active === "courses"     && <CoursesView />}
          {active === "assignments" && <AssignmentsView />}
          {active === "attendance"  && <AttendanceView />}
          {active === "results"     && <ResultsView />}
          {active === "notices"     && <NoticesView />}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashView({ greeting, firstName, user }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={S.pageTitle}>{greeting}, {firstName} 👋</h1>
          <p style={S.pageSub}>
            Semester: <strong>{user?.semester ? `${user.semester}th` : "6th"} {user?.branch || "CSE"}</strong>
            &nbsp;·&nbsp; Attendance: <strong style={{ color: "#86efac" }}>{MOCK_STATS.attendance}%</strong>
          </p>
        </div>
        <span style={S.datePill}>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard icon="📚" value={MOCK_STATS.enrolledCourses} label="Enrolled Courses" accent="#6366f1" />
        <StatCard icon="📝" value={MOCK_STATS.pendingAssignments} label="Pending Assignments" accent="#f59e0b" />
        <StatCard icon="📊" value={`${MOCK_STATS.attendance}%`} label="Attendance" accent="#22c55e" />
      </div>

      {/* Middle */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ ...S.card, flex: 2, minWidth: 300 }}>
          <div style={S.cardHead}><span style={S.cardTitle}>Upcoming Classes</span></div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Subject","Faculty","Time","Room","Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {MOCK_CLASSES.map(c => {
                const st = STATUS[c.status];
                return (
                  <tr key={c.id}>
                    <td style={S.td}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block", flexShrink: 0 }} /><strong style={{ color: "#e2e8f0", fontSize: 13 }}>{c.subject}</strong></div></td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{c.faculty}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{c.time}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{c.room}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ ...S.card, flex: 1, minWidth: 240 }}>
          <div style={S.cardHead}><span style={S.cardTitle}>Announcements</span><button style={S.seeAll}>See All</button></div>
          {MOCK_ANNOUNCEMENTS.map(a => {
            const t = NOTICE_CATEGORY[a.tag] || NOTICE_CATEGORY.general;
            return (
              <div key={a.id} style={{ paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ ...S.badge, background: t.bg, color: t.color, fontSize: 10, textTransform: "uppercase" }}>{a.tag}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{a.date}</span>
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{a.title}</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{a.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Progress */}
      <div style={S.card}>
        <div style={S.cardHead}><span style={S.cardTitle}>Course Progress</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {MOCK_COURSES.map(c => {
            const st = STATUS[c.status];
            return (
              <div key={c.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{c.done}/{c.total}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${c.progress}%`, background: c.color, borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.done} completed</span>
                  <span style={{ ...S.badge, background: st.bg, color: st.color, fontSize: 10 }}>{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── My Courses ───────────────────────────────────────────────────────────────
function CoursesView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="My Courses" sub="Semester 6 · 6 enrolled courses" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {MOCK_COURSES.map(c => {
          const st = STATUS[c.status];
          return (
            <div key={c.id} style={{ ...S.card, borderTop: `3px solid ${c.color}`, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{c.name}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{c.code} · {c.credits} Credits</p>
                </div>
                <span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span>
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>👨‍🏫 {c.faculty}</p>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Progress</span>
                  <span style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>{c.progress}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.progress}%`, background: c.color, borderRadius: 4 }} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{c.done} of {c.total} assignments done</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Assignments ──────────────────────────────────────────────────────────────
function AssignmentsView() {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "pending", "submitted", "graded", "overdue"];
  const filtered = filter === "all" ? MOCK_ASSIGNMENTS : MOCK_ASSIGNMENTS.filter(a => a.status === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Assignments" sub={`${MOCK_ASSIGNMENTS.filter(a => a.status === "pending").length} pending · ${MOCK_ASSIGNMENTS.filter(a => a.status === "overdue").length} overdue`} />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 16px", borderRadius: 20, border: "1px solid",
            borderColor: filter === f ? "#6366f1" : "rgba(255,255,255,0.1)",
            background: filter === f ? "rgba(99,102,241,0.18)" : "transparent",
            color: filter === f ? "#a5b4fc" : "rgba(255,255,255,0.5)",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Assignment", "Subject", "Due Date", "Marks", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const st = STATUS[a.status];
              return (
                <tr key={a.id}>
                  <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{a.title}</td>
                  <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{a.subject}</td>
                  <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{a.due}</td>
                  <td style={{ ...S.td, fontSize: 13 }}>
                    {a.marks !== null
                      ? <span style={{ color: "#86efac", fontWeight: 700 }}>{a.marks}/{a.total}</span>
                      : <span style={{ color: "rgba(255,255,255,0.25)" }}>—/{a.total}</span>}
                  </td>
                  <td style={S.td}><span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Attendance ───────────────────────────────────────────────────────────────
function AttendanceView() {
  const overall = Math.round(MOCK_ATTENDANCE.reduce((s, a) => s + a.percent, 0) / MOCK_ATTENDANCE.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Attendance" sub="Current semester attendance record" />

      {/* Overall */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard icon="📊" value={`${overall}%`} label="Overall Attendance" accent={overall >= 75 ? "#22c55e" : "#ef4444"} />
        <StatCard icon="✅" value={MOCK_ATTENDANCE.filter(a => a.status === "good").length} label="Subjects Above 75%" accent="#22c55e" />
        <StatCard icon="⚠️" value={MOCK_ATTENDANCE.filter(a => a.status !== "good").length} label="Subjects Below 75%" accent="#ef4444" />
      </div>

      {/* Per subject */}
      <div style={S.card}>
        <div style={S.cardHead}><span style={S.cardTitle}>Subject-wise Attendance</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {MOCK_ATTENDANCE.map(a => {
            const st = STATUS[a.status];
            const barColor = a.status === "good" ? "#22c55e" : a.status === "warning" ? "#f59e0b" : "#ef4444";
            return (
              <div key={a.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{a.subject}</span>
                    <span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{a.present}/{a.total} classes</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: barColor, minWidth: 42, textAlign: "right" }}>{a.percent}%</span>
                  </div>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${a.percent}%`, background: barColor, borderRadius: 8, transition: "width 0.8s ease" }} />
                </div>
                {a.status !== "good" && (
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#fcd34d" }}>
                    ⚠ Need {Math.ceil((0.75 * a.total - a.present) / 0.25)} more classes to reach 75%
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function ResultsView() {
  const total = MOCK_RESULTS.reduce((s, r) => s + r.total, 0);
  const maxTotal = MOCK_RESULTS.reduce((s, r) => s + r.max, 0);
  const percent = Math.round((total / maxTotal) * 100);
  const sgpa = 8.4;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Results" sub="Semester 4 · Academic Performance" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard icon="🏆" value={`${sgpa}`} label="SGPA" accent="#f59e0b" />
        <StatCard icon="📈" value={`${percent}%`} label="Overall Score" accent="#6366f1" />
        <StatCard icon="🎯" value={MOCK_RESULTS.filter(r => r.grade.startsWith("A")).length} label="A Grades" accent="#22c55e" />
      </div>

      <div style={S.card}>
        <div style={S.cardHead}><span style={S.cardTitle}>Subject-wise Results</span></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Subject", "Code", "Internal", "External", "Total", "Grade"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {MOCK_RESULTS.map(r => (
              <tr key={r.id}>
                <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{r.subject}</td>
                <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{r.code}</td>
                <td style={{ ...S.td, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{r.internal}/30</td>
                <td style={{ ...S.td, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{r.external}/70</td>
                <td style={{ ...S.td, fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{r.total}/{r.max}</td>
                <td style={S.td}>
                  <span style={{ ...S.badge, background: `${GRADE_COLOR[r.grade] || "#6366f1"}22`, color: GRADE_COLOR[r.grade] || "#a5b4fc", fontWeight: 800, fontSize: 13 }}>
                    {r.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary row */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 8, paddingTop: 14, display: "flex", justifyContent: "flex-end", gap: 32 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Total: <strong style={{ color: "#e2e8f0" }}>{total}/{maxTotal}</strong></span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Percentage: <strong style={{ color: "#a5b4fc" }}>{percent}%</strong></span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>SGPA: <strong style={{ color: "#fcd34d" }}>{sgpa}</strong></span>
        </div>
      </div>
    </div>
  );
}

// ─── Notices ─────────────────────────────────────────────────────────────────
function NoticesView() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Notices" sub={`${MOCK_NOTICES.length} active notices`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MOCK_NOTICES.map(n => {
          const cat = NOTICE_CATEGORY[n.category] || NOTICE_CATEGORY.general;
          const open = selected === n.id;
          return (
            <div key={n.id} style={{ ...S.card, padding: "18px 22px", cursor: "pointer", borderLeft: `3px solid ${cat.color}`, transition: "all 0.2s" }}
              onClick={() => setSelected(open ? null : n.id)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ ...S.badge, background: cat.bg, color: cat.color, textTransform: "capitalize" }}>{n.category}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{n.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{n.date}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                </div>
              </div>
              {open && (
                <p style={{ margin: "14px 0 0", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
                  {n.body}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reusable Components ──────────────────────────────────────────────────────
function StatCard({ icon, value, label, accent }) {
  return (
    <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${accent}22`, border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-1px" }}>{value}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", width: 80, height: 80, borderRadius: "50%", background: accent, opacity: 0.06, filter: "blur(20px)", pointerEvents: "none" }} />
    </div>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div>
      <h1 style={S.pageTitle}>{title}</h1>
      {sub && <p style={S.pageSub}>{sub}</p>}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: { display: "flex", minHeight: "100vh", background: "#0d0e1a", fontFamily: "'DM Sans',sans-serif", color: "#fff", overflow: "hidden" },
  sidebar: { background: "#10112a", borderRight: "1px solid rgba(99,102,241,0.15)", display: "flex", flexDirection: "column", padding: "20px 0", transition: "width 0.25s cubic-bezier(.4,0,.2,1)", overflow: "hidden", flexShrink: 0, minHeight: "100vh", position: "sticky", top: 0 },
  logo: { display: "flex", alignItems: "center", gap: 10, padding: "0 18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8, whiteSpace: "nowrap" },
  logoText: { fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "0 8px", flex: 1 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, transition: "all 0.15s", whiteSpace: "nowrap", width: "100%" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 },
  topbar: { display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,14,26,0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 },
  iconBtn: { background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 8, display: "flex", borderRadius: 8 },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 320 },
  searchInput: { background: "none", border: "none", outline: "none", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 13, width: "100%" },
  notifDot: { position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: "1.5px solid #0d0e1a" },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" },
  content: { padding: "28px 32px", flex: 1 },
  pageTitle: { fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" },
  pageSub: { color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "4px 0 0", fontWeight: 400 },
  datePill: { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 500 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px" },
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" },
  seeAll: { background: "none", border: "none", color: "#6366f1", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 },
  th: { textAlign: "left", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingRight: 12 },
  td: { padding: "12px 12px 12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
  badge: { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
};
