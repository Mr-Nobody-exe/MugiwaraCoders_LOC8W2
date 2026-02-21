import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const ROLES = [
  { id: "participant", label: "Participant", icon: "○" },
  { id: "admin",       label: "Organizer",   icon: "◇" },
  { id: "judge",       label: "Judge",       icon: "△" },
  { id: "mentor",      label: "Mentor",      icon: "□" },
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate             = useNavigate();
  const [mode,    setMode]   = useState("login");
  const [role,    setRole]   = useState("participant");
  const [form,    setForm]   = useState({ name: "", email: "", password: "" });
  const [error,   setError]  = useState("");
  const [loading, setLoading]= useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ ...form, role });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left__logo">[ ⚡ ]</div>
        <h1 className="auth-left__title">HackX 2025</h1>
        <p className="auth-left__sub">League of Code · 8.0</p>
        <div className="auth-left__stats">
          {[["24h", "Duration"], ["₹5L", "Prize"], ["4", "Tracks"]].map(([v, l]) => (
            <div key={l}>
              <div className="auth-left__stat-val">{v}</div>
              <div className="auth-left__stat-lab">{l}</div>
            </div>
          ))}
        </div>
        <p className="auth-left__tagline">
          Build. Hack. Ship.<br />
          <span>The best 24 hours of your year.</span>
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab${mode === "login"    ? " auth-tab--active" : ""}`} onClick={() => setMode("login")}>LOGIN</button>
            <button className={`auth-tab${mode === "register" ? " auth-tab--active" : ""}`} onClick={() => setMode("register")}>REGISTER</button>
          </div>

          {mode === "register" && (
            <div className="auth-roles">
              {ROLES.map(r => (
                <button key={r.id} className={`auth-role${role === r.id ? " auth-role--active" : ""}`} onClick={() => setRole(r.id)}>
                  <span className="auth-role__icon">{r.icon}</span>
                  <span className="auth-role__label">{r.label}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" placeholder="Arjun Sharma" value={form.name} onChange={set("name")} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@djsce.ac.in" value={form.email} onChange={set("email")} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
              {loading ? "..." : mode === "login" ? "LOGIN →" : "CREATE ACCOUNT →"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "New here? " : "Already registered? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
              {mode === "login" ? "Create account" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
