/**
 * AdminTeamsPage.jsx
 * Organizer view: browse all teams, approve/reject verification.
 */
import { useState } from "react";
import { TEAMS, TRACK_COLORS, STATUS_COLORS } from "../../data/teams";
import "./AdminTeamsPage.css";

const MOCK_VERIFICATION = TEAMS.map(t => ({
  ...t,
  verificationStatus: t.status === "confirmed" ? "approved" : t.status === "pending" ? "pending" : "review",
  submittedPPT: t.status !== "pending",
  submittedGithub: t.status === "confirmed",
}));

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState(MOCK_VERIFICATION);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("All");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const approve = (id) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, verificationStatus: "approved", status: "confirmed" } : t));
    showToast("Team approved ✓");
  };

  const reject = (id) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, verificationStatus: "rejected", status: "pending" } : t));
    showToast("Team marked for re-verification.");
  };

  const tracks = ["All", ...Object.keys(TRACK_COLORS)];
  const visible = teams.filter(t =>
    (trackFilter === "All" || t.track === trackFilter) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-teams-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header">
        <div className="page-title">TEAM MANAGEMENT</div>
        <div className="page-subtitle">Review registrations, verify participants and track submissions.</div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        {[
          { icon: "👥", label: "Total Teams",  value: teams.length,                                     color: "#00f5c4" },
          { icon: "✅", label: "Approved",      value: teams.filter(t=>t.verificationStatus==="approved").length, color: "#4ade80" },
          { icon: "⏳", label: "Pending",       value: teams.filter(t=>t.verificationStatus==="pending").length,  color: "#fb923c" },
          { icon: "📋", label: "PPT Submitted", value: teams.filter(t=>t.submittedPPT).length,           color: "#7b5cfa" },
        ].map(s => (
          <div className="stat-tile" key={s.label}>
            <div className="stat-tile__icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
            <div>
              <div className="stat-tile__value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-tile__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="at-filters">
        <input className="form-input" style={{ maxWidth: 280 }} placeholder="🔍 Search teams…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="lb-filters" style={{ margin: 0 }}>
          {tracks.map(t => (
            <button key={t} className={`lb-filter ${trackFilter === t ? "lb-filter--active" : ""}`}
              style={trackFilter === t ? { borderColor: TRACK_COLORS[t] || "var(--color-accent)", color: TRACK_COLORS[t] || "var(--color-accent)" } : {}}
              onClick={() => setTrackFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>TEAM</th><th>TRACK</th><th>MEMBERS</th><th>PPT</th><th>GITHUB</th><th>VERIFICATION</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {visible.map(t => {
              const vs = t.verificationStatus;
              const vsColor = vs === "approved" ? "#4ade80" : vs === "rejected" ? "#f87171" : "#fb923c";
              return (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: t.color, fontFamily: "var(--font-pixel)", fontSize: 7 }}>{t.name}</span>
                    </div>
                  </td>
                  <td><span className="badge" style={{ background: `${TRACK_COLORS[t.track]}18`, color: TRACK_COLORS[t.track] }}>{t.track}</span></td>
                  <td>{t.members}</td>
                  <td>{t.submittedPPT ? <span style={{ color: "#4ade80" }}>✓ Yes</span> : <span style={{ color: "var(--color-muted)" }}>—</span>}</td>
                  <td>{t.submittedGithub ? <span style={{ color: "#4ade80" }}>✓ Yes</span> : <span style={{ color: "var(--color-muted)" }}>—</span>}</td>
                  <td>
                    <span className="badge" style={{ background: `${vsColor}15`, color: vsColor }}>{vs}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {vs !== "approved" && (
                        <button className="btn btn--primary" style={{ padding: "4px 10px", fontSize: 6 }} onClick={() => approve(t.id)}>APPROVE</button>
                      )}
                      {vs === "approved" && (
                        <button className="btn btn--danger" style={{ padding: "4px 10px", fontSize: 6 }} onClick={() => reject(t.id)}>REVOKE</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
