import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import CampusLogo from "../components/CampusLogo";
import API from "../api/api";
import TimetableBoard from "../components/TimetableBoard";

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const NAV = [
  { key: "dashboard",   label: "Dashboard",         icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: "subjects",    label: "My Subjects",        icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { key: "timetable",   label: "Timetable",          icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="16" y1="14" x2="16" y2="18"/></svg> },
  { key: "attendance",  label: "Mark Attendance",    icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg> },
  { key: "assignments", label: "Assignments",        icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg> },
  { key: "students",    label: "Students List",      icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: "profile",     label: "Profile",            icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

export default function FacultyDashboard() {
  const { user, token, logout } = useAuth();
  const [active, setActive]         = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const displayName = user?.name?.trim() || "Faculty";
  const avatarLabel = displayName.charAt(0).toUpperCase() || "F";

  return (
    <div style={S.root}>
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 225 : 64 }}>
        <div style={S.logo}>
          <CampusLogo height={sidebarOpen ? 40 : 26} />
        </div>
        <div style={{ padding: "6px 12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 6 }}>
          {sidebarOpen && <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase" }}>Faculty Panel</span>}
        </div>
        <nav style={S.nav}>
          {NAV.map(({ key, label, icon }) => {
            const on = active === key;
            return (
              <button key={key} type="button" onClick={() => setActive(key)} style={{ ...S.navBtn, background: on ? "rgba(99,102,241,0.18)" : "transparent", color: on ? "#a5b4fc" : "rgba(255,255,255,0.55)", borderLeft: on ? "2px solid #6366f1" : "2px solid transparent", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
                <span style={{ flexShrink: 0, display: "flex" }}>{icon()}</span>
                {sidebarOpen && <span style={{ fontSize: 13 }}>{label}</span>}
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={logout} style={{ ...S.navBtn, marginTop: "auto", color: "rgba(239,68,68,0.8)", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {sidebarOpen && <span style={{ fontSize: 13 }}>Logout</span>}
        </button>
      </aside>

      <div style={S.main}>
        <header style={S.topbar}>
          <button type="button" onClick={() => setSidebarOpen(p => !p)} style={S.iconBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={S.searchBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search..." style={S.searchInput} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <button type="button" onClick={() => setActive("profile")} style={{ ...S.avatar, cursor: "pointer", border: active === "profile" ? "2px solid #6366f1" : "2px solid transparent" }}>
              {avatarLabel}
            </button>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{displayName}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{user?.department || "Faculty"}</p>
            </div>
          </div>
        </header>

        <div style={S.content}>
          {active === "dashboard"   && <DashView user={user} token={token} setActive={setActive} />}
          {active === "subjects"    && <SubjectsView token={token} />}
          {active === "timetable"   && <TimetableView token={token} />}
          {active === "attendance"  && <AttendanceView token={token} />}
          {active === "assignments" && <AssignmentsView token={token} />}
          {active === "students"    && <StudentsView token={token} />}
          {active === "profile"     && <ProfileView user={user} token={token} />}
        </div>
      </div>
    </div>
  );
}

const getUserId = (user) => String(user?.id || user?._id || "");

const isFacultyCourse = (course, user) => {
  const facultyId = String(course?.faculty?._id || course?.faculty || "");
  const userId = getUserId(user);

  if (!facultyId || !userId) {
    return false;
  }

  return facultyId === userId;
};

function TimetableView({ token }) {
  const [data, setData] = useState({ entries: [], settings: null, generatedAt: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/timetable/faculty", h(token))
      .then((response) => {
        setData({
          entries: Array.isArray(response.data?.entries) ? response.data.entries : [],
          settings: response.data?.settings || null,
          generatedAt: response.data?.generatedAt || null,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader />;

  return (
    <TimetableBoard
      title="Teaching Timetable"
      subtitle="Your scheduled classes across the week"
      entries={data.entries}
      settings={data.settings}
      generatedAt={data.generatedAt}
      emptyMessage="No teaching timetable has been generated yet."
    />
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashView({ user, token, setActive }) {
  const [courses, setCourses]       = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/courses", h(token)).catch(() => ({ data: [] })),
      API.get("/assignments/my-faculty", h(token)).catch(() => ({ data: [] })),
    ]).then(([c, a]) => {
      setCourses(Array.isArray(c.data) ? c.data.filter((course) => isFacultyCourse(course, user)) : []);
      setAssignments(Array.isArray(a.data) ? a.data : []);
      setLoading(false);
    });
  }, [token, user]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  const uniqueStudentIds = new Set();
  courses.forEach((course) => {
    if (Array.isArray(course.enrolledStudents) && course.enrolledStudents.length > 0) {
      course.enrolledStudents.forEach((student) => {
        uniqueStudentIds.add(String(student?._id || student));
      });
    }
  });
  const totalStudents = uniqueStudentIds.size > 0
    ? uniqueStudentIds.size
    : courses.reduce((s, c) => s + (c.enrolledCount || 0), 0);
  const pendingGrading = assignments.reduce((s, a) => s + (a.submissions?.filter(sub => sub.status === "submitted").length || 0), 0);

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={S.pageTitle}>{greeting}, {user?.name?.trim() || "Faculty"} 👋</h1>
          <p style={S.pageSub}>Department: <strong>{user?.department || "—"}</strong> · {user?.designation || "Faculty"}</p>
        </div>
        <span style={S.datePill}>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard icon="📚" value={courses.length}   label="My Subjects"       accent="#6366f1" onClick={() => setActive("subjects")} />
        <StatCard icon="🎓" value={totalStudents}     label="Total Students"   accent="#6366f1" onClick={() => setActive("students")} />
        <StatCard icon="📝" value={pendingGrading}    label="Pending Grading"  accent="#f59e0b" onClick={() => setActive("assignments")} />
      </div>

      {courses.length > 0 && (
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>My Subjects</span>
            <button type="button" style={S.seeAll} onClick={() => setActive("subjects")}>View All →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            {courses.slice(0, 4).map((c, i) => {
              const colors = ["#6366f1","#8b5cf6","#f59e0b","#06b6d4"];
              return (
                <div key={c._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16, borderTop: `3px solid ${colors[i % colors.length]}` }}>
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{c.name}</p>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.code} · Sem {c.semester} · {c.branch}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>👥 {c.enrolledCount || 0} students</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {assignments.length > 0 && (
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Recent Assignments</span>
            <button type="button" style={S.seeAll} onClick={() => setActive("assignments")}>View All →</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Title","Course","Due Date","Submissions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {assignments.slice(0, 4).map(a => (
                <tr key={a._id}>
                  <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{a.title}</td>
                  <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{a.course?.name}</td>
                  <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{new Date(a.dueDate).toLocaleDateString("en-IN")}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>
                    <span style={{ ...S.badge, background: "rgba(34,197,94,0.15)", color: "#86efac" }}>{a.submissions?.length || 0} submitted</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {courses.length === 0 && <Empty message="No subjects assigned yet. Contact admin to get courses assigned to you." />}
    </div>
  );
}

// ─── My Subjects ──────────────────────────────────────────────────────────────
function SubjectsView({ token }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/courses", h(token))
      .then(r => {
        const all = Array.isArray(r.data) ? r.data : [];
        setCourses(all.filter((course) => isFacultyCourse(course, user)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, user]);

  const colors = ["#6366f1","#8b5cf6","#f59e0b","#06b6d4","#ec4899","#22c55e"];

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="My Subjects" sub={`${courses.length} courses assigned to you`} />
      {courses.length === 0
        ? <Empty message="No subjects assigned. Ask admin to assign courses to you." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {courses.map((c, i) => (
              <div key={c._id} style={{ ...S.card, borderTop: `3px solid ${colors[i % colors.length]}`, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{c.name}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{c.code} · {c.credits} Credits</p>
                  </div>
                  <span style={{ ...S.badge, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>Sem {c.semester}</span>
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>🏢 {c.department} · {c.branch}</p>
                <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>👥 {c.enrolledCount || 0} students enrolled</p>
                {c.description && <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{c.description}</p>}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ─── Mark Attendance ──────────────────────────────────────────────────────────
function AttendanceView({ token }) {
  const { user } = useAuth();
  const [courses, setCourses]     = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents]   = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate]           = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ text: "", error: false });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    API.get("/courses", h(token))
      .then(r => {
        const all = Array.isArray(r.data) ? r.data : [];
        setCourses(all.filter((course) => isFacultyCourse(course, user)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, user]);

  const loadStudents = async (courseId) => {
    setSelectedCourse(courseId);
    setStudents([]);
    setAttendance({});
    if (!courseId) return;
    try {
      const res = await API.get(`/courses/${courseId}`, h(token));
      const enrolled = res.data?.enrolledStudents || [];
      setStudents(enrolled);
      const init = {};
      enrolled.forEach(s => { init[s._id] = "present"; });
      setAttendance(init);
    } catch { setMsg({ text: "Failed to load students.", error: true }); }
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !date) { setMsg({ text: "Select a course and date.", error: true }); return; }
    if (students.length === 0) { setMsg({ text: "No students enrolled in this course.", error: true }); return; }
    setSaving(true);
    try {
      await API.post("/attendance/mark", {
        courseId: selectedCourse,
        date,
        records: students.map(s => ({ studentId: s._id, status: attendance[s._id] || "absent" })),
      }, h(token));
      setMsg({ text: "Attendance marked successfully!", error: false });
    } catch (e) {
      setMsg({ text: e.response?.data?.message || "Failed to save.", error: true });
    }
    setSaving(false);
  };

  if (loading) return <Loader />;

  const present = Object.values(attendance).filter(v => v === "present").length;
  const absent  = Object.values(attendance).filter(v => v === "absent").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Mark Attendance" sub="Select a course and mark attendance for today" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 560 }}>
        <div>
          <label style={S.label}>Select Course *</label>
          <select value={selectedCourse} onChange={e => loadStudents(e.target.value)} style={S.select}>
            <option value="">Choose course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>Date *</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={S.input} />
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: "10px 16px", background: msg.error ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", border: `1px solid ${msg.error ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 10, color: msg.error ? "#fca5a5" : "#86efac", fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      {students.length > 0 && (
        <>
          {/* Summary pills */}
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ ...S.badge, background: "rgba(34,197,94,0.15)", color: "#86efac", fontSize: 13, padding: "6px 14px" }}>✅ Present: {present}</span>
            <span style={{ ...S.badge, background: "rgba(239,68,68,0.15)", color: "#fca5a5", fontSize: 13, padding: "6px 14px" }}>❌ Absent: {absent}</span>
            <span style={{ ...S.badge, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 13, padding: "6px 14px" }}>Total: {students.length}</span>
          </div>

          {/* Mark all buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => { const a = {}; students.forEach(s => { a[s._id] = "present"; }); setAttendance(a); }} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)", color: "#86efac", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Mark All Present</button>
            <button type="button" onClick={() => { const a = {}; students.forEach(s => { a[s._id] = "absent"; }); setAttendance(a); }} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Mark All Absent</button>
          </div>

          <div style={S.card}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Student","Roll No","Status"].map(hd => <th key={hd} style={S.th}>{hd}</th>)}</tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{s.name}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{s.rollNumber || "—"}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["present","absent","late"].map(status => (
                          <button key={status} type="button" onClick={() => setAttendance(p => ({ ...p, [s._id]: status }))} style={{
                            padding: "4px 12px", borderRadius: 20, border: "1px solid", fontFamily: "inherit", fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                            borderColor: attendance[s._id] === status ? (status === "present" ? "#22c55e" : status === "absent" ? "#ef4444" : "#f59e0b") : "rgba(255,255,255,0.1)",
                            background: attendance[s._id] === status ? (status === "present" ? "rgba(34,197,94,0.2)" : status === "absent" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)") : "transparent",
                            color: attendance[s._id] === status ? (status === "present" ? "#86efac" : status === "absent" ? "#fca5a5" : "#fcd34d") : "rgba(255,255,255,0.4)",
                          }}>{status}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={handleSubmit} disabled={saving} style={{ ...S.primaryBtn, alignSelf: "flex-start", padding: "11px 28px" }}>
            {saving ? "Saving..." : "Submit Attendance"}
          </button>
        </>
      )}

      {selectedCourse && students.length === 0 && !loading && (
        <Empty message="No students enrolled in this course yet." />
      )}
    </div>
  );
}

// ─── Assignments ──────────────────────────────────────────────────────────────
function AssignmentsView({ token }) {
  const { user } = useAuth();
  const [courses, setCourses]     = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [grading, setGrading]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState("");
  const [form, setForm] = useState({ title: "", description: "", courseId: "", dueDate: "", totalMarks: 20 });
  const [gradeForm, setGradeForm] = useState({ marks: "", feedback: "" });

  const load = useCallback(() => {
    Promise.all([
      API.get("/courses", h(token)).catch(() => ({ data: [] })),
      API.get("/assignments/my-faculty", h(token)).catch(() => ({ data: [] })),
    ]).then(([c, a]) => {
      const allCourses = Array.isArray(c.data) ? c.data : [];
      setCourses(allCourses.filter((course) => isFacultyCourse(course, user)));
      setAssignments(Array.isArray(a.data) ? a.data : []);
      setLoading(false);
    });
  }, [token, user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title || !form.courseId || !form.dueDate) { setMsg("Title, course and due date are required."); return; }
    try {
      await API.post("/assignments", form, h(token));
      setMsg("Assignment created!"); setShowForm(false);
      setForm({ title: "", description: "", courseId: "", dueDate: "", totalMarks: 20 });
      load();
    } catch (e) { setMsg(e.response?.data?.message || "Failed to create."); }
  };

  const handleGrade = async (assignmentId, studentId) => {
    if (gradeForm.marks === "") { setMsg("Enter marks first."); return; }
    try {
      await API.put(`/assignments/${assignmentId}/grade/${studentId}`, gradeForm, h(token));
      setMsg("Graded successfully!"); setGrading(null);
      setGradeForm({ marks: "", feedback: "" });
      load();
    } catch { setMsg("Failed to grade."); }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <PageHeader title="Assignments" sub={`${assignments.length} total assignments`} />
        <button type="button" onClick={() => setShowForm(p => !p)} style={S.primaryBtn}>+ New Assignment</button>
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, color: "#86efac", fontSize: 13 }}>{msg}</div>}

      {showForm && (
        <div style={{ ...S.card, border: "1px solid rgba(34,197,94,0.3)" }}>
          <div style={S.cardHead}><span style={S.cardTitle}>Create Assignment</span><button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>✕</button></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Assignment title" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Course *</label>
              <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} style={S.select}>
                <option value="">Select course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Due Date *</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} style={S.input} />
            </div>
            <div>
              <label style={S.label}>Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: Number(e.target.value) }))} style={S.input} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description..." rows={2} style={{ ...S.input, resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={handleCreate} style={S.primaryBtn}>Create Assignment</button>
            <button type="button" onClick={() => setShowForm(false)} style={S.secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

      {assignments.length === 0
        ? <Empty message="No assignments created yet. Create your first one!" />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assignments.map(a => {
              const submitted = a.submissions?.filter(s => s.status !== "graded") || [];
              const graded    = a.submissions?.filter(s => s.status === "graded") || [];
              return (
                <div key={a._id} style={{ ...S.card, padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{a.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                        {a.course?.name} · Due: {new Date(a.dueDate).toLocaleDateString("en-IN")} · {a.totalMarks} marks
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ ...S.badge, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{submitted.length} pending</span>
                      <span style={{ ...S.badge, background: "rgba(34,197,94,0.15)", color: "#86efac" }}>{graded.length} graded</span>
                    </div>
                  </div>

                  {a.submissions?.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Submissions</p>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{["Student","Submitted","Marks","Action"].map(hd => <th key={hd} style={S.th}>{hd}</th>)}</tr></thead>
                        <tbody>
                          {a.submissions.map(sub => (
                            <tr key={sub._id}>
                              <td style={{ ...S.td, color: "#e2e8f0", fontSize: 13 }}>{sub.student?.name || "Student"}</td>
                              <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{new Date(sub.submittedAt).toLocaleDateString("en-IN")}</td>
                              <td style={{ ...S.td, fontSize: 13 }}>
                                {sub.marks != null
                                  ? <span style={{ color: "#86efac", fontWeight: 700 }}>{sub.marks}/{a.totalMarks}</span>
                                  : <span style={{ color: "rgba(255,255,255,0.25)" }}>Not graded</span>}
                              </td>
                              <td style={S.td}>
                                {grading === `${a._id}-${sub.student?._id}` ? (
                                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input type="number" min="0" max={a.totalMarks} placeholder="Marks" value={gradeForm.marks} onChange={e => setGradeForm(p => ({ ...p, marks: e.target.value }))} style={{ width: 70, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", color: "#fff", fontFamily: "inherit", fontSize: 12, outline: "none" }} />
                                    <input placeholder="Feedback" value={gradeForm.feedback} onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", color: "#fff", fontFamily: "inherit", fontSize: 12, outline: "none" }} />
                                    <button type="button" onClick={() => handleGrade(a._id, sub.student?._id)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#22c55e", color: "#fff", fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Save</button>
                                    <button type="button" onClick={() => setGrading(null)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>✕</button>
                                  </div>
                                ) : (
                                  <button type="button" onClick={() => { setGrading(`${a._id}-${sub.student?._id}`); setGradeForm({ marks: sub.marks || "", feedback: sub.feedback || "" }); }} style={{ padding: "4px 12px", borderRadius: 7, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)", color: "#86efac", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                                    {sub.marks != null ? "Re-grade" : "Grade"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

// ─── Students List ────────────────────────────────────────────────────────────
function StudentsView({ token }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const getStudentKey = (student) => {
    if (!student) return "";
    return String(student._id || student.id || student.email || "").trim();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const coursesRes = await API.get("/courses", h(token));
        const allCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        const facultyCourses = allCourses.filter((course) => isFacultyCourse(course, user));
        setCourses(facultyCourses);

        if (facultyCourses.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }

        const details = await Promise.all(
          facultyCourses.map(c =>
            API.get(`/courses/${c._id}`, h(token))
              .then(r => r.data)
              .catch(() => ({ _id: c._id, name: c.name, enrolledStudents: [] }))
          )
        );

        const byStudentId = new Map();
        details.forEach(course => {
          const courseId = String(course?._id || "");
          const enrolled = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
          enrolled.forEach(s => {
            const studentKey = getStudentKey(s);
            if (!studentKey) return;
            const existing = byStudentId.get(studentKey) || {
              ...s,
              courseIds: [],
              courseNames: [],
            };
            if (!existing.courseIds.includes(courseId)) {
              existing.courseIds.push(courseId);
              existing.courseNames.push(course.name || "Course");
            }
            byStudentId.set(studentKey, existing);
          });
        });

        setStudents(Array.from(byStudentId.values()).sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      } catch {
        setCourses([]);
        setStudents([]);
      }
      setLoading(false);
    };

    loadData();
  }, [token, user]);

  const filteredStudents = selectedCourse
    ? students.filter(s => s.courseIds.includes(selectedCourse))
    : students;

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Students List" sub="View all enrolled students across your subjects" />

      <div style={{ maxWidth: 400 }}>
        <label style={S.label}>Filter By Course (Optional)</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={S.select}>
          <option value="">All your courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code}) — {c.enrolledCount || 0} students</option>)}
        </select>
      </div>

      {filteredStudents.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            <StatCard icon="🎓" value={filteredStudents.length} label="Total enrolled" accent="#6366f1" />
            <StatCard icon="✅" value={filteredStudents.filter(s => s.isActive).length} label="Active" accent="#6366f1" />
            <StatCard icon="🚫" value={filteredStudents.filter(s => !s.isActive).length} label="Inactive" accent="#ef4444" />
          </div>

          <div style={S.card}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Name","Email","Roll No","Branch","Semester","Enrolled In","Status"].map(hd => <th key={hd} style={S.th}>{hd}</th>)}</tr></thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s._id}>
                    <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0", fontSize: 13, whiteSpace: "nowrap" }}>{s.name}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{s.email}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{s.rollNumber || "—"}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{s.branch || "—"}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{s.semester ? `Sem ${s.semester}` : "—"}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{(s.courseNames || []).join(", ") || "—"}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: s.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: s.isActive ? "#86efac" : "#fca5a5" }}>{s.isActive ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {students.length === 0 && (
        <Empty message="No students are enrolled in your assigned courses yet." />
      )}

      {students.length > 0 && selectedCourse && filteredStudents.length === 0 && (
        <Empty message="No students found for this selected course." />
      )}
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileView({ user, token }) {
  const [form, setForm]   = useState({ name: user?.name || "", email: user?.email || "", department: user?.department || "", designation: user?.designation || "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]     = useState({ text: "", error: false });

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put("/auth/profile", form, h(token));
      setMsg({ text: "Profile updated successfully!", error: false });
    } catch (e) {
      setMsg({ text: e.response?.data?.message || "Failed to update.", error: true });
    }
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      <PageHeader title="My Profile" sub="View and update your information" />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff" }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>{user?.name}</p>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{user?.email}</p>
          <span style={{ ...S.badge, background: "rgba(99,102,241,0.15)", color: "#a5b4fc", marginTop: 6, display: "inline-block" }}>Faculty</span>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardHead}><span style={S.cardTitle}>Edit Information</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Full Name",    key: "name",        placeholder: "Your full name" },
            { label: "Email",        key: "email",       placeholder: "you@college.edu" },
            { label: "Department",   key: "department",  placeholder: "e.g. CSE" },
            { label: "Designation",  key: "designation", placeholder: "e.g. Assistant Professor" },
          ].map(f => (
            <div key={f.key}>
              <label style={S.label}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={S.input} />
            </div>
          ))}
        </div>
        {msg.text && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: msg.error ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", border: `1px solid ${msg.error ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 10, color: msg.error ? "#fca5a5" : "#86efac", fontSize: 13 }}>
            {msg.text}
          </div>
        )}
        <button type="button" onClick={handleSave} disabled={saving} style={{ ...S.primaryBtn, marginTop: 20, width: "100%" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
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
function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
      <div style={{ width: 24, height: 24, border: "2px solid rgba(99,102,241,0.3)", borderTop: "2px solid #6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading...
    </div>
  );
}
function Empty({ message }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12 }}>
      <span style={{ fontSize: 40 }}>📭</span>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root:        { display: "flex", minHeight: "100vh", background: "#0d0e1a", fontFamily: "'DM Sans',sans-serif", color: "#fff", overflow: "hidden" },
  sidebar:     { background: "#10112a", borderRight: "1px solid rgba(99,102,241,0.15)", display: "flex", flexDirection: "column", padding: "20px 0", transition: "width 0.25s cubic-bezier(.4,0,.2,1)", overflow: "hidden", flexShrink: 0, minHeight: "100vh", position: "sticky", top: 0 },
  logo:        { display: "flex", alignItems: "center", gap: 10, padding: "0 18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4, whiteSpace: "nowrap" },
  nav:         { display: "flex", flexDirection: "column", gap: 2, padding: "0 8px", flex: 1 },
  navBtn:      { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, transition: "all 0.15s", whiteSpace: "nowrap", width: "100%", textAlign: "left" },
  main:        { flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 },
  topbar:      { display: "flex", alignItems: "center", gap: 16, padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,14,26,0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 },
  iconBtn:     { background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 8, display: "flex", borderRadius: 8 },
  searchBox:   { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", flex: 1, maxWidth: 320 },
  searchInput: { background: "none", border: "none", outline: "none", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 13, width: "100%" },
  avatar:      { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0, border: "2px solid transparent", transition: "border 0.2s" },
  content:     { padding: "28px 32px", flex: 1 },
  pageTitle:   { fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, margin: 0 },
  pageSub:     { color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "4px 0 0" },
  datePill:    { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", borderRadius: 20, padding: "6px 14px", fontSize: 12 },
  card:        { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px" },
  cardHead:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  cardTitle:   { fontSize: 15, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" },
  seeAll:      { background: "none", border: "none", color: "#6366f1", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 },
  th:          { textAlign: "left", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingRight: 12 },
  td:          { padding: "12px 12px 12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
  badge:       { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  label:       { display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  input:       { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select:      { width: "100%", background: "#1a1b35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", cursor: "pointer" },
  primaryBtn:  { padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  secondaryBtn:{ padding: "10px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
};
