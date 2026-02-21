/**
 * LeaderboardPage.jsx
 */
import { useState } from "react";
import { TEAMS, TRACK_COLORS } from "../data/teams";
import "./LeaderboardPage.css";

const sorted = [...TEAMS].sort((a, b) => b.score - a.score);
const TRACKS = ["All", ...Object.keys(TRACK_COLORS)];

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("All");

  const visible = filter === "All" ? sorted : sorted.filter(t => t.track === filter);
  const top3    = sorted.slice(0, 3);

  return (
    <div className="lb-page">
      <div className="page-header">
        <div className="page-title">LEADERBOARD</div>
        <div className="page-subtitle">Live rankings updated every 5 minutes during the event.</div>
      </div>

      {/* Podium */}
      <div className="podium">
        {[top3[1], top3[0], top3[2]].map((team, idx) => {
          const pos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
          const heights = { 1: 120, 2: 90, 3: 70 };
          return (
            <div key={team.id} className="podium__slot" style={{ "--slot-color": team.color }}>
              <div className="podium__name" style={{ color: team.color }}>{team.name}</div>
              <div className="podium__score">{team.score}</div>
              <div className="podium__block" style={{ height: heights[pos], background: `${team.color}18`, border: `1px solid ${team.color}40` }}>
                <span className="podium__pos">#{pos}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="lb-filters">
        {TRACKS.map(t => (
          <button
            key={t}
            className={`lb-filter ${filter === t ? "lb-filter--active" : ""}`}
            style={filter === t ? { borderColor: TRACK_COLORS[t] || "var(--color-accent)", color: TRACK_COLORS[t] || "var(--color-accent)" } : {}}
            onClick={() => setFilter(t)}
          >{t}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>TEAM</th><th>TRACK</th><th>MEMBERS</th><th>STATUS</th><th>SCORE</th></tr>
          </thead>
          <tbody>
            {visible.map((team, i) => {
              const rank = sorted.indexOf(team) + 1;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;
              return (
                <tr key={team.id} className={rank <= 3 ? "lb-row--top" : ""}>
                  <td><span className="lb-rank">{medal}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: team.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: team.color, fontFamily: "var(--font-pixel)", fontSize: 7 }}>{team.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: `${TRACK_COLORS[team.track]}18`, color: TRACK_COLORS[team.track] }}>{team.track}</span>
                  </td>
                  <td>{team.members}</td>
                  <td><span className="badge" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>{team.status}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="lb-bar-wrap">
                        <div className="lb-bar" style={{ width: `${team.score}%`, background: team.color }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: team.color }}>{team.score}</span>
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
