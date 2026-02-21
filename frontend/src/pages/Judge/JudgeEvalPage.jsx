/**
 * JudgeEvalPage.jsx
 * Real-time scoring interface for judges.
 */
import { useState } from "react";
import { TEAMS } from "../../data/teams";
import "./JudgeEvalPage.css";

const CRITERIA = [
  { key: "innovation",  label: "Innovation",       weight: 25, desc: "Novelty of idea and approach" },
  { key: "feasibility", label: "Feasibility",      weight: 20, desc: "Technical viability within timeline" },
  { key: "technical",   label: "Technical Depth",  weight: 25, desc: "Code quality, architecture, complexity" },
  { key: "presentation",label: "Presentation",     weight: 15, desc: "Clarity, demo quality, communication" },
  { key: "impact",      label: "Social Impact",    weight: 15, desc: "Real-world value and scalability" },
];

function ScoreSlider({ label, weight, value, onChange, desc }) {
  return (
    <div className="score-row">
      <div className="score-row__info">
        <div className="score-row__label">{label}</div>
        <div className="score-row__desc">{desc}</div>
        <div className="score-row__weight">Weight: {weight}%</div>
      </div>
      <div className="score-row__control">
        <input type="range" min={0} max={10} step={0.5} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="score-slider"
          style={{ "--pct": `${value * 10}%` }}
        />
        <div className="score-value">{value.toFixed(1)}<span>/10</span></div>
      </div>
    </div>
  );
}

export default function JudgeEvalPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [scores, setScores] = useState(
    Object.fromEntries(TEAMS.map(t => [t.id, Object.fromEntries(CRITERIA.map(c => [c.key, 5]))]))
  );
  const [saved, setSaved] = useState({});
  const [notes, setNotes] = useState(Object.fromEntries(TEAMS.map(t => [t.id, ""])));

  const team = TEAMS.find(t => t.id === selectedId);

  const computeTotal = (id) => {
    const s = scores[id];
    return CRITERIA.reduce((acc, c) => acc + (s[c.key] * c.weight / 10), 0).toFixed(1);
  };

  const setScore = (key, val) => {
    setScores(prev => ({ ...prev, [selectedId]: { ...prev[selectedId], [key]: val } }));
  };

  const handleSave = () => {
    // Replace with: await evalService.scoreTeam(selectedId, { scores: scores[selectedId], notes: notes[selectedId] });
    setSaved(prev => ({ ...prev, [selectedId]: true }));
  };

  return (
    <div className="eval-page">
      <div className="page-header">
        <div className="page-title">EVALUATION PANEL</div>
        <div className="page-subtitle">Score each team across 5 weighted criteria. Scores save per team.</div>
      </div>

      <div className="eval-layout">
        {/* Team list */}
        <div className="eval-sidebar">
          <div className="form-label" style={{ padding: "0 4px 10px" }}>TEAMS</div>
          {TEAMS.map(t => {
            const total = computeTotal(t.id);
            const isSaved = saved[t.id];
            return (
              <button
                key={t.id}
                className={`eval-team-btn ${selectedId === t.id ? "eval-team-btn--active" : ""}`}
                style={{ "--team-color": t.color }}
                onClick={() => setSelectedId(t.id)}
              >
                <div className="eval-team-dot" style={{ background: t.color }} />
                <div className="eval-team-info">
                  <div className="eval-team-name">{t.name}</div>
                  <div className="eval-team-track">{t.track}</div>
                </div>
                <div className="eval-team-right">
                  <div className="eval-team-score" style={{ color: t.color }}>{total}</div>
                  {isSaved && <div className="eval-saved-dot" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Scoring panel */}
        <div className="eval-main">
          {!team ? (
            <div className="eval-empty">
              <div className="eval-empty-icon">⚖️</div>
              <div>Select a team from the list to begin scoring.</div>
            </div>
          ) : (
            <div className="card" style={{ border: `1px solid ${team.color}30` }}>
              {/* Team header */}
              <div className="eval-header" style={{ borderBottom: `1px solid ${team.color}20`, marginBottom: 22 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: team.color, marginBottom: 4 }}>{team.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{team.track} · {team.members} members · PS: LOC8W2</div>
                </div>
                <div className="eval-total-badge" style={{ background: `${team.color}15`, border: `1px solid ${team.color}40`, color: team.color }}>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, marginBottom: 2 }}>TOTAL</div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 20 }}>{computeTotal(team.id)}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 10, opacity: 0.6 }}>/ 100</div>
                </div>
              </div>

              {/* Criteria */}
              <div className="eval-criteria">
                {CRITERIA.map(c => (
                  <ScoreSlider
                    key={c.key}
                    label={c.label}
                    weight={c.weight}
                    desc={c.desc}
                    value={scores[team.id][c.key]}
                    onChange={v => setScore(c.key, v)}
                  />
                ))}
              </div>

              {/* Links */}
              <div className="eval-links">
                <a href={team.github} target="_blank" rel="noreferrer" className="btn btn--outline" style={{ fontSize: 7 }}>🐙 OPEN REPO</a>
                {team.demoVideo && (
                  <a href={team.demoVideo} target="_blank" rel="noreferrer" className="btn btn--outline" style={{ fontSize: 7 }}>🎬 WATCH DEMO</a>
                )}
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">JUDGE NOTES (OPTIONAL)</label>
                <textarea className="form-textarea" rows={3}
                  placeholder="Internal notes for this team…"
                  value={notes[team.id]}
                  onChange={e => setNotes(prev => ({ ...prev, [team.id]: e.target.value }))}
                />
              </div>

              <button className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleSave}>
                {saved[team.id] ? "✓ SAVED — UPDATE SCORE" : "SAVE SCORE →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
