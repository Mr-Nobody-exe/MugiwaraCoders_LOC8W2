import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem("hackx_token");
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authService.me();
        setUser(data);
      } catch {
        localStorage.removeItem("hackx_token");
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await authService.login({ email, password });
    localStorage.setItem("hackx_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    localStorage.setItem("hackx_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem("hackx_token");
    setUser(null);
  }, []);

  // Called after team join/create to refresh user.team
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.me();
      setUser(data);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
