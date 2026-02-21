import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { teamService } from "../services/api";
import "./TeamPage.css";

const PS_LIST = [
  { id: "LOC8A1", title: "Swipe to Export — Intelligent Matchmaking", track: "AI/ML"   },
  { id: "LOC8A2", title: "AI Outreach Intelligence Engine",            track: "AI/ML"   },
  { id: "LOC8W1", title: "Multilingual Voice-Assisted Job Platform",   track: "Web/App" },
  { id: "LOC8W2", title: "Smart Hackathon Management System",          track: "Web/App" },
];

export default function TeamPage() {
  const { user, refreshUser }             = useAuth();
  const [view,        setView]            = useState("myteam");
  const [myTeam,      setMyTeam]          = useState(null);
  const [teamLoading, setTeamLoading]     = useState(true);
  const [joinCode,    setJoinCode]        = useState("");
  const [psId,        setPsId]            = useState("LOC8W2");
  const [form,        setForm]            = useState({ pptUrl: "", githubUrl: "", demoUrl: "" });
  const [createForm,  setCreateForm]      = useState({ name: "", track: "AI/ML" });
  const [toast,       setToast]           = useState("");
  const [error,       setError]           = useState("");
  const [submitting,  setSubmitting]      = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const set   = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setCF = (k) => (e) => setCreateForm(f => ({ ...f, [k]: e.target.value }));

  const fetchTeam = useCallback(async () => {
    if (!user?.team) { setTeamLoading(false); return; }
    try {
      const teamId = typeof user.team === "object" ? user.team._id : user.team;
      const { data } = await teamService.getById(teamId);
      setMyTeam(data);
      if (data.submission) {
        setForm({ pptUrl: data.submission.pptUrl || "", githubUrl: data.submission.githubUrl || "", demoUrl: data.submission.demoUrl || "" });
      }
      if (data.problemStatement) setPsId(data.problemStatement);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load team");
    } finally {
      setTeamLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      await teamService.submitRound(myTeam._id, { ...form, problemStatement: psId });
      showToast("Submission saved ✓");
      fetchTeam();
    } catch (err) {
      setError(err?.response?.data?.message || "Submission failed");
    } finally { setSubmitting(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const { data } = await teamService.create(createForm);
      await refreshUser();
      setMyTeam(data);
      setView("myteam");
      showToast("Team created!");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create team");
    } finally { setSubmitting(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const { data } = await teamService.join(joinCode);
      await refreshUser();
      setMyTeam(data);
      setView("myteam");
      showToast("Joined team!");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid invite code");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="team-page">
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header">
        <div className="page-title">Team</div>
        <div className="page-subtitle">Manage your team, select a problem statement, and submit.</div>
      </div>

      <div className="team-tabs">
        {[["myteam","My Team"],["create","Create"],["join","Join"]].map(([v,l]) => (
          <button key={v} className={`team-tab${view===v?" team-tab--active":""}`} onClick={() => { setView(v); setError(""); }}>{l}</button>
        ))}
      </div>

      {error && <div style={{ border: "1px solid var(--color-border2)", padding: "9px 13px", fontSize: 11, color: "var(--color-muted)", marginBottom: 14 }}>{error}</div>}

      {/* MY TEAM */}
      {view === "myteam" && (
        teamLoading ? (
          <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading...</div>
        ) : !myTeam ? (
          <div className="card" style={{ maxWidth: 480 }}>
            <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 14 }}>
              You are not in a team yet.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn--primary" onClick={() => setView("create")}>CREATE TEAM</button>
              <button className="btn btn--outline" onClick={() => setView("join")}>JOIN TEAM</button>
            </div>
          </div>
        ) : (
          <div className="team-grid">
            <div className="card card--accent">
              <div className="team-header">
                <div className="team-color-bar" />
                <div>
                  <div className="team-name">{myTeam.name}</div>
                  <div className="team-meta">{myTeam.track} · {myTeam.members?.length} members · {myTeam.finalScore} pts</div>
                </div>
                <span className="badge">{myTeam.status}</span>
              </div>

              <div className="invite-code-box">
                <span className="form-label" style={{ marginBottom: 0 }}>Invite Code</span>
                <div className="invite-code">
                  <span>{myTeam.inviteCode}</span>
                  <button className="btn btn--outline" style={{ padding: "4px 10px" }}
                    onClick={() => { navigator.clipboard.writeText(myTeam.inviteCode); showToast("Copied!"); }}>
                    COPY
                  </button>
                </div>
              </div>

              <div className="members-section">
                <div className="form-label">Members</div>
                <div className="members-grid">
                  {myTeam.members?.map((m, i) => (
                    <div key={m._id} className="member-chip">
                      <div className="member-chip-avatar">{m.avatar || String.fromCharCode(65+i)}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: "var(--color-muted)" }}>{m.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Problem Statement</label>
                <select className="form-select" value={psId} onChange={e => setPsId(e.target.value)}>
                  {PS_LIST.map(ps => <option key={ps.id} value={ps.id}>{ps.id} — {ps.title}</option>)}
                </select>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Submission</div>
              {myTeam.submission?.githubUrl && (
                <div className="submission-success">✓ Submission on record. Update any time before the deadline.</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">PPT URL</label>
                  <input className="form-input" placeholder="https://docs.google.com/..." value={form.pptUrl} onChange={set("pptUrl")} />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub URL *</label>
                  <input className="form-input" placeholder="https://github.com/team/project" value={form.githubUrl} onChange={set("githubUrl")} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Demo Video URL</label>
                  <input className="form-input" placeholder="https://youtube.com/..." value={form.demoUrl} onChange={set("demoUrl")} />
                </div>
                <div className="submission-meta">⏰ Deadline: Feb 22 · 11:59 PM</div>
                <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={submitting}>
                  {submitting ? "..." : myTeam.submission?.githubUrl ? "UPDATE →" : "SUBMIT →"}
                </button>
              </form>
            </div>
          </div>
        )
      )}

      {view === "create" && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-title">Create Team</div>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input className="form-input" placeholder="e.g. NeuralNexus" value={createForm.name} onChange={setCF("name")} required />
            </div>
            <div className="form-group">
              <label className="form-label">Track</label>
              <select className="form-select" value={createForm.track} onChange={setCF("track")}>
                {["AI/ML","Web3","CleanTech","HealthTech","EdTech"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={submitting}>
              {submitting ? "..." : "CREATE →"}
            </button>
          </form>
        </div>
      )}

      {view === "join" && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-title">Join Team</div>
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label className="form-label">Invite Code</label>
              <input className="form-input" placeholder="HX-XXXXXX" value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={submitting}>
              {submitting ? "..." : "JOIN →"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
