/**
 * TeamModal.jsx
 *
 * Full-screen modal shown when a team cluster is clicked.
 * Three tabs:
 *   INFO   — description, tech stack, mentor, score bar
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

export function TeamModal({ team, onClose }) {
  const [tab,     setTab]     = useState("info");
  const [playing, setPlaying] = useState(false);

  // Reset state whenever the selected team changes
  useEffect(() => {
    setTab("info");
    setPlaying(false);
  }, [team?.id]);

  if (!team) return null;

  const statusColor = STATUS_COLORS[team.status] || "#4ade80";
  const trackColor  = TRACK_COLORS[team.track]   || team.color;

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
                🏆 <strong style={{ color: team.color }}>{team.score}</strong> pts
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

              <div className="modal-score-row">
                <span>Score</span>
                <span style={{ color: team.color, fontWeight: 700 }}>
                  {team.score} / 100
                </span>
              </div>
              <div className="modal-progress-bar">
                <div
                  className="modal-progress-fill"
                  style={{
                    width:      `${team.score}%`,
                    background: `linear-gradient(90deg, ${team.color}, ${team.color}88)`,
                  }}
                />
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
                  { icon: "📝", label: "Commits", value: 24 + team.score },
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
