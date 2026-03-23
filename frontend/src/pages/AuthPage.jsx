import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CampusLogo from "../components/CampusLogo";

const ROLES = [
  { value: "student", label: "Student", icon: "🎓" },
  { value: "faculty", label: "Faculty", icon: "👨‍🏫" },
  { value: "admin", label: "Admin", icon: "🛡️" },
];

const BRANCHES = ["CSE", "AI/ML", "Data Science", "Cyber Security", "Full Stack Development", "UI/UX Design", "Cloud Computing", "Robotics"];

export default function AuthPage({ onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    semester: "",
    branch: "",
    section: "",
    school: "",
    rollNumber: "",
    department: "",
    designation: "",
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const res = await login(form.email, form.password);
      if (res.success) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => onSuccess?.(res.role), 800);
      } else {
        setError(res.message || "Login failed");
      }
    } else {
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "student",
        semester: Number(form.semester),
        branch: form.branch,
        section: form.section,
        school: form.school,
        rollNumber: form.rollNumber,
      };
      const res = await register(payload);
      if (res.success) {
        setSuccess("Account created! Please login.");
        setTimeout(() => setMode("login"), 1200);
      } else {
        setError(res.message || "Registration failed");
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-root">
      {/* Animated background */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="auth-container">
        {/* Left panel - branding */}
        <div className="auth-left">
          <div className="brand">
            <CampusLogo height={44} />
          </div>
          <p className="brand-tagline">Your complete campus management ecosystem</p>

          <div className="feature-list">
            {[
              { icon: "📚", text: "Track courses & assignments" },
              { icon: "📊", text: "Monitor attendance in real-time" },
              { icon: "📢", text: "Stay updated with notices" },
              { icon: "🏆", text: "View results & performance" },
            ].map((f, i) => (
              <div key={i} className="feature-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="auth-illustration">
            <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="40" width="260" height="140" rx="12" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>
              <rect x="36" y="60" width="80" height="8" rx="4" fill="rgba(99,102,241,0.4)"/>
              <rect x="36" y="76" width="120" height="6" rx="3" fill="rgba(99,102,241,0.2)"/>
              <rect x="36" y="100" width="60" height="48" rx="8" fill="rgba(99,102,241,0.25)"/>
              <rect x="106" y="100" width="60" height="48" rx="8" fill="rgba(139,92,246,0.25)"/>
              <rect x="176" y="100" width="90" height="48" rx="8" fill="rgba(168,85,247,0.2)"/>
              <rect x="44" y="110" width="20" height="20" rx="10" fill="rgba(99,102,241,0.6)"/>
              <rect x="44" y="134" width="44" height="4" rx="2" fill="rgba(99,102,241,0.3)"/>
              <rect x="114" y="110" width="20" height="20" rx="10" fill="rgba(139,92,246,0.6)"/>
              <rect x="114" y="134" width="44" height="4" rx="2" fill="rgba(139,92,246,0.3)"/>
            </svg>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="auth-right">
          <div className="form-card">
            {/* Tab switcher */}
            <div className="tab-switcher">
              <button
                className={`tab ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              >
                Sign In
              </button>
              <button
                className={`tab ${mode === "register" ? "active" : ""}`}
                onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              >
                Register
              </button>
              <div className={`tab-indicator ${mode === "register" ? "right" : ""}`} />
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === "register" && (
                <>
                  <div className="field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Registration Type</label>
                    <div className="student-only-note">
                      <span className="student-only-icon">🎓</span>
                      <div>
                        <strong>Student Registration</strong>
                        <p>For faculty/admin access, please contact the admin for your credentials.</p>
                      </div>
                    </div>
                  </div>

                  <div className="role-fields">
                    <div className="field-row">
                      <div className="field">
                        <label>Roll Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 21CSE001"
                          value={form.rollNumber}
                          onChange={(e) => update("rollNumber", e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Semester</label>
                        <select value={form.semester} onChange={(e) => update("semester", e.target.value)}>
                          <option value="">Select</option>
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}th Sem</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Branch / Specialization</label>
                      <select value={form.branch} onChange={(e) => update("branch", e.target.value)}>
                        <option value="">Select branch</option>
                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Section</label>
                        <select value={form.section} onChange={(e) => update("section", e.target.value)}>
                          <option value="">Select</option>
                          {["A","B","C","D","E","F","G"].map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label>School</label>
                        <select value={form.school} onChange={(e) => update("school", e.target.value)}>
                          <option value="">Select</option>
                          {["SOET","SOMC","SOAD","SOLS","SOAS"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
              </div>

              {mode === "register" && (
                <div className="field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              )}

              {error && <div className="alert error">{error}</div>}
              {success && <div className="alert success">{success}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span className="spinner" />
                ) : mode === "login" ? (
                  "Sign In →"
                ) : (
                  "Create Account →"
                )}
              </button>

              {mode === "login" && (
                <p className="forgot">
                  <a href="#">Forgot password?</a>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          background: #0d0e1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Animated orbs */
        .bg-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .orb-1 { width: 500px; height: 500px; background: #6366f1; top: -100px; left: -100px; animation-duration: 14s; }
        .orb-2 { width: 400px; height: 400px; background: #8b5cf6; bottom: -80px; right: -80px; animation-duration: 10s; animation-delay: -4s; }
        .orb-3 { width: 300px; height: 300px; background: #4f46e5; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-duration: 16s; animation-delay: -8s; }
        @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,40px) scale(1.1); } }

        .auth-container {
          position: relative;
          z-index: 1;
          display: flex;
          width: min(960px, 95vw);
          min-height: 580px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(99,102,241,0.2);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
        }

        /* LEFT PANEL */
        .auth-left {
          flex: 1.1;
          background: linear-gradient(135deg, #13142a 0%, #1a1b35 50%, #131428 100%);
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          border-right: 1px solid rgba(99,102,241,0.15);
        }

        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-icon { font-size: 32px; }
        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .brand-name span { color: #6366f1; }
        .brand-tagline { color: rgba(255,255,255,0.45); font-size: 14px; line-height: 1.5; }

        .feature-list { display: flex; flex-direction: column; gap: 12px; }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .feature-icon { font-size: 18px; }
        .auth-illustration { opacity: 0.7; margin-top: auto; }
        .auth-illustration svg { width: 100%; }

        /* RIGHT PANEL */
        .auth-right {
          flex: 1;
          background: #0f1022;
          padding: 40px 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-card { width: 100%; max-width: 360px; }

        .tab-switcher {
          position: relative;
          display: flex;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
        }
        .tab {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          z-index: 1;
          transition: color 0.2s;
          border-radius: 8px;
        }
        .tab.active { color: #fff; }
        .tab-indicator {
          position: absolute;
          top: 4px;
          left: 4px;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          transition: transform 0.25s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .tab-indicator.right { transform: translateX(calc(100% + 0px)); }

        .auth-form { display: flex; flex-direction: column; gap: 14px; }

        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .field input, .field select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
        }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .field input:focus, .field select:focus {
          border-color: #6366f1;
          background: rgba(99,102,241,0.08);
        }
        .field select { cursor: pointer; }
        .field select option { background: #1a1b35; }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .student-only-note {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 12px;
          color: rgba(255,255,255,0.78);
        }
        .student-only-icon {
          font-size: 20px;
          line-height: 1;
        }
        .student-only-note strong {
          display: block;
          font-size: 13px;
          color: #fff;
          margin-bottom: 2px;
        }
        .student-only-note p {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          line-height: 1.5;
        }

        .role-fields { display: flex; flex-direction: column; gap: 14px; }

        .alert {
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
        }
        .alert.error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
        .alert.success { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); color: #86efac; }

        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(99,102,241,0.45); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .forgot { text-align: center; margin-top: 4px; }
        .forgot a { color: rgba(99,102,241,0.8); font-size: 13px; text-decoration: none; }
        .forgot a:hover { color: #6366f1; }

        @media (max-width: 640px) {
          .auth-left { display: none; }
          .auth-right { padding: 32px 24px; }
          .auth-container { border-radius: 16px; }
        }
      `}</style>
    </div>
  );
}
