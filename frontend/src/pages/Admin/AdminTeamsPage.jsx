/**
 * AdminTeamsPage.jsx — terminal minimal
 */
import { useState } from "react";
import { TEAMS } from "../../data/teams";
import "./AdminTeamsPage.css";

const TRACKS = ["All", "AI/ML", "Web3", "CleanTech", "HealthTech", "EdTech"];

const MOCK = TEAMS.map(t => ({
  ...t,
  verificationStatus: t.status === "confirmed" ? "approved" : t.status === "pending" ? "pending" : "review",
  submittedPPT:    t.status !== "pending",
  submittedGithub: t.status === "confirmed",
}));

export default function AdminTeamsPage() {
  const [teams,       setTeams]       = useState(MOCK);
  const [search,      setSearch]      = useState("");
  const [trackFilter, setTrackFilter] = useState("All");
  const [toast,       setToast]       = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const approve = (id) => {
    setTeams(p => p.map(t => t.id === id ? { ...t, verificationStatus: "approved", status: "confirmed" } : t));
    showToast("approved");
  };

  const reject = (id) => {
    setTeams(p => p.map(t => t.id === id ? { ...t, verificationStatus: "pending", status: "pending" } : t));
    showToast("revoked");
  };

  const visible = teams.filter(t =>
    (trackFilter === "All" || t.track === trackFilter) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-teams-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header">
        <div className="page-title">Team Management</div>
        <div className="page-subtitle">Review registrations and verify participants.</div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        {[
          { icon: "○", label: "Total",     value: teams.length },
          { icon: "○", label: "Approved",  value: teams.filter(t => t.verificationStatus === "approved").length },
          { icon: "○", label: "Pending",   value: teams.filter(t => t.verificationStatus === "pending").length },
          { icon: "○", label: "PPT Filed", value: teams.filter(t => t.submittedPPT).length },
        ].map(s => (
          <div className="stat-tile" key={s.label}>
            <div className="stat-tile__icon">{s.icon}</div>
            <div>
              <div className="stat-tile__value">{s.value}</div>
              <div className="stat-tile__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="at-filters">
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="search teams…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="lb-filters">
          {TRACKS.map(t => (
            <button key={t} className={`lb-filter${trackFilter === t ? " lb-filter--active" : ""}`} onClick={() => setTrackFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Team</th><th>Track</th><th>Members</th><th>PPT</th><th>GitHub</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {visible.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td style={{ color: "var(--color-muted)" }}>{t.track}</td>
                <td>{t.members}</td>
                <td style={{ color: t.submittedPPT ? "var(--color-text)" : "var(--color-dim)" }}>
                  {t.submittedPPT ? "✓" : "—"}
                </td>
                <td style={{ color: t.submittedGithub ? "var(--color-text)" : "var(--color-dim)" }}>
                  {t.submittedGithub ? "✓" : "—"}
                </td>
                <td><span className="badge">{t.verificationStatus}</span></td>
                <td>
                  {t.verificationStatus !== "approved"
                    ? <button className="btn btn--primary" style={{ padding: "4px 10px" }} onClick={() => approve(t.id)}>APPROVE</button>
                    : <button className="btn btn--danger"  style={{ padding: "4px 10px" }} onClick={() => reject(t.id)}>REVOKE</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
