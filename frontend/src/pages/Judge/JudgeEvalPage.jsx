/**
 * JudgeEvalPage.jsx — terminal minimal
 */
import { useState } from "react";
import { TEAMS } from "../../data/teams";
import "./JudgeEvalPage.css";

const CRITERIA = [
  { key: "innovation",   label: "Innovation",      weight: 25, desc: "Novelty of idea and approach" },
  { key: "feasibility",  label: "Feasibility",     weight: 20, desc: "Technical viability within timeline" },
  { key: "technical",    label: "Technical Depth", weight: 25, desc: "Code quality, architecture, complexity" },
  { key: "presentation", label: "Presentation",    weight: 15, desc: "Clarity, demo quality, communication" },
  { key: "impact",       label: "Impact",          weight: 15, desc: "Real-world value and scalability" },
];

function ScoreSlider({ label, weight, value, onChange, desc }) {
  return (
    <div className="score-row">
      <div className="score-row__info">
        <div className="score-row__label">{label}</div>
        <div className="score-row__desc">{desc}</div>
        <div className="score-row__weight">weight: {weight}%</div>
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

  const computeTotal = (id) =>
    CRITERIA.reduce((acc, c) => acc + (scores[id][c.key] * c.weight / 10), 0).toFixed(1);

  const setScore = (key, val) =>
    setScores(p => ({ ...p, [selectedId]: { ...p[selectedId], [key]: val } }));

  const handleSave = () => setSaved(p => ({ ...p, [selectedId]: true }));

  return (
    <div className="eval-page">
      <div className="page-header">
        <div className="page-title">Evaluation</div>
        <div className="page-subtitle">Score each team across 5 weighted criteria.</div>
      </div>

      <div className="eval-layout">
        {/* Team list */}
        <div className="eval-sidebar">
          <div className="form-label" style={{ padding: "0 4px 8px" }}>Teams</div>
          {TEAMS.map(t => (
            <button key={t.id}
              className={`eval-team-btn${selectedId === t.id ? " eval-team-btn--active" : ""}`}
              onClick={() => setSelectedId(t.id)}
            >
              <div className="eval-team-dot" />
              <div className="eval-team-info">
                <div className="eval-team-name">{t.name}</div>
                <div className="eval-team-track">{t.track}</div>
              </div>
              <div className="eval-team-right">
                <div className="eval-team-score">{computeTotal(t.id)}</div>
                {saved[t.id] && <div className="eval-saved-dot" />}
              </div>
            </button>
          ))}
        </div>

        {/* Scoring panel */}
        <div className="eval-main">
          {!team ? (
            <div className="eval-empty">
              <div className="eval-empty-icon">[ ]</div>
              <div>select a team to begin scoring</div>
            </div>
          ) : (
            <div className="card">
              <div className="eval-header">
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 2 }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
                    {team.track} · {team.members} members
                  </div>
                </div>
                <div className="eval-total-badge">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-muted)", marginBottom: 2, letterSpacing: 2, textTransform: "uppercase" }}>Total</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>{computeTotal(team.id)}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-muted)" }}>/ 100</div>
                </div>
              </div>

              <div className="eval-criteria">
                {CRITERIA.map(c => (
                  <ScoreSlider key={c.key} label={c.label} weight={c.weight} desc={c.desc}
                    value={scores[team.id][c.key]} onChange={v => setScore(c.key, v)} />
                ))}
              </div>

              <div className="eval-links">
                <a href={team.github} target="_blank" rel="noreferrer" className="btn btn--outline">REPO ↗</a>
                {team.demoVideo && <a href={team.demoVideo} target="_blank" rel="noreferrer" className="btn btn--outline">DEMO ↗</a>}
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" rows={3} placeholder="internal notes…"
                  value={notes[team.id]}
                  onChange={e => setNotes(p => ({ ...p, [team.id]: e.target.value }))}
                />
              </div>

              <button className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleSave}>
                {saved[team.id] ? "✓ SAVED — UPDATE" : "SAVE SCORE"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
