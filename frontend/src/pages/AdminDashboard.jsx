import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import CampusLogo from "../components/CampusLogo";
import API from "../api/api";

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard",  label: "Dashboard",       icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: "students",   label: "Manage Students", icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: "faculty",    label: "Manage Faculty",  icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: "courses",    label: "Courses",         icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
  { key: "notices",    label: "Notices",         icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { key: "results",    label: "Upload Results",  icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { key: "reports",    label: "Reports",         icon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
];

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const [active, setActive]       = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const firstName = (user?.name || "Admin").split(" ")[0];

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 230 : 64 }}>
        <div style={S.logo}>
          <CampusLogo height={sidebarOpen ? 48 : 30} />
        </div>
        <div style={{ padding: "8px 12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
          {sidebarOpen && <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase" }}>Admin Panel</span>}
        </div>
        <nav style={S.nav}>
          {NAV.map(({ key, label, icon: Icon }) => {
            const on = active === key;
            return (
              <button key={key} type="button" onClick={() => setActive(key)} style={{ ...S.navBtn, background: on ? "rgba(99,102,241,0.18)" : "transparent", color: on ? "#a5b4fc" : "rgba(255,255,255,0.55)", borderLeft: on ? "2px solid #6366f1" : "2px solid transparent", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
                <span style={{ flexShrink: 0, display: "flex" }}><Icon /></span>
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

      {/* Main */}
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
            <div style={S.avatar}>{firstName[0]?.toUpperCase()}</div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{firstName}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Administrator</p>
            </div>
          </div>
        </header>

        <div style={S.content}>
          {active === "dashboard" && <DashView token={token} />}
          {active === "students"  && <UsersView role="student" token={token} />}
          {active === "faculty"   && <UsersView role="faculty" token={token} />}
          {active === "courses"   && <CoursesView token={token} />}
          {active === "notices"   && <NoticesView token={token} />}
          {active === "results"   && <ResultsView token={token} />}
          {active === "reports"   && <ReportsView token={token} />}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashView({ token }) {
  const [stats, setStats] = useState({ students: 0, faculty: 0, courses: 0, notices: 0 });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get("/auth/users?role=student", h(token)).catch(() => ({ data: [] })),
      API.get("/auth/users?role=faculty", h(token)).catch(() => ({ data: [] })),
      API.get("/courses", h(token)).catch(() => ({ data: [] })),
      API.get("/notices", h(token)).catch(() => ({ data: [] })),
    ]).then(([students, faculty, courses, notices]) => {
      const s = Array.isArray(students.data) ? students.data : [];
      const f = Array.isArray(faculty.data) ? faculty.data : [];
      setStats({ students: s.length, faculty: f.length, courses: Array.isArray(courses.data) ? courses.data.length : 0, notices: Array.isArray(notices.data) ? notices.data.length : 0 });
      setRecentUsers([...s.slice(0, 3), ...f.slice(0, 2)]);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={S.pageTitle}>Admin Dashboard</h1>
        <p style={S.pageSub}>Welcome back! Here's what's happening on campus.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <StatCard icon="🎓" value={stats.students}  label="Total Students"  accent="#6366f1" />
        <StatCard icon="👨‍🏫" value={stats.faculty}   label="Total Faculty"   accent="#22c55e" />
        <StatCard icon="📚" value={stats.courses}   label="Active Courses"  accent="#f59e0b" />
        <StatCard icon="📢" value={stats.notices}   label="Active Notices"  accent="#8b5cf6" />
      </div>

      {recentUsers.length > 0 && (
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>Recent Users</span></div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Name","Email","Role","Branch / Dept","Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u._id}>
                  <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0" }}>{u.name}</td>
                  <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{u.email}</td>
                  <td style={S.td}><span style={{ ...S.badge, ...(u.role === "faculty" ? { background: "rgba(34,197,94,0.15)", color: "#86efac" } : { background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }) }}>{u.role}</span></td>
                  <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{u.branch || u.department || "—"}</td>
                  <td style={S.td}><span style={{ ...S.badge, background: u.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: u.isActive ? "#86efac" : "#fca5a5" }}>{u.isActive ? "Active" : "Inactive"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Users (Students or Faculty) ─────────────────────────────────────────────
function UsersView({ role, token }) {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    API.get(`/auth/users?role=${role}`, h(token))
      .then(r => { setUsers(Array.isArray(r.data) ? r.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [role, token]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id, current) => {
    setActionId(id);
    try {
      await API.put(`/auth/users/${id}/toggle-active`, {}, h(token));
      setMsg(`User ${current ? "deactivated" : "activated"} successfully`);
      load();
    } catch { setMsg("Failed to update user."); }
    setActionId(null);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const isStudent = role === "student";

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title={isStudent ? "Manage Students" : "Manage Faculty"} sub={`${users.length} ${role}s registered`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard icon={isStudent ? "🎓" : "👨‍🏫"} value={users.length} label={`Total ${role}s`} accent="#6366f1" />
        <StatCard icon="✅" value={users.filter(u => u.isActive).length} label="Active" accent="#22c55e" />
        <StatCard icon="🚫" value={users.filter(u => !u.isActive).length} label="Inactive" accent="#ef4444" />
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, color: "#86efac", fontSize: 13 }}>{msg}</div>}

      <div style={S.card}>
        <div style={{ marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search by name, email${isStudent ? ", roll number" : ""}...`} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        {filtered.length === 0
          ? <Empty message={`No ${role}s found.`} />
          : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", isStudent ? "Roll No" : "Designation", isStudent ? "Branch / Sem" : "Department", "Status", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0" }}>{u.name}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{u.email}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{isStudent ? (u.rollNumber || "—") : (u.designation || "—")}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{isStudent ? `${u.branch || "—"} / Sem ${u.semester || "—"}` : (u.department || "—")}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: u.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: u.isActive ? "#86efac" : "#fca5a5" }}>{u.isActive ? "Active" : "Inactive"}</span></td>
                    <td style={S.td}>
                      <button type="button" onClick={() => toggleActive(u._id, u.isActive)} disabled={actionId === u._id} style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${u.isActive ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, background: u.isActive ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: u.isActive ? "#fca5a5" : "#86efac", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        {actionId === u._id ? "..." : u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}

// ─── Courses ──────────────────────────────────────────────────────────────────
function CoursesView({ token }) {
  const [courses, setCourses]   = useState([]);
  const [faculty, setFaculty]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [msg, setMsg]           = useState("");
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", credits: 3, semester: "", branch: "", department: "", faculty: "" });

  const load = useCallback(() => {
    Promise.all([
      API.get("/courses", h(token)),
      API.get("/auth/users?role=faculty", h(token)).catch(() => ({ data: [] })),
    ]).then(([c, f]) => {
      setCourses(Array.isArray(c.data) ? c.data : []);
      setFaculty(Array.isArray(f.data) ? f.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ name: "", code: "", description: "", credits: 3, semester: "", branch: "", department: "", faculty: "" }); setEditId(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.semester || !form.branch || !form.department) {
      setMsg("Please fill all required fields."); return;
    }
    try {
      if (editId) {
        await API.put(`/courses/${editId}`, form, h(token));
        setMsg("Course updated!");
      } else {
        await API.post("/courses", form, h(token));
        setMsg("Course created!");
      }
      resetForm(); load();
    } catch (e) { setMsg(e.response?.data?.message || "Failed to save course."); }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, code: c.code, description: c.description || "", credits: c.credits, semester: c.semester, branch: c.branch, department: c.department, faculty: c.faculty?._id || "" });
    setEditId(c._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    setDeleting(id);
    try { await API.delete(`/courses/${id}`, h(token)); setMsg("Course deleted!"); load(); }
    catch { setMsg("Failed to delete."); }
    setDeleting(null);
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <PageHeader title="Courses" sub={`${courses.length} courses total`} />
        <button type="button" onClick={() => { resetForm(); setShowForm(true); }} style={S.primaryBtn}>+ New Course</button>
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, color: "#86efac", fontSize: 13 }}>{msg}</div>}

      {/* Create / Edit Form */}
      {showForm && (
        <div style={{ ...S.card, border: "1px solid rgba(99,102,241,0.3)" }}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>{editId ? "Edit Course" : "Create New Course"}</span>
            <button type="button" onClick={resetForm} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Course Name *", key: "name", placeholder: "e.g. Computer Networks" },
              { label: "Course Code *", key: "code", placeholder: "e.g. CS401" },
              { label: "Department *",  key: "department", placeholder: "e.g. CSE" },
              { label: "Branch *",      key: "branch", placeholder: "e.g. CSE" },
            ].map(f => (
              <div key={f.key}>
                <label style={S.label}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={S.input} />
              </div>
            ))}
            <div>
              <label style={S.label}>Semester *</label>
              <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} style={S.select}>
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Credits</label>
              <select value={form.credits} onChange={e => setForm(p => ({ ...p, credits: Number(e.target.value) }))} style={S.select}>
                {[1,2,3,4,5].map(c => <option key={c} value={c}>{c} Credits</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>Assign Faculty</label>
              <select value={form.faculty} onChange={e => setForm(p => ({ ...p, faculty: e.target.value }))} style={S.select}>
                <option value="">No faculty assigned</option>
                {faculty.map(f => <option key={f._id} value={f._id}>{f.name} — {f.department || "N/A"}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description..." rows={2} style={{ ...S.input, resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={handleSubmit} style={S.primaryBtn}>{editId ? "Update Course" : "Create Course"}</button>
            <button type="button" onClick={resetForm} style={S.secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

      {courses.length === 0
        ? <Empty message="No courses yet. Create your first course!" />
        : (
          <div style={S.card}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Course","Code","Semester","Branch","Faculty","Students","Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0" }}>{c.name}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{c.code}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Sem {c.semester}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{c.branch}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{c.faculty?.name || <span style={{ color: "rgba(255,255,255,0.25)" }}>Not assigned</span>}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{c.enrolledCount || 0}</td>
                    <td style={{ ...S.td, display: "flex", gap: 8 }}>
                      <button type="button" onClick={() => handleEdit(c)} style={{ padding: "4px 12px", borderRadius: 7, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Edit</button>
                      <button type="button" onClick={() => handleDelete(c._id)} disabled={deleting === c._id} style={{ padding: "4px 12px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                        {deleting === c._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

// ─── Notices ──────────────────────────────────────────────────────────────────
function NoticesView({ token }) {
  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg]           = useState("");
  const [form, setForm] = useState({ title: "", body: "", category: "general", targetRole: "all" });

  const load = useCallback(() => {
    API.get("/notices", h(token))
      .then(r => { setNotices(Array.isArray(r.data) ? r.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title || !form.body) { setMsg("Title and body are required."); return; }
    try {
      await API.post("/notices", form, h(token));
      setMsg("Notice posted!"); setForm({ title: "", body: "", category: "general", targetRole: "all" });
      setShowForm(false); load();
    } catch { setMsg("Failed to post notice."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    setDeleting(id);
    try { await API.delete(`/notices/${id}`, h(token)); setMsg("Notice deleted!"); load(); }
    catch { setMsg("Failed to delete."); }
    setDeleting(null);
  };

  const CAT_COLORS = { exam: "#fca5a5", fee: "#fcd34d", placement: "#a5b4fc", scholarship: "#86efac", event: "#fcd34d", general: "#d1d5db" };

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <PageHeader title="Notices" sub={`${notices.length} active notices`} />
        <button type="button" onClick={() => setShowForm(p => !p)} style={S.primaryBtn}>+ Post Notice</button>
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, color: "#86efac", fontSize: 13 }}>{msg}</div>}

      {showForm && (
        <div style={{ ...S.card, border: "1px solid rgba(99,102,241,0.3)" }}>
          <div style={S.cardHead}><span style={S.cardTitle}>Post New Notice</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={S.label}>Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notice title" style={S.input} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={S.label}>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={S.select}>
                  {["general","exam","fee","placement","scholarship","event"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Target Audience</label>
                <select value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} style={S.select}>
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>
            </div>
            <div>
              <label style={S.label}>Body *</label>
              <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Write the notice content..." rows={4} style={{ ...S.input, resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={handleCreate} style={S.primaryBtn}>Post Notice</button>
            <button type="button" onClick={() => setShowForm(false)} style={S.secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

      {notices.length === 0
        ? <Empty message="No notices yet. Post your first notice!" />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notices.map(n => {
              const color = CAT_COLORS[n.category] || "#d1d5db";
              return (
                <div key={n._id} style={{ ...S.card, padding: "16px 20px", borderLeft: `3px solid ${color}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <span style={{ ...S.badge, background: `${color}22`, color, textTransform: "capitalize" }}>{n.category}</span>
                      <span style={{ ...S.badge, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>{n.targetRole === "all" ? "Everyone" : n.targetRole}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{n.title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{new Date(n.createdAt).toLocaleDateString("en-IN")}</span>
                      <button type="button" onClick={() => handleDelete(n._id)} disabled={deleting === n._id} style={{ padding: "4px 12px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                        {deleting === n._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{n.body}</p>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

// ─── Upload Results ───────────────────────────────────────────────────────────
function ResultsView({ token }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState({ text: "", error: false });
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "", semester: "", internalMarks: "", externalMarks: "", maxMarks: 100, remarks: "" });

  useEffect(() => {
    Promise.all([
      API.get("/auth/users?role=student", h(token)).catch(() => ({ data: [] })),
      API.get("/courses", h(token)).catch(() => ({ data: [] })),
    ]).then(([s, c]) => {
      setStudents(Array.isArray(s.data) ? s.data : []);
      setCourses(Array.isArray(c.data) ? c.data : []);
      setLoading(false);
    });
  }, [token]);

  const handleSubmit = async () => {
    const { studentId, courseId, semester, internalMarks, externalMarks } = form;
    if (!studentId || !courseId || !semester || internalMarks === "" || externalMarks === "") {
      setMsg({ text: "All fields are required.", error: true }); return;
    }
    setSaving(true);
    try {
      await API.post("/results", { studentId, courseId, semester: Number(semester), internalMarks: Number(internalMarks), externalMarks: Number(externalMarks), maxMarks: Number(form.maxMarks), remarks: form.remarks }, h(token));
      setMsg({ text: "Result uploaded successfully!", error: false });
      setForm({ studentId: "", courseId: "", semester: "", internalMarks: "", externalMarks: "", maxMarks: 100, remarks: "" });
    } catch (e) { setMsg({ text: e.response?.data?.message || "Failed to upload.", error: true }); }
    setSaving(false);
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Upload Results" sub="Enter marks for students per course" />

      <div style={{ ...S.card, maxWidth: 600 }}>
        <div style={S.cardHead}><span style={S.cardTitle}>Enter Marks</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={S.label}>Student *</label>
            <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} style={S.select}>
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.rollNumber || s.email}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Course *</label>
            <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} style={S.select}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={S.label}>Semester *</label>
              <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} style={S.select}>
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Internal *</label>
              <input type="number" min="0" max="30" value={form.internalMarks} onChange={e => setForm(p => ({ ...p, internalMarks: e.target.value }))} placeholder="0–30" style={S.input} />
            </div>
            <div>
              <label style={S.label}>External *</label>
              <input type="number" min="0" max="70" value={form.externalMarks} onChange={e => setForm(p => ({ ...p, externalMarks: e.target.value }))} placeholder="0–70" style={S.input} />
            </div>
          </div>
          <div>
            <label style={S.label}>Remarks (optional)</label>
            <input value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} placeholder="e.g. Pass, Reappear, etc." style={S.input} />
          </div>
        </div>

        {/* Preview total */}
        {form.internalMarks !== "" && form.externalMarks !== "" && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(99,102,241,0.08)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.2)" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#a5b4fc" }}>
              Total: <strong>{Number(form.internalMarks) + Number(form.externalMarks)}/{form.maxMarks}</strong>
              &nbsp;·&nbsp; Percentage: <strong>{Math.round(((Number(form.internalMarks) + Number(form.externalMarks)) / form.maxMarks) * 100)}%</strong>
            </p>
          </div>
        )}

        {msg.text && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: msg.error ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", border: `1px solid ${msg.error ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 10, color: msg.error ? "#fca5a5" : "#86efac", fontSize: 13 }}>
            {msg.text}
          </div>
        )}

        <button type="button" onClick={handleSubmit} disabled={saving} style={{ ...S.primaryBtn, marginTop: 16, width: "100%" }}>
          {saving ? "Uploading..." : "Upload Result"}
        </button>
      </div>
    </div>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────
function ReportsView({ token }) {
  const [data, setData]     = useState({ students: [], courses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/auth/users?role=student", h(token)).catch(() => ({ data: [] })),
      API.get("/courses", h(token)).catch(() => ({ data: [] })),
    ]).then(([s, c]) => {
      setData({ students: Array.isArray(s.data) ? s.data : [], courses: Array.isArray(c.data) ? c.data : [] });
      setLoading(false);
    });
  }, [token]);

  if (loading) return <Loader />;

  // Group students by branch
  const byBranch = data.students.reduce((acc, s) => {
    const b = s.branch || "Unknown";
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  // Group courses by semester
  const bySem = data.courses.reduce((acc, c) => {
    const k = `Sem ${c.semester}`;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const maxBranch = Math.max(...Object.values(byBranch), 1);
  const maxSem    = Math.max(...Object.values(bySem), 1);

  const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Reports" sub="Campus statistics overview" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <StatCard icon="🎓" value={data.students.length} label="Total Students" accent="#6366f1" />
        <StatCard icon="📚" value={data.courses.length}  label="Total Courses"  accent="#f59e0b" />
        <StatCard icon="🏢" value={Object.keys(byBranch).length} label="Branches" accent="#22c55e" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Students per branch */}
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>Students per Branch</span></div>
          {Object.keys(byBranch).length === 0
            ? <Empty message="No student data yet." />
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(byBranch).map(([branch, count], i) => (
                  <div key={branch}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{branch}</span>
                      <span style={{ fontSize: 13, color: COLORS[i % COLORS.length], fontWeight: 700 }}>{count}</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(count / maxBranch) * 100}%`, background: COLORS[i % COLORS.length], borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Courses per semester */}
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>Courses per Semester</span></div>
          {Object.keys(bySem).length === 0
            ? <Empty message="No course data yet." />
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(bySem).sort().map(([sem, count], i) => (
                  <div key={sem}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{sem}</span>
                      <span style={{ fontSize: 13, color: COLORS[i % COLORS.length], fontWeight: 700 }}>{count} courses</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(count / maxSem) * 100}%`, background: COLORS[i % COLORS.length], borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* Branch breakdown table */}
      {data.students.length > 0 && (
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>Branch Breakdown</span></div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Branch","Students","% of Total","Active"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {Object.entries(byBranch).map(([branch, count]) => {
                const active = data.students.filter(s => s.branch === branch && s.isActive).length;
                return (
                  <tr key={branch}>
                    <td style={{ ...S.td, fontWeight: 600, color: "#e2e8f0" }}>{branch}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.6)" }}>{count}</td>
                    <td style={{ ...S.td, color: "rgba(255,255,255,0.5)" }}>{Math.round((count / data.students.length) * 100)}%</td>
                    <td style={{ ...S.td, color: "#86efac" }}>{active}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────
function StatCard({ icon, value, label, accent }) {
  return (
    <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 160, gap: 10 }}>
      <span style={{ fontSize: 36 }}>📭</span>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center" }}>{message}</p>
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
  avatar:      { width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 },
  content:     { padding: "28px 32px", flex: 1 },
  pageTitle:   { fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, margin: 0 },
  pageSub:     { color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "4px 0 0" },
  card:        { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px" },
  cardHead:    { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  cardTitle:   { fontSize: 15, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" },
  th:          { textAlign: "left", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.5px", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingRight: 12 },
  td:          { padding: "12px 12px 12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
  badge:       { display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  label:       { display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  input:       { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select:      { width: "100%", background: "#1a1b35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontFamily: "inherit", fontSize: 14, outline: "none", cursor: "pointer" },
  primaryBtn:  { padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  secondaryBtn:{ padding: "10px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
};
