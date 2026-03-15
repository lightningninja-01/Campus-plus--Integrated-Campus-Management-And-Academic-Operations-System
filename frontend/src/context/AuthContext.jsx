import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("campus_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const verifyToken = async () => {
    if (token) {
      try {
        const res = await authAPI.me(token);
        if (res && res.user) {
          setUser(res.user);
        } else {
          // only logout if token is actually invalid (401)
          setUser(null);
          localStorage.removeItem("campus_token");
          setToken(null);
        }
      } catch (err) {
        // network error — don't logout, just set loading false
        // so user stays logged in even if backend is briefly down
        console.error("Token verify failed:", err);
      }
    }
    setLoading(false);
  };
  verifyToken();
}, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.token) {
      localStorage.setItem("campus_token", res.token);
      setToken(res.token);
      setUser(res.user);
      return { success: true, role: res.user.role };
    }
    return { success: false, message: res.message };
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.user) {
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const logout = () => {
    localStorage.removeItem("campus_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);