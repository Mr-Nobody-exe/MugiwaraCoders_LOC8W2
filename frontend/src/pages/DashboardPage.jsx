import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { teamService, evalService, userService } from "../services/api";
import { useApi } from "../hooks/useApi";
import "./DashboardPage.css";

const TIMELINE = [
  { label: "Registration",    done: true,  date: "Feb 10" },
  { label: "PPT Submission",  done: true,  date: "Feb 14" },
  { label: "Round 1 Results", done: true,  date: "Feb 18" },
  { label: "Hackathon Day",   done: false, date: "Feb 22", active: true },
  { label: "Final Judging",   done: false, date: "Feb 22" },
  { label: "Prize Ceremony",  done: false, date: "Feb 23" },
];

function StatGrid({ stats }) {
  return (
    <div className="stat-grid" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
      {stats.map(s => (
        <div className="stat-tile" key={s.label}>
          <div className="stat-tile__icon">{s.icon}</div>
          <div>
            <div className="stat-tile__value">{s.value ?? "—"}</div>
            <div className="stat-tile__label">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineCard() {
  return (
    <div className="card">
      <div className="card-title">Timeline</div>
      <div className="timeline">
        {TIMELINE.map((t, i) => (
          <div key={i} className={`timeline__item${t.done ? " timeline__item--done" : ""}${t.active ? " timeline__item--active" : ""}`}>
            <div className="timeline__dot" />
            <div>
              <div className="timeline__label">{t.label}</div>
              <div className="timeline__date">{t.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Participant ── */
function ParticipantDash({ user }) {
  const teamId = typeof user.team === "object" ? user.team?._id : user.team;
  const { data: team, loading } = useApi(() => teamService.getById(teamId), [teamId]);

  return (
    <>
      <StatGrid stats={[
        { icon: "○", label: "Members",  value: team?.members?.length },
        { icon: "○", label: "Score",    value: team?.finalScore ?? 0 },
        { icon: "○", label: "PS",       value: team?.problemStatement || "—" },
        { icon: "○", label: "Status",   value: team?.status || "—" },
      ]} />
      <div className="dash-grid">
        <div className="card">
          <div className="card-title">Team — {loading ? "…" : team?.name ?? "No team yet"}</div>
          {loading && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading…</div>}
          {team && (
            <>
              <div className="team-members-list">
                {team.members?.map((m, i) => (
                  <div key={m._id} className="member-row">
                    <div className="member-avatar">{m.avatar || String.fromCharCode(65 + i)}</div>
                    <div>
                      <div className="member-name">{m.name}</div>
                      <div className="member-sub">{m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="progress-section">
                <div className="progress-label">
                  <span>Score</span><span>{team.finalScore ?? 0}/100</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${team.finalScore ?? 0}%` }} />
                </div>
              </div>
            </>
          )}
          {!loading && !team && (
            <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
              You have not joined a team yet. Go to Team page to create or join one.
            </div>
          )}
        </div>
        <TimelineCard />
      </div>
    </>
  );
}

/* ── Admin ── */
function AdminDash() {
  const { data: stats, loading } = useApi(() => userService.getDashStats());
  const { data: teams }          = useApi(() => teamService.getAll());

  return (
    <>
      <StatGrid stats={[
        { icon: "○", label: "Teams",        value: stats?.totalTeams },
        { icon: "○", label: "Confirmed",    value: stats?.confirmed  },
        { icon: "○", label: "Pending",      value: stats?.pending    },
        { icon: "○", label: "Participants", value: stats?.participants },
      ]} />
      <div className="dash-grid">
        <div className="card">
          <div className="card-title">Teams</div>
          {loading && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading…</div>}
          <table className="data-table">
            <thead><tr><th>Team</th><th>Track</th><th>Members</th><th>Status</th><th>Score</th></tr></thead>
            <tbody>
              {teams?.map(t => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td style={{ color: "var(--color-muted)" }}>{t.track}</td>
                  <td>{t.members?.length ?? 0}</td>
                  <td><span className="badge">{t.status}</span></td>
                  <td style={{ fontWeight: 700 }}>{t.finalScore ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TimelineCard />
      </div>
    </>
  );
}

/* ── Judge ── */
function JudgeDash() {
  const { data: teams, loading } = useApi(() => evalService.getSubmissions());
  const scored    = teams?.filter(t => t.scores?.length > 0).length ?? 0;
  const remaining = (teams?.length ?? 0) - scored;

  return (
    <>
      <StatGrid stats={[
        { icon: "○", label: "To Judge",  value: teams?.length },
        { icon: "○", label: "Scored",    value: scored        },
        { icon: "○", label: "Remaining", value: remaining     },
      ]} />
      <div className="card">
        <div className="card-title">Assigned Teams</div>
        {loading && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading…</div>}
        <table className="data-table">
          <thead><tr><th>Team</th><th>Track</th><th>Score</th><th>Submission</th></tr></thead>
          <tbody>
            {teams?.map(t => (
              <tr key={t._id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td style={{ color: "var(--color-muted)" }}>{t.track}</td>
                <td style={{ fontWeight: 700 }}>{t.finalScore ?? 0}</td>
                <td style={{ color: t.submission?.githubUrl ? "var(--color-text)" : "var(--color-dim)" }}>
                  {t.submission?.githubUrl ? "✓ submitted" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">{user?.name} / {user?.role}</div>
      </div>
      {user?.role === "participant" && <ParticipantDash user={user} />}
      {user?.role === "admin"       && <AdminDash />}
      {user?.role === "judge"       && <JudgeDash />}
      {user?.role === "mentor"      && <AdminDash />}
    </div>
  );
}
