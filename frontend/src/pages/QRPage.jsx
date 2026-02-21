/**
 * QRPage.jsx — Participant view
 * Shows the participant's unique entry QR and 3 meal QR codes.
 */
import { useState } from "react";
import "./QRPage.css";

const MOCK_QR_DATA = {
  entry: "HX2025-ENTRY-U001-SECURE",
  meals: {
    breakfast: { code: "HX2025-BF-U001", used: false, time: "7:30 AM – 9:00 AM" },
    lunch:     { code: "HX2025-LN-U001", used: false, time: "12:30 PM – 2:00 PM" },
    dinner:    { code: "HX2025-DN-U001", used: false, time: "7:00 PM – 8:30 PM"  },
  },
};

/** Renders a basic SVG QR placeholder (real QR would use qrcode.react) */
function QRCodeBox({ value, color = "#00f5c4", size = 160 }) {
  // Deterministic grid from hash of value
  const cells = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const on = ((r * 31 + c * 17 + value.charCodeAt((r + c) % value.length)) % 3) !== 0;
      cells.push({ r, c, on });
    }
  }
  const cell = size / 10;
  return (
    <svg width={size} height={size} style={{ display: "block", borderRadius: 6 }}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map(({ r, c, on }, i) =>
        on ? <rect key={i} x={c * cell + 2} y={r * cell + 2} width={cell - 2} height={cell - 2} rx="1.5" fill={color} /> : null
      )}
      {/* Corner squares */}
      {[[0,0],[0,7],[7,0]].map(([r,c], i) => (
        <g key={i}>
          <rect x={c*cell} y={r*cell} width={cell*3} height={cell*3} fill={color} rx="3" />
          <rect x={c*cell+cell*0.5} y={r*cell+cell*0.5} width={cell*2} height={cell*2} fill="#fff" rx="2" />
          <rect x={c*cell+cell} y={r*cell+cell} width={cell} height={cell} fill={color} rx="1" />
        </g>
      ))}
    </svg>
  );
}

export default function QRPage() {
  const [meals, setMeals] = useState(MOCK_QR_DATA.meals);

  // For demo — simulate scanning
  const markUsed = (meal) => {
    setMeals(prev => ({ ...prev, [meal]: { ...prev[meal], used: true } }));
  };

  const mealEntries = Object.entries(meals);

  return (
    <div className="qr-page">
      <div className="page-header">
        <div className="page-title">MY QR PASS</div>
        <div className="page-subtitle">Show these QR codes at the event entry gate and food counters.</div>
      </div>

      {/* Entry QR */}
      <div className="card card--accent qr-entry-card">
        <div className="qr-entry-left">
          <div className="qr-entry-title">ENTRY PASS</div>
          <div className="qr-entry-name">Arjun Sharma</div>
          <div className="qr-entry-team">Team: NeuralNexus · AI/ML</div>
          <div className="qr-entry-event">HackX 2025 — DJSCE</div>
          <div className="qr-entry-note">
            🔒 This QR is dynamic and linked to your verified profile.<br />
            It will be scanned once at the main gate.
          </div>
          <div className="qr-valid-badge">✓ VERIFIED</div>
        </div>
        <div className="qr-entry-right">
          <QRCodeBox value={MOCK_QR_DATA.entry} color="#00f5c4" size={180} />
          <div className="qr-code-text">{MOCK_QR_DATA.entry.slice(0, 18)}…</div>
        </div>
      </div>

      {/* Meal QRs */}
      <div className="qr-meals-title">MEAL PASSES (ONE-TIME USE)</div>
      <div className="qr-meals-grid">
        {mealEntries.map(([meal, data]) => {
          const icons = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };
          const colors = { breakfast: "#fb923c", lunch: "#38bdf8", dinner: "#7b5cfa" };
          return (
            <div key={meal} className={`card qr-meal-card ${data.used ? "qr-meal-card--used" : ""}`}>
              <div className="qr-meal-icon">{icons[meal]}</div>
              <div className="qr-meal-label">{meal.toUpperCase()}</div>
              <div className="qr-meal-time">{data.time}</div>

              {data.used ? (
                <div className="qr-meal-used">
                  <div className="qr-used-stamp">USED</div>
                  <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 6 }}>This coupon has been scanned.</div>
                </div>
              ) : (
                <>
                  <QRCodeBox value={data.code} color={colors[meal]} size={130} />
                  <div className="qr-code-text">{data.code}</div>
                  {/* Dev-only simulate button */}
                  <button className="btn btn--outline" style={{ marginTop: 10, fontSize: 6, padding: "4px 10px" }}
                    onClick={() => markUsed(meal)}>
                    SIMULATE SCAN (DEV)
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="qr-note">
        ⚠️ Do not share your QR codes. Each code is tied to your verified identity and works only once.
      </div>
    </div>
  );
}
