/**
 * DashboardPage.jsx — terminal minimal, no inline colors
 */
import { useAuth } from "../context/AuthContext";
import { TEAMS } from "../data/teams";
import "./DashboardPage.css";

const ANNOUNCEMENTS = [
  { id: 1, time: "2h ago", text: "Round 1 shortlist released — check your email!",   type: "info" },
  { id: 2, time: "5h ago", text: "Submission deadline extended to 11:59 PM tonight.", type: "warn" },
  { id: 3, time: "1d ago", text: "Welcome to HackX 2025! Workstations are now open.", type: "info" },
];

const TIMELINE = [
  { label: "Registration",    done: true,  date: "Feb 10" },
  { label: "PPT Submission",  done: true,  date: "Feb 14" },
  { label: "Round 1 Results", done: true,  date: "Feb 18" },
  { label: "Hackathon Day",   done: false, date: "Feb 22", active: true },
  { label: "Final Judging",   done: false, date: "Feb 22" },
  { label: "Prize Ceremony",  done: false, date: "Feb 23" },
];

function StatGrid({ stats, cols }) {
  return (
    <div className="stat-grid" style={{ gridTemplateColumns: `repeat(${cols || stats.length}, 1fr)` }}>
      {stats.map(s => (
        <div className="stat-tile" key={s.label}>
          <div className="stat-tile__icon">{s.icon}</div>
          <div>
            <div className="stat-tile__value">{s.value}</div>
            <div className="stat-tile__label">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Timeline() {
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

function ParticipantDash({ user }) {
  const myTeam = TEAMS[0];
  return (
    <>
      <StatGrid stats={[
        { icon: "○", label: "Team Members",  value: myTeam?.members ?? "—" },
        { icon: "○", label: "Score",         value: myTeam?.score ?? "—"   },
        { icon: "○", label: "PS",            value: "LOC8W2"               },
        { icon: "○", label: "Verified",      value: user.verified ? "Yes" : "Pending" },
      ]} />
      <div className="dash-grid">
        <div className="card">
          <div className="card-title">Team — {myTeam?.name}</div>
          <div className="team-members-list">
            {Array.from({ length: myTeam?.members ?? 0 }).map((_, i) => (
              <div key={i} className="member-row">
                <div className="member-avatar">{String.fromCharCode(65 + i)}</div>
                <div>
                  <div className="member-name">Member {i + 1}</div>
                  <div className="member-sub">participant</div>
                </div>
              </div>
            ))}
          </div>
          <div className="progress-section">
            <div className="progress-label">
              <span>Score</span><span>{myTeam?.score}/100</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${myTeam?.score}%` }} />
            </div>
          </div>
        </div>
        <Timeline />
      </div>
    </>
  );
}

function AdminDash() {
  return (
    <>
      <StatGrid stats={[
        { icon: "○", label: "Teams",       value: TEAMS.length },
        { icon: "○", label: "Confirmed",   value: TEAMS.filter(t => t.status === "confirmed").length },
        { icon: "○", label: "Pending",     value: TEAMS.filter(t => t.status === "pending").length   },
        { icon: "○", label: "Participants",value: TEAMS.reduce((a, t) => a + t.members, 0)           },
      ]} />
      <div className="dash-grid">
        <div className="card">
          <div className="card-title">Teams</div>
          <table className="data-table">
            <thead><tr><th>Team</th><th>Track</th><th>Members</th><th>Status</th><th>Score</th></tr></thead>
            <tbody>
              {TEAMS.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td style={{ color: "var(--color-muted)" }}>{t.track}</td>
                  <td>{t.members}</td>
                  <td><span className="badge">{t.status}</span></td>
                  <td style={{ fontWeight: 700 }}>{t.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Timeline />
      </div>
    </>
  );
}

function JudgeDash() {
  const remaining = TEAMS.filter(t => t.score < 80).length;
  return (
    <>
      <StatGrid stats={[
        { icon: "○", label: "To Judge",  value: TEAMS.length },
        { icon: "○", label: "Scored",    value: TEAMS.length - remaining },
        { icon: "○", label: "Remaining", value: remaining },
      ]} />
      <div className="card">
        <div className="card-title">Assigned Teams</div>
        <table className="data-table">
          <thead><tr><th>Team</th><th>Track</th><th>Score</th><th></th></tr></thead>
          <tbody>
            {TEAMS.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td style={{ color: "var(--color-muted)" }}>{t.track}</td>
                <td style={{ fontWeight: 700 }}>{t.score}</td>
                <td><button className="btn btn--outline" style={{ padding: "4px 10px" }}>EVALUATE</button></td>
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
      <div className="announcements">
        {ANNOUNCEMENTS.map(a => (
          <div key={a.id} className={`announcement announcement--${a.type}`}>
            <span style={{ opacity: 0.4 }}>{a.type === "warn" ? "!" : ">"}</span>
            <span className="announcement__text">{a.text}</span>
            <span className="announcement__time">{a.time}</span>
          </div>
        ))}
      </div>
      {user?.role === "participant" && <ParticipantDash user={user} />}
      {user?.role === "admin"       && <AdminDash />}
      {user?.role === "judge"       && <JudgeDash />}
    </div>
  );
}
