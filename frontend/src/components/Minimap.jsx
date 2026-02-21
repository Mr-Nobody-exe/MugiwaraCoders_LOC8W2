/**
 * Minimap.jsx
 *
 * Fixed bottom-left overview map.
 * Shows team dot positions, selected-team pulse, and the current viewport rect.
 * Clicking a dot focuses the camera on that team.
 *
 * Props:
 *   teams        {Team[]}
 *   selected     {number|null}   Selected team id
 *   camX, camY   {number}        Current (clamped) camera position
 *   vpW, vpH     {number}        Viewport dimensions
 *   worldW,worldH{number}        World dimensions
 *   onClickTeam  {(team) => void}
 */
import "../styles/Minimap.css";

const MAP_W = 158;
const MAP_H = 108;

export function Minimap({ teams, selected, camX, camY, vpW, vpH, worldW, worldH, onClickTeam }) {
  const sx = MAP_W / worldW;
  const sy = MAP_H / worldH;

  return (
    <div className="minimap">
      <svg width={MAP_W} height={MAP_H}>
        {/* Background */}
        <rect width={MAP_W} height={MAP_H} fill="#08090f" />

        {/* Zone glow blobs */}
        {teams.map((t) => (
          <ellipse
            key={`glow-${t.id}`}
            cx={t.x * sx} cy={t.y * sy}
            rx={t.members * 4 + 6} ry={6}
            fill={t.color} opacity="0.06"
          />
        ))}

        {/* Team dots */}
        {teams.map((t) => {
          const isSelected = selected === t.id;
          return (
            <circle
              key={t.id}
              cx={t.x * sx} cy={t.y * sy}
              r={isSelected ? 4.5 : 2.8}
              fill={t.color}
              opacity={isSelected ? 1 : 0.7}
              style={{ cursor: "pointer" }}
              onClick={() => onClickTeam(t)}
            >
              {isSelected && (
                <animate
                  attributeName="r"
                  values="4.5;6.5;4.5"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          );
        })}

        {/* Viewport rectangle */}
        <rect
          x={camX * sx} y={camY * sy}
          width={vpW * sx} height={vpH * sy}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="0.8"
        />

        {/* Label */}
        <text
          x="5" y={MAP_H - 4}
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 4.5, fill: "rgba(255,255,255,0.2)" }}
        >
          MINIMAP
        </text>
      </svg>
    </div>
  );
}
