/**
 * AdminEntryPage.jsx — terminal minimal
 */
import { useState } from "react";
import "./AdminEntryPage.css";

const MOCK_LOG = [
  { id: 1, name: "Arjun Sharma",  team: "NeuralNexus",  time: "08:12 AM", meal: { breakfast: true,  lunch: false, dinner: false } },
  { id: 2, name: "Priya Kapoor",  team: "GreenGrid",    time: "08:24 AM", meal: { breakfast: true,  lunch: true,  dinner: false } },
  { id: 3, name: "Rohan Mehta",   team: "BlockBusters", time: "08:41 AM", meal: { breakfast: false, lunch: false, dinner: false } },
  { id: 4, name: "Sneha Patil",   team: "SpaceSync",    time: "09:01 AM", meal: { breakfast: true,  lunch: false, dinner: false } },
  { id: 5, name: "Karan Iyer",    team: "MediMesh",     time: "09:15 AM", meal: { breakfast: true,  lunch: true,  dinner: false } },
];

function Scanner({ onScan, label }) {
  const [val, setVal] = useState("");
  const submit = (e) => { e.preventDefault(); onScan(val); setVal(""); };
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
        <input className="form-input" placeholder="paste QR code or use scanner…" value={val} onChange={e => setVal(e.target.value)} />
        <button className="btn btn--primary" type="submit">SCAN</button>
      </form>
    </div>
  );
}

export default function AdminEntryPage() {
  const [tab,      setTab]      = useState("entry");
  const [log]                   = useState(MOCK_LOG);
  const [scanMsg,  setScanMsg]  = useState(null);
  const [mealType, setMealType] = useState("breakfast");

  const showMsg = (text) => { setScanMsg(text); setTimeout(() => setScanMsg(null), 3000); };

  const bf = log.filter(e => e.meal.breakfast).length;
  const ln = log.filter(e => e.meal.lunch).length;
  const dn = log.filter(e => e.meal.dinner).length;

  const howItWorks = tab === "entry"
    ? ["Participant opens HackX app → QR Pass screen",
       "Scan the Entry Pass QR using this terminal",
       "System verifies identity and logs attendance",
       "Each QR can only be scanned once — no duplicates"]
    : ["Each participant gets 3 one-time meal QRs",
       "Each QR is single-use and time-restricted",
       "Select the correct meal type before scanning",
       "Already-used QRs are automatically rejected"];

  return (
    <div className="entry-page">
      <div className="page-header">
        <div className="page-title">Entry & Food</div>
        <div className="page-subtitle">Scan participant QR codes at the gate and food counters.</div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        {[
          { icon: "○", label: "Checked In", value: log.length },
          { icon: "○", label: "Breakfast",  value: bf },
          { icon: "○", label: "Lunch",      value: ln },
          { icon: "○", label: "Dinner",     value: dn },
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

      {scanMsg && <div className="scan-msg">{scanMsg}</div>}

      <div className="team-tabs">
        {[["entry","Gate Entry"], ["meals","Meal Counter"], ["log","Log"]].map(([v, l]) => (
          <button key={v} className={`team-tab${tab === v ? " team-tab--active" : ""}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === "entry" && (
        <div className="entry-scanner-wrap">
          <Scanner onScan={code => showMsg(`✓ Entry granted — ${code.slice(0,18)}…`)} label="SCAN ENTRY QR" />
          <div className="card entry-info">
            <div className="card-title">How it works</div>
            <ol className="entry-steps">
              {howItWorks.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        </div>
      )}

      {tab === "meals" && (
        <div className="entry-scanner-wrap">
          <div>
            <div className="meal-picker">
              {["breakfast","lunch","dinner"].map(m => (
                <button key={m} className={`meal-pick-btn${mealType === m ? " meal-pick-btn--active" : ""}`}
                  onClick={() => setMealType(m)}>
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            <Scanner onScan={code => showMsg(`✓ ${mealType} recorded — ${code.slice(0,18)}…`)} label={`SCAN ${mealType.toUpperCase()} QR`} />
          </div>
          <div className="card entry-info">
            <div className="card-title">Meal QR rules</div>
            <ol className="entry-steps">
              {howItWorks.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        </div>
      )}

      {tab === "log" && (
        <div className="card">
          <div className="card-title">Attendance Log</div>
          <table className="data-table">
            <thead>
              <tr><th>Participant</th><th>Team</th><th>Entry</th><th>BF</th><th>LN</th><th>DN</th></tr>
            </thead>
            <tbody>
              {log.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td style={{ color: "var(--color-muted)" }}>{e.team}</td>
                  <td>{e.time}</td>
                  {["breakfast","lunch","dinner"].map(m => (
                    <td key={m} style={{ color: e.meal[m] ? "var(--color-text)" : "var(--color-dim)" }}>
                      {e.meal[m] ? "✓" : "—"}
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
