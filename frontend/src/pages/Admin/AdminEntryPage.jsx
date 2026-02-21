/**
 * AdminEntryPage.jsx
 * Organizer view: scan entry QRs + meal QR dashboard.
 */
import { useState } from "react";
import "./AdminEntryPage.css";

const MOCK_ENTRY_LOG = [
  { id: 1, name: "Arjun Sharma",   team: "NeuralNexus",  time: "08:12 AM", meal: { breakfast: true, lunch: false, dinner: false } },
  { id: 2, name: "Priya Kapoor",   team: "GreenGrid",    time: "08:24 AM", meal: { breakfast: true, lunch: true,  dinner: false } },
  { id: 3, name: "Rohan Mehta",    team: "BlockBusters", time: "08:41 AM", meal: { breakfast: false,lunch: false, dinner: false } },
  { id: 4, name: "Sneha Patil",    team: "SpaceSync",    time: "09:01 AM", meal: { breakfast: true, lunch: false, dinner: false } },
  { id: 5, name: "Karan Iyer",     team: "MediMesh",     time: "09:15 AM", meal: { breakfast: true, lunch: true,  dinner: false } },
];

function QRScanner({ onScan, label }) {
  const [val, setVal] = useState("");
  const handleScan = (e) => {
    e.preventDefault();
    onScan(val);
    setVal("");
  };
  return (
    <div className="scanner-box">
      <div className="scanner-label">{label}</div>
      <div className="scanner-anim">
        <div className="scanner-beam" />
        <div className="scanner-corner tl" /><div className="scanner-corner tr" />
        <div className="scanner-corner bl" /><div className="scanner-corner br" />
        <div className="scanner-icon">◫</div>
      </div>
      <form onSubmit={handleScan} className="scanner-form">
        <input className="form-input" placeholder="Paste QR code or use scanner…" value={val} onChange={e => setVal(e.target.value)} />
        <button className="btn btn--primary" type="submit">SCAN</button>
      </form>
    </div>
  );
}

export default function AdminEntryPage() {
  const [tab,       setTab]       = useState("entry");
  const [log,       setLog]       = useState(MOCK_ENTRY_LOG);
  const [scanMsg,   setScanMsg]   = useState(null);
  const [mealType,  setMealType]  = useState("breakfast");

  const totalIn  = log.length;
  const bf = log.filter(e => e.meal.breakfast).length;
  const ln = log.filter(e => e.meal.lunch).length;
  const dn = log.filter(e => e.meal.dinner).length;

  const handleEntryScan = (code) => {
    if (!code) return;
    setScanMsg({ type: "success", text: `✓ Entry granted for QR: ${code.slice(0, 18)}…` });
    setTimeout(() => setScanMsg(null), 3500);
  };

  const handleMealScan = (code) => {
    if (!code) return;
    setScanMsg({ type: "success", text: `✓ ${mealType.toUpperCase()} recorded for QR: ${code.slice(0, 18)}…` });
    setTimeout(() => setScanMsg(null), 3500);
  };

  return (
    <div className="entry-page">
      <div className="page-header">
        <div className="page-title">ENTRY &amp; FOOD MANAGEMENT</div>
        <div className="page-subtitle">Scan participant QR codes at the gate and food counters.</div>
      </div>

      {/* Stats row */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        {[
          { icon: "🚪", label: "Checked In",  value: totalIn, color: "#00f5c4" },
          { icon: "🌅", label: "Breakfast",   value: bf,      color: "#fb923c" },
          { icon: "☀️", label: "Lunch",       value: ln,      color: "#38bdf8" },
          { icon: "🌙", label: "Dinner",      value: dn,      color: "#7b5cfa" },
        ].map(s => (
          <div className="stat-tile" key={s.label}>
            <div className="stat-tile__icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
            <div>
              <div className="stat-tile__value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-tile__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scan message toast */}
      {scanMsg && (
        <div className={`scan-msg scan-msg--${scanMsg.type}`}>{scanMsg.text}</div>
      )}

      {/* Tabs */}
      <div className="team-tabs">
        {[["entry","🚪 Gate Entry"], ["meals","🍽️ Meal Counter"], ["log","📋 Entry Log"]].map(([v, l]) => (
          <button key={v} className={`team-tab ${tab === v ? "team-tab--active" : ""}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === "entry" && (
        <div className="entry-scanner-wrap">
          <QRScanner onScan={handleEntryScan} label="SCAN PARTICIPANT ENTRY QR" />
          <div className="entry-info card">
            <div className="card-title">HOW IT WORKS</div>
            <ol className="entry-steps">
              <li>Participant opens their HackX app → QR Pass screen</li>
              <li>Scan the <strong>Entry Pass QR</strong> using this terminal</li>
              <li>System verifies identity and logs attendance in real time</li>
              <li>Each QR can only be scanned <strong>once</strong> — no duplicates</li>
            </ol>
          </div>
        </div>
      )}

      {tab === "meals" && (
        <div className="entry-scanner-wrap">
          <div>
            <div className="form-label" style={{ marginBottom: 10 }}>SELECT MEAL</div>
            <div className="meal-picker">
              {["breakfast","lunch","dinner"].map(m => (
                <button key={m} className={`meal-pick-btn ${mealType === m ? "meal-pick-btn--active" : ""}`}
                  onClick={() => setMealType(m)}>
                  {m === "breakfast" ? "🌅" : m === "lunch" ? "☀️" : "🌙"} {m.toUpperCase()}
                </button>
              ))}
            </div>
            <QRScanner onScan={handleMealScan} label={`SCAN ${mealType.toUpperCase()} QR`} />
          </div>
          <div className="entry-info card">
            <div className="card-title">MEAL QR RULES</div>
            <ol className="entry-steps">
              <li>Each participant gets 3 one-time meal QRs (Breakfast / Lunch / Dinner)</li>
              <li>Each QR is single-use and time-restricted</li>
              <li>Select the correct meal type before scanning</li>
              <li>If a QR was already used — the system will reject it automatically</li>
            </ol>
          </div>
        </div>
      )}

      {tab === "log" && (
        <div className="card">
          <div className="card-title">ATTENDANCE LOG</div>
          <table className="data-table">
            <thead>
              <tr><th>PARTICIPANT</th><th>TEAM</th><th>ENTRY TIME</th><th>🌅 BF</th><th>☀️ LN</th><th>🌙 DN</th></tr>
            </thead>
            <tbody>
              {log.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 700 }}>{e.name}</td>
                  <td style={{ color: "var(--color-accent)" }}>{e.team}</td>
                  <td>{e.time}</td>
                  <td>{e.meal.breakfast ? <span style={{ color: "#4ade80" }}>✓</span> : <span style={{ color: "var(--color-muted)" }}>—</span>}</td>
                  <td>{e.meal.lunch     ? <span style={{ color: "#4ade80" }}>✓</span> : <span style={{ color: "var(--color-muted)" }}>—</span>}</td>
                  <td>{e.meal.dinner    ? <span style={{ color: "#4ade80" }}>✓</span> : <span style={{ color: "var(--color-muted)" }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
