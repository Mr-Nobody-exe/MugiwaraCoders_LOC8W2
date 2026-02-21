/**
 * TeamModal.jsx
 *
 * Full-screen modal shown when a team cluster is clicked.
 * Three tabs:
 *   INFO   — description, tech stack, mentor, commit activity
 *   REPO   — fake GitHub file tree, stat tiles, open link
 *   DEMO   — video player (or "no demo yet" placeholder)
 *
 * Props:
 *   team    {Team|null}
 *   onClose {() => void}
 */
import { useState, useEffect } from "react";
import { HumanSprite } from "./HumanSprite";
import { TRACK_COLORS, STATUS_COLORS } from "../data/teams";
import "../styles/TeamModal.css";

const TABS = [
  { id: "info",   label: "📋 INFO"  },
  { id: "github", label: "⚙️ REPO"  },
  { id: "demo",   label: "🎬 DEMO"  },
];

const FILE_TREE = [
  { name: "📁  src",          type: "dir"  },
  { name: "📁  api",          type: "dir"  },
  { name: "📁  models",       type: "dir"  },
  { name: "📄  README.md",    type: "file" },
  { name: "📄  package.json", type: "file" },
];

/**
 * Derives the number of hourly slots from HACKATHON_META.startTime / endTime.
 * Falls back to 48 h if the meta fields aren't present.
 */
function getHackathonHours() {
  const { startTime, endTime } = HACKATHON_META;
  if (startTime && endTime) {
    const ms = new Date(endTime) - new Date(startTime);
    return Math.max(1, Math.round(ms / 3_600_000));
  }
  return 48; // default: Nov 14-16 = 48 h
}

/**
 * Distributes `commits` across `slots` hourly buckets with a
 * realistic curve — slow start, ramp in the middle, spike near the end.
 */
function mockHourlyBuckets(commits, slots) {
  // Weight curve: low early, high at ~80% mark (crunch time), moderate at end
  const weights = Array.from({ length: slots }, (_, i) => {
    const t = i / (slots - 1); // 0 → 1
    return (
      0.05 +
      2.5 * Math.pow(t, 2) * Math.exp(-2.5 * Math.pow(t - 0.78, 2)) +
      0.3 * Math.random()
    );
  });

  const total = weights.reduce((s, w) => s + w, 0);
  let allocated = 0;
  const buckets = weights.map((w, i) => {
    if (i === slots - 1) return Math.max(0, commits - allocated);
    const val = Math.round((w / total) * commits);
    allocated += val;
    return val;
  });
  return buckets;
}

export function TeamModal({ team, onClose }) {
  const [tab,     setTab]     = useState("info");
  const [playing, setPlaying] = useState(false);
  const [buckets, setBuckets] = useState([]);

  const totalHours = useMemo(() => getHackathonHours(), []);

  // Reset state whenever the selected team changes
  useEffect(() => {
    setTab("info");
    setPlaying(false);
    if (team) setBuckets(mockHourlyBuckets(team.commits ?? 0, totalHours));
  }, [team?.id, totalHours]);

  if (!team) return null;

  const statusColor = STATUS_COLORS[team.status] || "#4ade80";
  const trackColor  = TRACK_COLORS[team.track]   || team.color;
  const commits     = team.commits ?? 0;
  const maxBucket   = Math.max(...buckets, 1);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        className="modal-panel"
        style={{
          border:     `1px solid ${team.color}40`,
          boxShadow:  `0 0 80px ${team.color}18, 0 40px 100px rgba(0,0,0,0.7)`,
        }}
      >
        {/* ── Header ── */}
        <div
          className="modal-header"
          style={{
            background:   `linear-gradient(135deg, ${team.color}14, rgba(0,0,0,0.4))`,
            borderBottom: `1px solid ${team.color}28`,
          }}
        >
          {/* Sprite row */}
          <div className="modal-header__sprites">
            {Array.from({ length: Math.min(team.members, 5) }).map((_, i) => (
              <div
                key={i}
                style={{ filter: `drop-shadow(0 0 4px ${team.color}60)` }}
              >
                <HumanSprite
                  skin={team.skinTones[i % team.skinTones.length]}
                  shirt={team.shirtColors[i % team.shirtColors.length]}
                  shadow={false}
                  scale={1.3}
                  walking
                />
              </div>
            ))}
          </div>

          {/* Meta */}
          <div className="modal-header__meta">
            <div className="modal-header__title-row">
              <h2
                className="modal-header__name"
                style={{ color: team.color, textShadow: `0 0 16px ${team.color}50` }}
              >
                {team.name}
              </h2>
              <span
                className="modal-header__status"
                style={{
                  color:      statusColor,
                  background: `${statusColor}15`,
                  border:     `1px solid ${statusColor}40`,
                }}
              >
                {team.status}
              </span>
            </div>
            <div className="modal-header__details">
              <span style={{ color: trackColor }}>⚡ {team.track}</span>
              <span>👥 {team.members} members</span>
              <span>
                ⌨️ <strong style={{ color: team.color }}>{commits}</strong> commits
              </span>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className="modal-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`modal-tab${tab === t.id ? " modal-tab--active" : ""}`}
              style={{ "--tab-color": team.color }}
              onClick={() => { setTab(t.id); if (t.id !== "demo") setPlaying(false); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="modal-body">

          {/* INFO */}
          {tab === "info" && (
            <div className="fade-in">
              <p className="modal-description">{team.description}</p>

              <div className="modal-section-label">TECH STACK</div>
              <div className="modal-tech-stack">
                {team.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="modal-tech-badge"
                    style={{
                      color:      team.color,
                      background: `${team.color}12`,
                      border:     `1px solid ${team.color}30`,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="modal-mentor-row">
                <div className="modal-mentor-avatar">🧑‍💻</div>
                <div>
                  <div className="modal-mentor-name">{team.mentor}</div>
                  <div className="modal-mentor-label">ASSIGNED MENTOR</div>
                </div>
              </div>

              {/* ── Commit activity heatmap ── */}
              <div className="modal-score-row">
                <span>Commit Activity</span>
                <span style={{ color: team.color, fontWeight: 700 }}>
                  {commits} commits · {totalHours}h hackathon
                </span>
              </div>

              {/* Hourly heatmap grid */}
              <div
                style={{
                  marginTop:    "10px",
                  background:   "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  padding:      "10px",
                  border:       `1px solid ${team.color}18`,
                }}
              >
                {/* Hour-of-day axis labels — 0 to 23 sampled every 6h */}
                <div
                  style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    marginBottom:   "5px",
                    fontSize:       "8px",
                    color:          "rgba(255,255,255,0.25)",
                    fontFamily:     "monospace",
                    letterSpacing:  "0.05em",
                    paddingRight:   "2px",
                  }}
                >
                  {Array.from({ length: Math.floor(totalHours / 6) + 1 }, (_, i) => (
                    <span key={i}>H{i * 6}</span>
                  ))}
                </div>

                {/* Heatmap cells — one cell per hour */}
                <div
                  style={{
                    display:             "grid",
                    gridTemplateColumns: `repeat(${totalHours}, 1fr)`,
                    gap:                 "2px",
                  }}
                >
                  {buckets.map((val, i) => {
                    const intensity  = maxBucket > 0 ? val / maxBucket : 0;
                    // Opacity: empty = faint tint, max = full glow
                    const opacity    = intensity < 0.01 ? 0.07 : 0.15 + intensity * 0.85;
                    const glowRadius = intensity > 0.6 ? `0 0 ${Math.round(intensity * 8)}px ${team.color}` : "none";

                    return (
                      <div
                        key={i}
                        title={`H${i}: ${val} commit${val !== 1 ? "s" : ""}`}
                        style={{
                          height:       "22px",
                          borderRadius: "3px",
                          background:   team.color,
                          opacity,
                          boxShadow:    glowRadius,
                          transition:   "opacity 0.3s ease",
                          cursor:       "default",
                        }}
                      />
                    );
                  })}
                </div>

                {/* Legend */}
                <div
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "flex-end",
                    gap:            "4px",
                    marginTop:      "6px",
                  }}
                >
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                    less
                  </span>
                  {[0.07, 0.25, 0.50, 0.75, 1.0].map((o) => (
                    <div
                      key={o}
                      style={{
                        width:        "10px",
                        height:       "10px",
                        borderRadius: "2px",
                        background:   team.color,
                        opacity:      o,
                        boxShadow:    o === 1.0 ? `0 0 6px ${team.color}` : "none",
                      }}
                    />
                  ))}
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                    more
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* REPO */}
          {tab === "github" && (
            <div className="fade-in">
              <div
                className="modal-repo-card"
                style={{ border: `1px solid ${team.color}22` }}
              >
                <div
                  className="modal-repo-header"
                  style={{
                    background:   `${team.color}0a`,
                    borderBottom: `1px solid ${team.color}16`,
                  }}
                >
                  <span style={{ fontSize: 18 }}>🐙</span>
                  <div>
                    <div className="modal-repo-header-label" style={{ color: team.color }}>
                      REPOSITORY
                    </div>
                    <div className="modal-repo-url">{team.github}</div>
                  </div>
                </div>

                <div className="modal-file-tree">
                  {FILE_TREE.map((f, i) => (
                    <div
                      key={i}
                      className={`modal-file-row modal-file-row--${f.type}`}
                    >
                      {f.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-repo-stats">
                {[
                  { icon: "⭐", label: "Stars",   value: 8  + team.id    },
                  { icon: "🍴", label: "Forks",   value: 2  + team.id    },
                  { icon: "📝", label: "Commits", value: commits          },
                ].map((s) => (
                  <div key={s.label} className="modal-stat-tile">
                    <div className="modal-stat-tile__icon">{s.icon}</div>
                    <div className="modal-stat-tile__value" style={{ color: team.color }}>
                      {s.value}
                    </div>
                    <div className="modal-stat-tile__label">{s.label}</div>
                  </div>
                ))}
              </div>

              <a
                href={team.github}
                target="_blank"
                rel="noreferrer"
                className="modal-gh-btn"
                style={{
                  background: `linear-gradient(135deg, ${team.color}, ${team.color}99)`,
                  color: "#000",
                }}
              >
                OPEN ON GITHUB →
              </a>
            </div>
          )}

          {/* DEMO */}
          {tab === "demo" && (
            <div className="fade-in">
              {team.demoVideo ? (
                <>
                  <div
                    className="modal-video-wrap"
                    style={{ border: `1px solid ${team.color}30` }}
                  >
                    {playing ? (
                      <video src={team.demoVideo} controls autoPlay />
                    ) : (
                      <div
                        className="modal-play-screen"
                        style={{ background: `radial-gradient(ellipse, ${team.color}14, #000)` }}
                        onClick={() => setPlaying(true)}
                      >
                        <div
                          className="modal-play-btn"
                          style={{
                            background: team.color,
                            boxShadow:  `0 0 28px ${team.color}55`,
                          }}
                        >
                          ▶
                        </div>
                        <div className="modal-play-label">PLAY DEMO</div>
                      </div>
                    )}
                  </div>

                  <div
                    className="modal-video-meta"
                    style={{
                      background: `${team.color}09`,
                      border:     `1px solid ${team.color}18`,
                    }}
                  >
                    🎬 Demo by{" "}
                    <strong style={{ color: team.color }}>{team.name}</strong>
                    {" · "}{team.track}
                  </div>
                </>
              ) : (
                <div className="modal-no-demo">
                  <div className="modal-no-demo__icon">📭</div>
                  <div className="modal-no-demo__title">NO DEMO YET</div>
                  <div className="modal-no-demo__sub">
                    Check back closer to submission deadline.
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}