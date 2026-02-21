/**
 * App.jsx  —  HackX World Map root
 *
 * Wires together all components and hooks:
 *   useCamera  → pan / viewport
 *   useWander  → autonomous character movement
 *
 * SVG world renders inside a full-screen div.
 * HUD elements (TopHud, Roster, Minimap) are fixed overlays.
 * TeamModal is portal-like (fixed, z-index 600).
 */
import { useState } from "react";

import { TEAMS, WORLD_W, WORLD_H, HACKATHON_META } from "./data/teams";
import { useCamera }         from "./hooks/useCamera";
import { useWander }         from "./hooks/useWander";

import { WorldBackground }   from "./components/WorldBackground";
import { TeamCluster }       from "./components/TeamCluster";
import { HumanSprite }       from "./components/HumanSprite"; // eslint-disable-line no-unused-vars (used by Roster via import)
import { Minimap }           from "./components/Minimap";
import { TopHud }            from "./components/TopHud";
import { Roster }            from "./components/Roster";
import { TeamModal }         from "./components/TeamModal";

import "./styles/global.css";
import "./styles/animations.css";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [hovered,  setHovered]  = useState(null);

  const {
    camX, camY, vpSize, isDragging,
    focusTeam, onMouseDown, onMouseMove, onMouseUp,
  } = useCamera();

  const { offsets } = useWander();

  const selectedTeam = selected ? TEAMS.find((t) => t.id === selected) : null;

  const handleSelectTeam = (team) => {
    setSelected(team.id);
    focusTeam(team);
    setHovered(null);
  };

  const handleCloseModal = () => setSelected(null);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "var(--color-bg)",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      {/* ── SVG World ── */}
      <svg
        width={vpSize.w}
        height={vpSize.h}
        style={{ position: "absolute", inset: 0, display: "block" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <WorldBackground vw={vpSize.w} vh={vpSize.h} camX={camX} camY={camY} />

        {TEAMS.map((team) => {
          const off = offsets.find((o) => o.id === team.id) ?? { ox: 0, oy: 0 };
          return (
            <g key={team.id} data-team={team.id}>
              <TeamCluster
                team={team}
                selected={selected === team.id}
                hovered={hovered  === team.id}
                offX={off.ox - camX}
                offY={off.oy - camY}
                onClick={() => handleSelectTeam(team)}
              />
            </g>
          );
        })}

        {/* Vignette overlay */}
        <defs>
          <radialGradient id="vig" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="transparent"       />
            <stop offset="100%" stopColor="rgba(0,0,0,0.62)"  />
          </radialGradient>
        </defs>
        <rect width={vpSize.w} height={vpSize.h} fill="url(#vig)" pointerEvents="none" />
      </svg>

      {/* ── Fixed HUD overlays ── */}
      <TopHud teams={TEAMS} meta={HACKATHON_META} />

      <Roster
        teams={TEAMS}
        selected={selected}
        hovered={hovered}
        onSelect={handleSelectTeam}
        onHover={setHovered}
      />

      <Minimap
        teams={TEAMS}
        selected={selected}
        camX={camX}
        camY={camY}
        vpW={vpSize.w}
        vpH={vpSize.h}
        worldW={WORLD_W}
        worldH={WORLD_H}
        onClickTeam={handleSelectTeam}
      />

      {/* ── Team detail modal ── */}
      {selectedTeam && (
        <TeamModal team={selectedTeam} onClose={handleCloseModal} />
      )}
    </div>
  );
}
