/**
 * DashboardPage.jsx
 * Role-aware dashboard — different stats/widgets per user role.
 */
import { useAuth } from "../context/AuthContext";
import { TEAMS } from "../data/teams";
import "./DashboardPage.css";

/* ── Mock data ── */
const ANNOUNCEMENTS = [
  { id: 1, time: "2h ago",  text: "Round 1 shortlist released — check your email!", type: "info"    },
  { id: 2, time: "5h ago",  text: "Submission deadline extended to 11:59 PM tonight.", type: "warn" },
  { id: 3, time: "1d ago",  text: "Welcome to HackX 2025! Workstations are now open.", type: "info" },
];

const TIMELINE = [
  { label: "Registration",    done: true,  date: "Feb 10" },
  { label: "PPT Submission",  done: true,  date: "Feb 14" },
  { label: "Round 1 Results", done: true,  date: "Feb 18" },
  { label: "Hackathon Day",   done: false, date: "Feb 22", active: true },
  { label: "Final Judging",   done: false, date: "Feb 22" },
  { label: "Prize Ceremony",  done: false, date: "Feb 23" },
];

/* ── Participant widgets ── */
function ParticipantDash({ user }) {
  const myTeam = TEAMS.find((t) => t.id === 1); // mock
  return (
    <>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { icon: "👥", label: "Team Members", value: myTeam?.members ?? "—", color: "#00f5c4" },
          { icon: "🏆", label: "Current Score", value: myTeam?.score ?? "—", color: "#7b5cfa"  },
          { icon: "📋", label: "PS Selected",   value: "LOC8W2",               color: "#fb923c" },
          { icon: "✅", label: "Verified",       value: user.verified ? "Yes" : "No", color: "#4ade80" },
        ].map((s) => (
          <div className="stat-tile" key={s.label}>
            <div className="stat-tile__icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
            <div>
              <div className="stat-tile__value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-tile__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* My team card */}
        <div className="card">
          <h3 className="card-title">My Team — {myTeam?.name}</h3>
          <div className="team-members-list">
            {Array.from({ length: myTeam?.members ?? 0 }).map((_, i) => (
              <div key={i} className="member-row">
                <div className="member-avatar" style={{ background: `${myTeam.color}22`, border: `1px solid ${myTeam.color}40`, color: myTeam.color }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div>
                  <div className="member-name">Team Member {i + 1}</div>
                  <div className="member-sub">participant</div>
                </div>
              </div>
            ))}
          </div>
          <div className="progress-section">
            <div className="progress-label">
              <span>Score Progress</span>
              <span style={{ color: myTeam?.color }}>{myTeam?.score}/100</span>
            </div>
            <div className="modal-progress-bar">
              <div className="modal-progress-fill" style={{ width: `${myTeam?.score}%`, background: myTeam?.color }} />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <h3 className="card-title">Event Timeline</h3>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div key={i} className={`timeline__item ${t.done ? "timeline__item--done" : ""} ${t.active ? "timeline__item--active" : ""}`}>
                <div className="timeline__dot" />
                <div className="timeline__content">
                  <div className="timeline__label">{t.label}</div>
                  <div className="timeline__date">{t.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Admin widgets ── */
function AdminDash() {
  return (
    <>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { icon: "👥", label: "Total Teams",    value: TEAMS.length,                              color: "#00f5c4" },
          { icon: "✅", label: "Verified",        value: TEAMS.filter(t => t.status==="confirmed").length, color: "#4ade80" },
          { icon: "⏳", label: "Pending Verify",  value: TEAMS.filter(t => t.status==="pending").length,  color: "#fb923c" },
          { icon: "👤", label: "Participants",    value: TEAMS.reduce((a,t)=>a+t.members,0),        color: "#7b5cfa" },
        ].map((s) => (
          <div className="stat-tile" key={s.label}>
            <div className="stat-tile__icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
            <div>
              <div className="stat-tile__value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-tile__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <h3 className="card-title">Team Overview</h3>
          <table className="data-table">
            <thead><tr><th>TEAM</th><th>TRACK</th><th>MEMBERS</th><th>STATUS</th><th>SCORE</th></tr></thead>
            <tbody>
              {TEAMS.map(t => (
                <tr key={t.id}>
                  <td style={{ color: t.color, fontWeight: 700 }}>{t.name}</td>
                  <td>{t.track}</td>
                  <td>{t.members}</td>
                  <td><span className="badge" style={{ background: `${t.color}18`, color: t.color }}>{t.status}</span></td>
                  <td style={{ fontWeight: 700 }}>{t.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 className="card-title">Event Timeline</h3>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div key={i} className={`timeline__item ${t.done ? "timeline__item--done" : ""} ${t.active ? "timeline__item--active" : ""}`}>
                <div className="timeline__dot" />
                <div className="timeline__content">
                  <div className="timeline__label">{t.label}</div>
                  <div className="timeline__date">{t.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Judge widgets ── */
function JudgeDash() {
  const remaining = TEAMS.filter(t => t.score < 80).length;
  return (
    <>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { icon: "📋", label: "Teams to Judge", value: TEAMS.length, color: "#00f5c4" },
          { icon: "✅", label: "Scored",          value: TEAMS.length - remaining, color: "#4ade80" },
          { icon: "⏳", label: "Remaining",       value: remaining, color: "#fb923c" },
        ].map((s) => (
          <div className="stat-tile" key={s.label}>
            <div className="stat-tile__icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
            <div>
              <div className="stat-tile__value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-tile__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="card-title">Assigned Teams</h3>
        <table className="data-table">
          <thead><tr><th>TEAM</th><th>TRACK</th><th>SCORE</th><th>ACTION</th></tr></thead>
          <tbody>
            {TEAMS.map(t => (
              <tr key={t.id}>
                <td style={{ color: t.color, fontWeight: 700 }}>{t.name}</td>
                <td>{t.track}</td>
                <td style={{ fontWeight: 700 }}>{t.score}</td>
                <td><button className="btn btn--outline" style={{ fontSize: 6, padding: "5px 10px" }}>EVALUATE</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Mentor widgets ── */
function MentorDash() {
  const myTeams = TEAMS.slice(0, 3);
  return (
    <>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { icon: "👥", label: "Assigned Teams", value: myTeams.length, color: "#00f5c4" },
          { icon: "🏆", label: "Avg Score",       value: Math.round(myTeams.reduce((a,t)=>a+t.score,0)/myTeams.length), color: "#7b5cfa" },
          { icon: "✅", label: "Confirmed",        value: myTeams.filter(t=>t.status==="confirmed").length, color: "#4ade80" },
        ].map((s) => (
          <div className="stat-tile" key={s.label}>
            <div className="stat-tile__icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
            <div>
              <div className="stat-tile__value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-tile__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="card-title">My Teams</h3>
        {myTeams.map(t => (
          <div key={t.id} className="mentor-team-row">
            <div className="mentor-team-color" style={{ background: t.color }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: t.color, fontFamily: "var(--font-pixel)", fontSize: 8 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{t.track} · {t.members} members</div>
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 12, color: t.color }}>{t.score}pt</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Root ── */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-title">DASHBOARD</div>
        <div className="page-subtitle">
          Welcome back, <strong style={{ color: "var(--color-accent)" }}>{user?.name}</strong>
          {" · "}HackX 2025 is live 🔥
        </div>
      </div>

      {/* Announcements */}
      <div className="announcements">
        {ANNOUNCEMENTS.map((a) => (
          <div key={a.id} className={`announcement announcement--${a.type}`}>
            <span>{a.type === "info" ? "ℹ️" : "⚠️"}</span>
            <span className="announcement__text">{a.text}</span>
            <span className="announcement__time">{a.time}</span>
          </div>
        ))}
      </div>

      {user?.role === "participant" && <ParticipantDash user={user} />}
      {user?.role === "admin"       && <AdminDash />}
      {user?.role === "judge"       && <JudgeDash />}
      {user?.role === "mentor"      && <MentorDash />}
    </div>
  );
}
