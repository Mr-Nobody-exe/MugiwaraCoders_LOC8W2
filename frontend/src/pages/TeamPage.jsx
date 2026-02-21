/**
 * TeamPage.jsx — Participant view
 * Create/join a team, view current team, submit PPT + GitHub link.
 */
import { useState } from "react";
import { TEAMS } from "../data/teams";
import "./TeamPage.css";

const PS_LIST = [
  { id: "LOC8A1", title: "Swipe to Export — Intelligent Matchmaking", track: "AI/ML"   },
  { id: "LOC8A2", title: "AI Outreach Intelligence Engine",            track: "AI/ML"   },
  { id: "LOC8W1", title: "Multilingual Voice-Assisted Job Platform",   track: "Web/App" },
  { id: "LOC8W2", title: "Smart Hackathon Management System",          track: "Web/App" },
];

export default function TeamPage() {
  const [view,      setView]      = useState("myteam"); // myteam | create | join
  const [joinCode,  setJoinCode]  = useState("");
  const [psId,      setPsId]      = useState("LOC8W2");
  const [submitted, setSubmitted] = useState(false);
  const [form,      setForm]      = useState({ pptUrl: "", githubUrl: "", demoUrl: "" });
  const [createForm, setCreateForm] = useState({ name: "", track: "AI/ML" });
  const [toast,     setToast]     = useState("");

  const myTeam = TEAMS[0]; // mock — replace with user.team API call
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCF = (k) => (e) => setCreateForm((f) => ({ ...f, [k]: e.target.value }));

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with: await teamService.submitRound(myTeam.id, form);
    setSubmitted(true);
    showToast("Submission saved ✓");
  };

  const handleCreate = (e) => {
    e.preventDefault();
    // Replace with: await teamService.create(createForm);
    showToast("Team created! Share your invite code.");
    setView("myteam");
  };

  const handleJoin = (e) => {
    e.preventDefault();
    // Replace with: await teamService.join(joinCode);
    showToast("Joined team successfully!");
    setView("myteam");
  };

  return (
    <div className="team-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header">
        <div className="page-title">TEAM MANAGEMENT</div>
        <div className="page-subtitle">Manage your team, select a problem statement, and submit your work.</div>
      </div>

      {/* Sub-nav */}
      <div className="team-tabs">
        {[["myteam", "My Team"], ["create", "Create Team"], ["join", "Join Team"]].map(([v, l]) => (
          <button key={v} className={`team-tab ${view === v ? "team-tab--active" : ""}`} onClick={() => setView(v)}>{l}</button>
        ))}
      </div>

      {/* ── MY TEAM ── */}
      {view === "myteam" && (
        <div className="team-grid">
          {/* Team card */}
          <div className="card card--accent">
            <div className="team-header">
              <div className="team-color-bar" style={{ background: "var(--color-border2)" }} />
              <div>
                <div className="team-name" style={{ fontWeight: 700 }}>{myTeam.name}</div>
                <div className="team-meta">{myTeam.track} · {myTeam.members} members · <span style={{ fontWeight: 700 }}>{myTeam.score} pts</span></div>
              </div>
              <span className="badge" style={{ background: `${myTeam.color}18`, color: myTeam.color }}>{myTeam.status}</span>
            </div>

            <div className="invite-code-box">
              <span className="form-label" style={{ marginBottom: 0 }}>INVITE CODE</span>
              <div className="invite-code">
                <span>HX-{myTeam.id.toString().padStart(4, "0")}-TEAM</span>
                <button className="btn btn--outline" style={{ padding: "4px 10px", fontSize: 6 }}
                  onClick={() => { navigator.clipboard.writeText(`HX-${myTeam.id}-TEAM`); showToast("Copied!"); }}>
                  COPY
                </button>
              </div>
            </div>

            <div className="members-section">
              <div className="form-label">MEMBERS</div>
              <div className="members-grid">
                {Array.from({ length: myTeam.members }).map((_, i) => (
                  <div key={i} className="member-chip">
                    <div className="member-chip-avatar" style={{ background: `${myTeam.color}20`, color: myTeam.color }}>
                      {myTeam.skinTones[i] ? String.fromCharCode(65 + i) : "?"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>Member {i + 1}</div>
                      <div style={{ fontSize: 10, color: "var(--color-muted)" }}>participant</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ps-select-section">
              <div className="form-label">SELECTED PROBLEM STATEMENT</div>
              <select className="form-select" value={psId} onChange={(e) => setPsId(e.target.value)}>
                {PS_LIST.map((ps) => (
                  <option key={ps.id} value={ps.id}>{ps.id} — {ps.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submission form */}
          <div className="card">
            <h3 className="card-title">SUBMISSION</h3>
            {submitted && (
              <div className="submission-success">
                ✓ Submission recorded. You can update until the deadline.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">PPT / PRESENTATION URL</label>
                <input className="form-input" placeholder="https://docs.google.com/presentation/..." value={form.pptUrl} onChange={set("pptUrl")} />
              </div>
              <div className="form-group">
                <label className="form-label">GITHUB REPOSITORY URL *</label>
                <input className="form-input" placeholder="https://github.com/yourteam/project" value={form.githubUrl} onChange={set("githubUrl")} required />
              </div>
              <div className="form-group">
                <label className="form-label">DEMO VIDEO URL (optional)</label>
                <input className="form-input" placeholder="https://youtube.com/..." value={form.demoUrl} onChange={set("demoUrl")} />
              </div>
              <div className="submission-meta">
                <span>⏰ Deadline: Feb 22, 2025 · 11:59 PM</span>
              </div>
              <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
                {submitted ? "UPDATE SUBMISSION" : "SUBMIT →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE ── */}
      {view === "create" && (
        <div className="card" style={{ maxWidth: 480 }}>
          <h3 className="card-title">CREATE A NEW TEAM</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">TEAM NAME</label>
              <input className="form-input" placeholder="e.g. NeuralNexus" value={createForm.name} onChange={setCF("name")} required />
            </div>
            <div className="form-group">
              <label className="form-label">TRACK</label>
              <select className="form-select" value={createForm.track} onChange={setCF("track")}>
                {["AI/ML", "Web3", "CleanTech", "HealthTech", "EdTech"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
              CREATE TEAM →
            </button>
          </form>
        </div>
      )}

      {/* ── JOIN ── */}
      {view === "join" && (
        <div className="card" style={{ maxWidth: 480 }}>
          <h3 className="card-title">JOIN AN EXISTING TEAM</h3>
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label className="form-label">TEAM INVITE CODE</label>
              <input className="form-input" placeholder="HX-0001-TEAM" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
              JOIN TEAM →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
