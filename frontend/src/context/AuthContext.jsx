/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authAPI } from "../api/auth";

const AuthContext = createContext(null);

const normalizeUser = (value) => {
  if (!value) return null;

  return {
    ...value,
    id: value.id || value._id || null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("campus_token"));
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem("campus_token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await authAPI.me(token);
          if (res && res.user) {
            setUser(normalizeUser(res.user));
          } else {
            // Server responded but token is invalid — clear it
            clearSession();
          }
        } catch (err) {
          // Network error or backend not running
          // Don't logout — try to decode JWT locally to keep session
          console.warn("Token verify failed:", err?.message || err);
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            if (!isExpired) {
              // Token still valid — keep a minimal user object so app doesn't log out
              setUser({
                id: payload.id,
                role: payload.role || "student",
                name: "User",
                _fromCache: true,
              });
            } else {
              clearSession();
            }
          } catch {
            // Can't decode token — leave as loading resolved with no user
            clearSession();
          }
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [clearSession, token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      if (res.token) {
        localStorage.setItem("campus_token", res.token);
        setToken(res.token);
        setUser(normalizeUser(res.user));
        return { success: true, role: res.user.role };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Network error. Is the backend running?" };
    }
  };

  const register = async (data) => {
    try {
      const res = await authAPI.register(data);
      if (res.user) return { success: true };
      return { success: false, message: res.message || "Registration failed" };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Network error. Is the backend running?" };
    }
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
