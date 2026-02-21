/**
 * TopHud.jsx
 *
 * Fixed top navigation bar showing:
 *  - HackX logo + branding
 *  - Top score, prize pool, days left
 *  - Pan/click hint
 *
 * Props:
 *   teams {Team[]}
 *   meta  { name, prizePool, daysLeft }
 */
import "../styles/TopHud.css";

export function TopHud({ teams, meta }) {
  const totalParticipants = teams.reduce((acc, t) => acc + t.members, 0);
  const topScore = Math.max(...teams.map((t) => t.score));

  const stats = [
    { label: "TOP SCORE",  value: topScore,         color: "var(--color-accent)"  },
    { label: "PRIZE POOL", value: meta.prizePool,    color: "var(--color-purple)"  },
    { label: "DAYS LEFT",  value: meta.daysLeft,     color: "var(--color-orange)"  },
  ];

  return (
    <header className="top-hud">
      {/* Brand */}
      <div className="top-hud__brand">
        <div className="top-hud__logo">⚡</div>
        <div>
          <div className="top-hud__title">{meta.name}</div>
          <div className="top-hud__subtitle">
            {teams.length} TEAMS · {totalParticipants} PARTICIPANTS
          </div>
        </div>
      </div>

      {/* Stats + hint */}
      <div className="top-hud__stats">
        {stats.map((s) => (
          <div key={s.label} className="top-hud__stat">
            <div className="top-hud__stat-value" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="top-hud__stat-label">{s.label}</div>
          </div>
        ))}

        <div className="top-hud__divider" />

        <div className="top-hud__hint">🖱 drag to pan · click team to inspect</div>
      </div>
    </header>
  );
}
