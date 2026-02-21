import { useState } from "react";
import { evalService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
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

const defaultScores = () => Object.fromEntries(CRITERIA.map(c => [c.key, 5]));

export default function JudgeEvalPage() {
  const { data: teams, loading, error } = useApi(() => evalService.getSubmissions());

  const [selectedId, setSelectedId] = useState(null);
  const [scores,     setScores]     = useState({});   // { [teamId]: { innovation: N, ... } }
  const [notes,      setNotes]      = useState({});
  const [saved,      setSaved]      = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState("");

  const team = teams?.find(t => t._id === selectedId);

  // Get or initialise scores for a team
  const getScores = (id) => scores[id] || defaultScores();

  const computeTotal = (id) => {
    const s = getScores(id);
    return CRITERIA.reduce((acc, c) => acc + (s[c.key] * c.weight / 10), 0).toFixed(1);
  };

  const setScore = (key, val) => {
    setScores(prev => ({
      ...prev,
      [selectedId]: { ...getScores(selectedId), [key]: val }
    }));
    setSaved(prev => ({ ...prev, [selectedId]: false }));
  };

  // Pre-fill scores from existing judge entry
  const handleSelect = (t) => {
    setSelectedId(t._id);
    setSaveError("");
    if (!scores[t._id] && t.scores?.length > 0) {
      // Use the first score entry (will be this judge's own if backend filters correctly)
      const existing = t.scores[0];
      setScores(prev => ({
        ...prev,
        [t._id]: {
          innovation:   existing.innovation,
          feasibility:  existing.feasibility,
          technical:    existing.technical,
          presentation: existing.presentation,
          impact:       existing.impact,
        }
      }));
      setNotes(prev => ({ ...prev, [t._id]: existing.notes || "" }));
      setSaved(prev => ({ ...prev, [t._id]: true }));
    }
  };

  const handleSave = async () => {
    setSaving(true); setSaveError("");
    try {
      await evalService.score(selectedId, {
        ...getScores(selectedId),
        notes: notes[selectedId] || "",
      });
      setSaved(prev => ({ ...prev, [selectedId]: true }));
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="eval-page">
      <div className="page-header">
        <div className="page-title">Evaluation</div>
        <div className="page-subtitle">Score each team across 5 weighted criteria.</div>
      </div>

      {loading && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading teams…</div>}
      {error   && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>{error}</div>}

      <div className="eval-layout">
        {/* Team list */}
        <div className="eval-sidebar">
          <div className="form-label" style={{ padding: "0 4px 8px" }}>Teams</div>
          {teams?.map(t => (
            <button key={t._id}
              className={`eval-team-btn${selectedId === t._id ? " eval-team-btn--active" : ""}`}
              onClick={() => handleSelect(t)}>
              <div className="eval-team-dot" />
              <div className="eval-team-info">
                <div className="eval-team-name">{t.name}</div>
                <div className="eval-team-track">{t.track}</div>
              </div>
              <div className="eval-team-right">
                <div className="eval-team-score">{computeTotal(t._id)}</div>
                {saved[t._id] && <div className="eval-saved-dot" />}
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
              {/* Header */}
              <div className="eval-header">
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 2 }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
                    {team.track} · {team.members?.length ?? 0} members
                    {team.submission?.githubUrl && " · submission on record"}
                  </div>
                </div>
                <div className="eval-total-badge">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-muted)", marginBottom: 2, letterSpacing: 2, textTransform: "uppercase" }}>Total</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>{computeTotal(team._id)}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-muted)" }}>/ 100</div>
                </div>
              </div>

              {/* Sliders */}
              <div className="eval-criteria">
                {CRITERIA.map(c => (
                  <ScoreSlider key={c.key}
                    label={c.label} weight={c.weight} desc={c.desc}
                    value={getScores(team._id)[c.key]}
                    onChange={v => setScore(c.key, v)}
                  />
                ))}
              </div>

              {/* Links */}
              <div className="eval-links">
                {team.submission?.githubUrl && (
                  <a href={team.submission.githubUrl} target="_blank" rel="noreferrer" className="btn btn--outline">REPO ↗</a>
                )}
                {team.submission?.pptUrl && (
                  <a href={team.submission.pptUrl} target="_blank" rel="noreferrer" className="btn btn--outline">PPT ↗</a>
                )}
                {team.submission?.demoUrl && (
                  <a href={team.submission.demoUrl} target="_blank" rel="noreferrer" className="btn btn--outline">DEMO ↗</a>
                )}
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Notes (internal)</label>
                <textarea className="form-textarea" rows={3} placeholder="internal notes…"
                  value={notes[team._id] || ""}
                  onChange={e => setNotes(prev => ({ ...prev, [team._id]: e.target.value }))}
                />
              </div>

              {saveError && (
                <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 10 }}>{saveError}</div>
              )}

              <button className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}
                onClick={handleSave} disabled={saving}>
                {saving ? "saving…" : saved[team._id] ? "✓ SAVED — UPDATE" : "SAVE SCORE"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
