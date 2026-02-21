/**
 * WorldBackground.jsx
 *
 * Renders the dark industrial compound background inside the SVG world.
 * Includes:
 *   - Fine dot-texture concrete floor
 *   - Subtle structural grid
 *   - Coloured ambient zone glows
 *   - Dashed zone border rectangles with labels
 *   - Workstation objects (tables with glowing screens)
 *   - Corridor paths connecting zones
 *
 * Props:
 *   vw    {number}  Viewport width
 *   vh    {number}  Viewport height
 *   camX  {number}  Camera X offset (for parallax-style pattern translation)
 *   camY  {number}  Camera Y offset
 */

const ZONES = [
  { x: 70,  y: 60,  w: 320, h: 260, label: "AI ZONE",           color: "#00f5c4" },
  { x: 480, y: 60,  w: 420, h: 300, label: "WEB3 + ALGO",        color: "#7b5cfa" },
  { x: 65,  y: 350, w: 300, h: 210, label: "CLEANTECH",          color: "#4ade80" },
  { x: 400, y: 380, w: 480, h: 210, label: "HEALTH & EDTECH",    color: "#f472b6" },
];

const WORKSTATIONS = [
  { x: 100, y: 196 }, { x: 308, y: 152 }, { x: 128, y: 390 },
  { x: 636, y: 188 }, { x: 780, y: 350 }, { x: 440, y: 468 },
  { x: 640, y: 468 }, { x: 820, y: 468 },
];

const DESK_STATUS_COLORS = ["#00f5c4", "#4ade80", "#fb923c"];

export function WorldBackground({ vw, vh, camX, camY }) {
  return (
    <g>
      <defs>
        {/* Fine dot pattern — repeats every 16 px */}
        <pattern
          id="dots" x="0" y="0" width="16" height="16"
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${(-camX) % 16},${(-camY) % 16})`}
        >
          <rect width="16" height="16" fill="#0c1019" />
          <circle cx="8" cy="8" r="0.5" fill="rgba(255,255,255,0.04)" />
        </pattern>

        {/* Structural grid — repeats every 120 px */}
        <pattern
          id="grid120" x="0" y="0" width="120" height="120"
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${(-camX) % 120},${(-camY) % 120})`}
        >
          <rect width="120" height="120" fill="none"
            stroke="rgba(255,255,255,0.035)" strokeWidth="0.75" />
        </pattern>

        {/* Zone ambient radial gradients */}
        <radialGradient id="z1" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00f5c4" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#00f5c4" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="z2" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#7b5cfa" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#7b5cfa" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="z3" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="z4" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f472b6" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0"    />
        </radialGradient>

        {/* Overall ambient background gradient */}
        <radialGradient id="ambient" cx="48%" cy="45%" r="65%">
          <stop offset="0%"   stopColor="#141a26" />
          <stop offset="100%" stopColor="#080b12" />
        </radialGradient>

        <clipPath id="worldClip">
          <rect width={vw} height={vh} />
        </clipPath>
      </defs>

      <g clipPath="url(#worldClip)">
        {/* Base gradient */}
        <rect width={vw} height={vh} fill="url(#ambient)" />

        {/* Dot texture */}
        <rect width={vw} height={vh} fill="url(#dots)" />

        {/* Structural grid */}
        <rect width={vw} height={vh} fill="url(#grid120)" />

        {/* Zone ambient glows */}
        <ellipse cx={220 - camX} cy={170 - camY} rx="180" ry="140" fill="url(#z1)" />
        <ellipse cx={620 - camX} cy={200 - camY} rx="220" ry="160" fill="url(#z2)" />
        <ellipse cx={400 - camX} cy={490 - camY} rx="200" ry="140" fill="url(#z3)" />
        <ellipse cx={830 - camX} cy={390 - camY} rx="180" ry="150" fill="url(#z4)" />

        {/* Zone border rectangles */}
        {ZONES.map((z, i) => (
          <g key={i} transform={`translate(${z.x - camX},${z.y - camY})`}>
            <rect
              width={z.w} height={z.h} rx="14"
              fill={z.color}    fillOpacity="0.018"
              stroke={z.color}  strokeOpacity="0.14"
              strokeWidth="1"   strokeDasharray="10,7"
            />
            <text
              x="11" y="15"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 6.5,
                fill: z.color,
                opacity: 0.32,
                letterSpacing: "0.8px",
              }}
            >
              {z.label}
            </text>
          </g>
        ))}

        {/* Workstation objects */}
        {WORKSTATIONS.map((obj, i) => {
          const W = 52, H = 30;
          const cx = obj.x - camX;
          const cy = obj.y - camY;
          const statusColor = DESK_STATUS_COLORS[i % DESK_STATUS_COLORS.length];
          return (
            <g key={i} transform={`translate(${cx},${cy})`}>
              {/* Table surface */}
              <rect width={W} height={H} rx="3"
                fill="#111827" stroke="rgba(255,255,255,0.07)" strokeWidth="0.75"
              />
              {/* Monitor bezel */}
              <rect x="4" y="3.5" width={W - 8} height={H - 12} rx="2.5"
                fill="#090e18" stroke="rgba(0,245,196,0.14)" strokeWidth="0.75"
              />
              {/* Screen ambient glow */}
              <rect x="4" y="3.5" width={W - 8} height={H - 12} rx="2.5"
                fill="rgba(0,245,196,0.035)"
              />
              {/* Scanlines */}
              <line x1="7" y1="9"  x2={W - 7}  y2="9"  stroke="rgba(0,245,196,0.18)" strokeWidth="0.75" />
              <line x1="7" y1="13" x2={W - 12} y2="13" stroke="rgba(0,245,196,0.10)" strokeWidth="0.75" />
              <line x1="7" y1="17" x2={W - 9}  y2="17" stroke="rgba(0,245,196,0.08)" strokeWidth="0.75" />
              {/* Status LED */}
              <circle cx={W - 6} cy="5" r="1.5" fill={statusColor} opacity="0.7" />
            </g>
          );
        })}

        {/* Corridor paths between zones */}
        {[
          `M ${230 - camX},${200 - camY} Q ${390 - camX},${240 - camY} ${560 - camX},${280 - camY}`,
          `M ${420 - camX},${480 - camY} Q ${490 - camX},${390 - camY} ${560 - camX},${280 - camY}`,
          `M ${165 - camX},${420 - camY} Q ${290 - camX},${380 - camY} ${420 - camX},${480 - camY}`,
          `M ${680 - camX},${120 - camY} Q ${720 - camX},${200 - camY} ${840 - camX},${270 - camY}`,
        ].map((d, i) => (
          <path key={i} d={d}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="22"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
    </g>
  );
}
