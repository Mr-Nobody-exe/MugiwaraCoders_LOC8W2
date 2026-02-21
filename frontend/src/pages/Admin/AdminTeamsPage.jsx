import { useState } from "react";
import { teamService, userService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import "./AdminTeamsPage.css";

const TRACKS = ["All", "AI/ML", "Web3", "CleanTech", "HealthTech", "EdTech"];

export default function AdminTeamsPage() {
  const { data: teams, loading, error, refetch } = useApi(() => teamService.getAll());
  const { data: mentors } = useApi(() => userService.getMentors());

  const [search,      setSearch]      = useState("");
  const [trackFilter, setTrackFilter] = useState("All");
  const [toast,       setToast]       = useState("");
  const [actionErr,   setActionErr]   = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const updateStatus = async (id, status) => {
    setActionErr("");
    try {
      await teamService.update(id, { status });
      showToast(`Status → ${status}`);
      refetch();
    } catch (err) {
      setActionErr(err?.response?.data?.message || "Update failed");
    }
  };

  const assignMentor = async (teamId, mentorId) => {
    setActionErr("");
    try {
      await userService.assignMentor(teamId, mentorId);
      showToast("Mentor assigned");
      refetch();
    } catch (err) {
      setActionErr(err?.response?.data?.message || "Failed");
    }
  };

  const visible = (teams ?? []).filter(t =>
    (trackFilter === "All" || t.track === trackFilter) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalTeams = teams?.length ?? 0;
  const confirmed  = teams?.filter(t => t.status === "confirmed").length ?? 0;
  const pending    = teams?.filter(t => t.status === "pending").length ?? 0;
  const withPPT    = teams?.filter(t => t.submission?.pptUrl).length ?? 0;

  return (
    <div className="admin-teams-page">
      {toast     && <div className="toast">{toast}</div>}
      {actionErr && <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 10 }}>{actionErr}</div>}

      <div className="page-header">
        <div className="page-title">Team Management</div>
        <div className="page-subtitle">Review registrations, verify participants, assign mentors.</div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        {[
          { icon: "○", label: "Total",     value: totalTeams },
          { icon: "○", label: "Confirmed", value: confirmed  },
          { icon: "○", label: "Pending",   value: pending    },
          { icon: "○", label: "PPT Filed", value: withPPT    },
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
        <input className="form-input" style={{ maxWidth: 260 }}
          placeholder="search teams…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="lb-filters">
          {TRACKS.map(t => (
            <button key={t}
              className={`lb-filter${trackFilter === t ? " lb-filter--active" : ""}`}
              onClick={() => setTrackFilter(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading…</div>}
      {error   && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>{error}</div>}

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Team</th><th>Track</th><th>Members</th>
              <th>PPT</th><th>GitHub</th><th>Status</th>
              <th>Mentor</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(t => (
              <tr key={t._id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td style={{ color: "var(--color-muted)" }}>{t.track}</td>
                <td>{t.members?.length ?? 0}</td>
                <td style={{ color: t.submission?.pptUrl    ? "var(--color-text)" : "var(--color-dim)" }}>
                  {t.submission?.pptUrl    ? "✓" : "—"}
                </td>
                <td style={{ color: t.submission?.githubUrl ? "var(--color-text)" : "var(--color-dim)" }}>
                  {t.submission?.githubUrl ? "✓" : "—"}
                </td>
                <td><span className="badge">{t.status}</span></td>
                <td>
                  <select className="form-select" style={{ padding: "3px 6px", fontSize: 10 }}
                    value={t.mentor?._id || t.mentor || ""}
                    onChange={e => assignMentor(t._id, e.target.value)}>
                    <option value="">— none —</option>
                    {mentors?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    {t.status !== "confirmed" && (
                      <button className="btn btn--primary" style={{ padding: "3px 8px", fontSize: 9 }}
                        onClick={() => updateStatus(t._id, "confirmed")}>
                        CONFIRM
                      </button>
                    )}
                    {t.status === "confirmed" && (
                      <button className="btn btn--danger" style={{ padding: "3px 8px", fontSize: 9 }}
                        onClick={() => updateStatus(t._id, "pending")}>
                        REVOKE
                      </button>
                    )}
                    {t.status !== "disqualified" && (
                      <button className="btn btn--outline" style={{ padding: "3px 8px", fontSize: 9 }}
                        onClick={() => updateStatus(t._id, "disqualified")}>
                        DQ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
