import { useEffect, useState } from "react";
import { qrService } from "../services/api";
import "./QRPage.css";

/* Real QR codes from backend come as PNG data URLs — render them directly as <img> */
function QRImg({ dataUrl, size = 160 }) {
  if (!dataUrl) return (
    <div style={{
      width: size, height: size,
      border: "1px solid var(--color-border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, color: "var(--color-dim)"
    }}>
      generating…
    </div>
  );
  return <img src={dataUrl} alt="QR code" width={size} height={size} style={{ display: "block", imageRendering: "pixelated" }} />;
}

export default function QRPage() {
  const [qrData,  setQrData]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    qrService.getMyQR()
      .then(res => setQrData(res.data))
      .catch(err => setError(err?.response?.data?.message || "Failed to load QR codes"))
      .finally(() => setLoading(false));
  }, []);

  const MEALS = [
    { key: "breakfast", label: "Breakfast", icon: "○", time: "7:30 AM – 9:00 AM"   },
    { key: "lunch",     label: "Lunch",     icon: "○", time: "12:30 PM – 2:00 PM"  },
    { key: "dinner",    label: "Dinner",    icon: "○", time: "7:00 PM – 8:30 PM"   },
  ];

  if (loading) return (
    <div className="qr-page">
      <div className="page-header"><div className="page-title">QR Pass</div></div>
      <div style={{ color: "var(--color-muted)", fontSize: 12 }}>loading your QR codes…</div>
    </div>
  );

  if (error) return (
    <div className="qr-page">
      <div className="page-header"><div className="page-title">QR Pass</div></div>
      <div style={{ color: "var(--color-muted)", fontSize: 12 }}>{error}</div>
    </div>
  );

  return (
    <div className="qr-page">
      <div className="page-header">
        <div className="page-title">QR Pass</div>
        <div className="page-subtitle">Show these at the event gate and food counters.</div>
      </div>

      {/* Entry QR */}
      <div className="card card--accent qr-entry-card">
        <div className="qr-entry-left">
          <div className="qr-entry-title">Entry Pass</div>
          <div className="qr-entry-name">{qrData?.entry?.checkedInAt ? "Checked In ✓" : "Not Yet Scanned"}</div>
          <div className="qr-entry-event">HackX 2025 · DJSCE</div>
          <div className="qr-entry-note">
            Scan once at the main gate.<br />
            This QR is tied to your verified account.
          </div>
          <div className="qr-valid-badge">
            {qrData?.entry?.used ? "✓ USED" : "✓ READY"}
          </div>
        </div>
        <div className="qr-entry-right">
          <QRImg dataUrl={qrData?.entry?.dataUrl} size={180} />
        </div>
      </div>

      {/* Meal QRs */}
      <div className="qr-meals-title">Meal Passes — one-time use each</div>
      <div className="qr-meals-grid">
        {MEALS.map(m => {
          const meal = qrData?.[m.key];
          return (
            <div key={m.key} className={`card qr-meal-card${meal?.used ? " qr-meal-card--used" : ""}`}>
              <div className="qr-meal-icon">{m.icon}</div>
              <div className="qr-meal-label">{m.label}</div>
              <div className="qr-meal-time">{m.time}</div>
              {meal?.used ? (
                <div className="qr-meal-used">
                  <div className="qr-used-stamp">USED</div>
                  <div style={{ fontSize: 10, color: "var(--color-dim)", marginTop: 8 }}>Already scanned.</div>
                </div>
              ) : (
                <QRImg dataUrl={meal?.dataUrl} size={130} />
              )}
            </div>
          );
        })}
      </div>

      <div className="qr-note">Do not share your QR codes. Each is single-use and identity-linked.</div>
    </div>
  );
}
