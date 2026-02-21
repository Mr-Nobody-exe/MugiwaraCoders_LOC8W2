import { useState, useEffect } from "react";
import { qrService, userService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import "./AdminEntryPage.css";

/* The scanner takes a plain userId typed/pasted in — in production
   you'd decode the QR image to extract userId with a library like jsQR */
function Scanner({ onScan, label }) {
  const [val, setVal] = useState("");
  const submit = (e) => { e.preventDefault(); if (val.trim()) { onScan(val.trim()); setVal(""); } };
  return (
    <div className="scanner-box">
      <div className="scanner-label">{label}</div>
      <div className="scanner-anim">
        <div className="scanner-beam" />
        <div className="scanner-corner tl" /><div className="scanner-corner tr" />
        <div className="scanner-corner bl" /><div className="scanner-corner br" />
        <div className="scanner-icon">▣</div>
      </div>
      <form onSubmit={submit} className="scanner-form">
        <input className="form-input" placeholder="participant user ID…" value={val}
          onChange={e => setVal(e.target.value)} />
        <button className="btn btn--primary" type="submit">SCAN</button>
      </form>
    </div>
  );
}

export default function AdminEntryPage() {
  const [tab,      setTab]      = useState("entry");
  const [mealType, setMealType] = useState("breakfast");
  const [scanMsg,  setScanMsg]  = useState({ text: "", ok: true });

  const { data: stats, refetch: refetchStats } = useApi(() => qrService.getMealStats());
  const { data: log,   loading: logLoading, refetch: refetchLog } = useApi(() => qrService.getEntryLog());

  const showMsg = (text, ok = true) => {
    setScanMsg({ text, ok });
    setTimeout(() => setScanMsg({ text: "", ok: true }), 4000);
  };

  const handleEntryScan = async (userId) => {
    try {
      const { data } = await qrService.scanEntry(userId);
      showMsg(data.message, true);
      refetchStats(); refetchLog();
    } catch (err) {
      showMsg(err?.response?.data?.message || "Scan failed", false);
    }
  };

  const handleMealScan = async (userId) => {
    try {
      const { data } = await qrService.scanMeal(userId, mealType);
      showMsg(data.message, true);
      refetchStats(); refetchLog();
    } catch (err) {
      showMsg(err?.response?.data?.message || "Scan failed", false);
    }
  };

  const TABS = [["entry","Gate Entry"],["meals","Meal Counter"],["log","Log"]];

  return (
    <div className="entry-page">
      <div className="page-header">
        <div className="page-title">Entry &amp; Food</div>
        <div className="page-subtitle">Scan participant IDs at the gate and food counters.</div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        {[
          { icon: "○", label: "Checked In", value: stats?.checkedIn ?? "—" },
          { icon: "○", label: "Breakfast",  value: stats?.breakfast  ?? "—" },
          { icon: "○", label: "Lunch",      value: stats?.lunch      ?? "—" },
          { icon: "○", label: "Dinner",     value: stats?.dinner     ?? "—" },
        ].map(s => (
          <div className="stat-tile" key={s.label}>
            <div className="stat-tile__icon">{s.icon}</div>
            <div>
              <div className="stat-tile__value">{s.value}</div>
              <div className="stat-tile__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scan feedback */}
      {scanMsg.text && (
        <div className="scan-msg" style={{ borderColor: scanMsg.ok ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)" }}>
          {scanMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="team-tabs">
        {TABS.map(([v, l]) => (
          <button key={v}
            className={`team-tab${tab === v ? " team-tab--active" : ""}`}
            onClick={() => setTab(v)}>
            {l}
          </button>
        ))}
      </div>

      {tab === "entry" && (
        <div className="entry-scanner-wrap">
          <Scanner onScan={handleEntryScan} label="SCAN ENTRY — paste user ID" />
          <div className="card entry-info">
            <div className="card-title">How it works</div>
            <ol className="entry-steps">
              <li>Participant shows their QR pass in the app</li>
              <li>Decode QR to get their user ID and paste it here</li>
              <li>System marks them as checked in and logs the time</li>
              <li>Each entry QR is one-time use — duplicates are rejected</li>
            </ol>
          </div>
        </div>
      )}

      {tab === "meals" && (
        <div className="entry-scanner-wrap">
          <div>
            <div className="meal-picker">
              {["breakfast","lunch","dinner"].map(m => (
                <button key={m}
                  className={`meal-pick-btn${mealType === m ? " meal-pick-btn--active" : ""}`}
                  onClick={() => setMealType(m)}>
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            <Scanner onScan={handleMealScan} label={`SCAN ${mealType.toUpperCase()} — paste user ID`} />
          </div>
          <div className="card entry-info">
            <div className="card-title">Meal QR rules</div>
            <ol className="entry-steps">
              <li>Select the correct meal before scanning</li>
              <li>Paste the participant user ID from their QR</li>
              <li>Each meal QR is single-use per person</li>
              <li>Already-used meals are rejected automatically</li>
            </ol>
          </div>
        </div>
      )}

      {tab === "log" && (
        <div className="card">
          <div className="card-title">Attendance Log</div>
          {logLoading && <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading…</div>}
          <table className="data-table">
            <thead>
              <tr>
                <th>Participant</th><th>Team</th><th>Entry Time</th>
                <th>BF</th><th>LN</th><th>DN</th>
              </tr>
            </thead>
            <tbody>
              {(log ?? []).map(e => (
                <tr key={e._id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td style={{ color: "var(--color-muted)" }}>{e.team?.name ?? "—"}</td>
                  <td style={{ fontSize: 11 }}>
                    {e.entry ? new Date(e.entry).toLocaleTimeString() : "—"}
                  </td>
                  {["breakfast","lunch","dinner"].map(m => (
                    <td key={m} style={{ color: e[m] ? "var(--color-text)" : "var(--color-dim)" }}>
                      {e[m] ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
