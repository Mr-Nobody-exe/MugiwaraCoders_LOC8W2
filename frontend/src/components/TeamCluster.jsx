/**
 * TeamCluster.jsx
 *
 * Renders one team as a cluster of humanoid sprites inside the SVG world.
 * Includes:
 *   - One HumanSprite per team member
 *   - Floating name label + score pill
 *   - Track badge (visible on hover / selected)
 *   - Ground selection ring with marching-dash animation
 */
import { HumanSprite } from "./HumanSprite";
import { TRACK_COLORS } from "../data/teams";

/** Relative (x, y) offsets for each member within the cluster */
const MEMBER_OFFSETS = [
  [0, 0],
  [24, -6],
  [-20, 8],
  [10, 22],
  [-12, -16],
  [28, 18],
];

/**
 * Props:
 *   team     {object}  Team data object
 *   selected {bool}
 *   hovered  {bool}
 *   offX     {number}  Camera-adjusted x translation (wander + cam offset)
 *   offY     {number}  Camera-adjusted y translation
 *   onClick  {fn}
 */
export function TeamCluster({ team, selected, hovered, offX, offY, onClick }) {
  const { members, name, track, score, color, skinTones, shirtColors } = team;
  const labelW = name.length * 7.4 + 12;
  const trackColor = TRACK_COLORS[track] || color;
  const active = selected || hovered;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Ground glow */}
      {active && (
        <ellipse
          cx={team.x + offX + 10}
          cy={team.y + offY + 34}
          rx={members * 16 + 14}
          ry={14}
          fill={color}
          opacity={selected ? 0.1 : 0.06}
        />
      )}

      {/* Marching selection ring */}
      {selected && (
        <ellipse
          cx={team.x + offX + 10}
          cy={team.y + offY + 34}
          rx={members * 16 + 14}
          ry={14}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="5,3"
          opacity="0.75"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0" to="16"
            dur="1s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}

      {/* Member sprites */}
      {Array.from({ length: members }).map((_, i) => {
        const [ox, oy] = MEMBER_OFFSETS[i] ?? [0, 0];
        return (
          <g
            key={i}
            transform={`translate(${team.x + offX + ox - 10}, ${team.y + offY + oy})`}
            style={{ filter: selected ? `drop-shadow(0 0 3px ${color}80)` : "none" }}
          >
            <HumanSprite
              skin={skinTones[i % skinTones.length]}
              shirt={shirtColors[i % shirtColors.length]}
              walking={active}
              shadow
            />
          </g>
        );
      })}

      {/* Name label */}
      <g transform={`translate(${team.x + offX + 10 - labelW / 2}, ${team.y + offY - 30})`}>
        <rect
          width={labelW} height={15} rx="3.5"
          fill="rgba(6,9,16,0.9)"
          stroke={active ? color : "rgba(255,255,255,0.11)"}
          strokeWidth={selected ? "1.5" : "0.75"}
        />
        <text
          x={labelW / 2} y="10.5"
          textAnchor="middle"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6.5,
            fill: active ? color : "rgba(255,255,255,0.8)",
          }}
        >
          {name}
        </text>
      </g>

      {/* Score pill */}
      <g transform={`translate(${team.x + offX + members * 14 + 14}, ${team.y + offY - 22})`}>
        <rect x="0" y="-10" width="24" height="13" rx="3.5" fill={color} opacity="0.95" />
        <text
          x="12" y="0"
          textAnchor="middle"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6.5, fill: "#000", fontWeight: 700 }}
        >
          {score}
        </text>
      </g>

      {/* Track badge — only while active */}
      {active && (
        <g transform={`translate(${team.x + offX + 10 - track.length * 3}, ${team.y + offY - 46})`}>
          <rect
            width={track.length * 6} height={12} rx="3"
            fill={trackColor} opacity="0.18"
            stroke={trackColor} strokeWidth="0.75" strokeOpacity="0.6"
          />
          <text
            x={track.length * 3} y="9"
            textAnchor="middle"
            style={{ fontFamily: "Syne, sans-serif", fontSize: 7.5, fill: trackColor, fontWeight: 700 }}
          >
            {track}
          </text>
        </g>
      )}
    </g>
  );
}
