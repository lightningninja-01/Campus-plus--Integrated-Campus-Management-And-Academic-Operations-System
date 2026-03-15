import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";

// Google Fonts loader
const loadFonts = () => {
  const link = document.createElement("link");
  link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
};
loadFonts();

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0d0e1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "DM Sans, sans-serif",
        color: "rgba(255,255,255,0.5)"
      }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(99,102,241,0.2)",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <p style={{ fontSize: 14 }}>Loading Campus+...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <AuthPage onSuccess={() => window.location.reload()} />;
  }

  // Role-based routing
  if (user.role === "student") return <StudentDashboard />;

  // Faculty and Admin dashboards — coming soon
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0e1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 12,
      fontFamily: "DM Sans, sans-serif",
      color: "#fff"
    }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <p style={{ fontSize: 22, fontWeight: 700 }}>Welcome, {user.name}! 👋</p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
        <span style={{ color: "#6366f1", fontWeight: 600, textTransform: "capitalize" }}>{user.role}</span> dashboard coming soon...
      </p>
    </div>
  );
}
