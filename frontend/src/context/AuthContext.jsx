/**
 * AuthContext.jsx
 * Global auth state. Wrap <App> with <AuthProvider>.
 * Reads token from localStorage on mount, fetches /me to hydrate user.
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

// ── MOCK USER — remove once backend is ready ──
const MOCK_USERS = {
  participant: { _id: "u1", name: "Arjun Sharma",   email: "arjun@djsce.ac.in",  role: "participant", team: "t1", verified: true,  avatar: "AS" },
  admin:       { _id: "u2", name: "Prof. Meera Nair", email: "meera@djsce.ac.in", role: "admin",       team: null, verified: true,  avatar: "MN" },
  judge:       { _id: "u3", name: "Vikram Patel",    email: "vikram@judge.com",   role: "judge",       team: null, verified: true,  avatar: "VP" },
  mentor:      { _id: "u4", name: "Ananya Iyer",     email: "ananya@mentor.com",  role: "mentor",      team: null, verified: true,  avatar: "AI" },
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — try to restore session
  useEffect(() => {
    const saved = localStorage.getItem("hackx_mock_role");
    if (saved && MOCK_USERS[saved]) {
      setUser(MOCK_USERS[saved]);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ email, password, role }) => {
    // ── MOCK: pick user by role ──
    // Replace with: const { data } = await authService.login({ email, password });
    //               localStorage.setItem("hackx_token", data.token);
    //               setUser(data.user);
    const mockUser = MOCK_USERS[role] || MOCK_USERS.participant;
    localStorage.setItem("hackx_mock_role", role);
    setUser(mockUser);
    return mockUser;
  }, []);

  const register = useCallback(async (formData) => {
    // Replace with: const { data } = await authService.register(formData);
    const mockUser = { ...MOCK_USERS.participant, name: formData.name, email: formData.email };
    localStorage.setItem("hackx_mock_role", "participant");
    setUser(mockUser);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hackx_mock_role");
    localStorage.removeItem("hackx_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
