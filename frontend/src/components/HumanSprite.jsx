/**
 * HumanSprite.jsx
 *
 * Renders a single top-down humanoid character (Project Zomboid style).
 * All geometry is pure SVG — no external assets required.
 *
 * Props:
 *   skin    {string}  Hex skin tone
 *   shirt   {string}  Hex shirt / team colour
 *   shadow  {bool}    Whether to render the drop shadow ellipse (default true)
 *   scale   {number}  Uniform scale multiplier (default 1 → 20×30 px)
 *   walking {bool}    Activates arm/leg swing animation
 */
export function HumanSprite({ skin, shirt, shadow = true, scale = 1, walking = false }) {
  const pants = "#1e293b";
  const shoe  = "#0f172a";

  // Hair colour derived from skin tone
  const hair =
    skin === "#f1c27d" ? "#3d2b1f"
    : skin === "#e0ac69" ? "#2c1810"
    : skin === "#c68642" ? "#1e0f00"
    : "#0a0500";

  const w = 20 * scale;
  const h = 30 * scale;

  const armStyle = (side) => ({
    transformOrigin: side === "L" ? "4.6px 11.5px" : "15.4px 11.5px",
    animation: walking
      ? `${side === "L" ? "armSwingL" : "armSwingR"} 0.48s ease-in-out infinite alternate`
      : "none",
  });

  const legStyle = (side) => ({
    transformOrigin: side === "L" ? "7.8px 21px" : "12.2px 21px",
    animation: walking
      ? `${side === "L" ? "legSwingL" : "legSwingR"} 0.48s ease-in-out infinite alternate`
      : "none",
  });

  return (
    <svg width={w} height={h} viewBox="0 0 20 30" style={{ overflow: "visible" }}>
      {/* Drop shadow */}
      {shadow && (
        <ellipse cx="10" cy="29" rx="6.5" ry="1.8" fill="rgba(0,0,0,0.4)" />
      )}

      {/* Left arm */}
      <rect x="3" y="11.5" width="3.2" height="8" rx="1.6" fill={shirt} style={armStyle("L")} />

      {/* Right arm */}
      <rect x="13.8" y="11.5" width="3.2" height="8" rx="1.6" fill={shirt} style={armStyle("R")} />

      {/* Torso */}
      <rect x="5.5" y="10.5" width="9" height="10.5" rx="1.8" fill={shirt} />
      {/* Torso shading */}
      <rect x="5.5" y="10.5" width="9"   height="10.5" rx="1.8" fill="rgba(0,0,0,0.18)" />
      <rect x="5.5" y="10.5" width="3.5" height="10.5" rx="1.8" fill="rgba(255,255,255,0.06)" />

      {/* Belt */}
      <rect x="5.5" y="19.5" width="9" height="1.8" rx="0.6" fill="#0c1524" />

      {/* Left leg */}
      <rect x="6"    y="21" width="3.6" height="7.5" rx="1.5" fill={pants} style={legStyle("L")} />
      <rect x="5.8"  y="26.5" width="4" height="2.5"  rx="1.2" fill={shoe} />

      {/* Right leg */}
      <rect x="10.4" y="21" width="3.6" height="7.5" rx="1.5" fill={pants} style={legStyle("R")} />
      <rect x="10.2" y="26.5" width="4" height="2.5"  rx="1.2" fill={shoe} />

      {/* Neck */}
      <rect x="8.4" y="8" width="3.2" height="3" rx="0.8" fill={skin} />

      {/* Head */}
      <rect x="5.2" y="1.5" width="9.6" height="8.5" rx="2.8" fill={skin} />
      {/* Face shading */}
      <rect x="5.2" y="1.5" width="9.6" height="3.5" rx="2.8" fill="rgba(0,0,0,0.12)" />

      {/* Hair */}
      <rect x="5.2"  y="1.5" width="9.6" height="3.2" rx="2.5" fill={hair} />
      <rect x="5.2"  y="1.5" width="2.2" height="5.5" rx="1.2" fill={hair} />
      <rect x="12.6" y="1.5" width="2.2" height="4.5" rx="1.2" fill={hair} />

      {/* Eyes */}
      <rect x="7.4"  y="7" width="1.8" height="1.8" rx="0.6" fill="rgba(10,10,20,0.85)" />
      <rect x="10.8" y="7" width="1.8" height="1.8" rx="0.6" fill="rgba(10,10,20,0.85)" />
      {/* Eye glints */}
      <rect x="7.7"  y="7.2" width="0.5" height="0.5" fill="rgba(255,255,255,0.75)" />
      <rect x="11.1" y="7.2" width="0.5" height="0.5" fill="rgba(255,255,255,0.75)" />
    </svg>
  );
}
