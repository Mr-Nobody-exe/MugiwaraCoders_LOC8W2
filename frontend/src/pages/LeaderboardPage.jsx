import { useState } from "react";
import { evalService } from "../services/api";
import { useApi } from "../hooks/useApi";
import "./LeaderboardPage.css";

const TRACKS = ["All", "AI/ML", "Web3", "CleanTech", "HealthTech", "EdTech"];

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("All");
  const { data: teams, loading, error } = useApi(() => evalService.getLeaderboard());

  const sorted  = [...(teams ?? [])].sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
  const visible = filter === "All" ? sorted : sorted.filter(t => t.track === filter);
  const top3    = sorted.slice(0, 3);

  return (
    <div className="lb-page">
      <div className="page-header">
        <div className="page-title">Leaderboard</div>
        <div className="page-subtitle">Live rankings — updated in real time.</div>
      </div>

      {loading && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading…</div>}
      {error   && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>{error}</div>}

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="podium">
          {[top3[1], top3[0], top3[2]].map((team, idx) => {
            const pos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            const heights = { 1: 110, 2: 80, 3: 60 };
            return (
              <div key={team._id} className="podium__slot">
                <div className="podium__name">{team.name}</div>
                <div className="podium__score">{team.finalScore ?? 0}</div>
                <div className="podium__block" style={{ height: heights[pos] }}>
                  <span className="podium__pos">#{pos}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Track filter */}
      <div className="lb-filters">
        {TRACKS.map(t => (
          <button key={t}
            className={`lb-filter${filter === t ? " lb-filter--active" : ""}`}
            onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Team</th><th>Track</th><th>Members</th><th>Status</th><th>Score</th></tr>
          </thead>
          <tbody>
            {visible.map((team, i) => {
              const rank  = sorted.indexOf(team) + 1;
              const medal = rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`;
              return (
                <tr key={team._id}>
                  <td style={{ color: "var(--color-muted)", fontWeight: rank <= 3 ? 700 : 400 }}>{medal}</td>
                  <td style={{ fontWeight: 600 }}>{team.name}</td>
                  <td style={{ color: "var(--color-muted)" }}>{team.track}</td>
                  <td>{team.members?.length ?? 0}</td>
                  <td><span className="badge">{team.status}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="lb-bar-wrap">
                        <div className="lb-bar" style={{ width: `${team.finalScore ?? 0}%` }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 12 }}>{team.finalScore ?? 0}</span>
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
