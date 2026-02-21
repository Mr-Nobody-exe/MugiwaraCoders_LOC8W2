/**
 * Roster.jsx
 *
 * Fixed right-side commit leaderboard panel.
 * Teams sorted by commit count descending, each row has a tiny HumanSprite.
 * Clicking a row focuses camera on that team and selects it.
 *
 * Props:
 *   teams       {Team[]}
 *   selected    {number|null}
 *   hovered     {number|null}
 *   onSelect    {(team) => void}
 *   onHover     {(id|null) => void}
 */
import { HumanSprite } from "./HumanSprite";
import "../styles/Roster.css";

export function Roster({ teams, selected, hovered, onSelect, onHover }) {
  const sorted = [...teams].sort((a, b) => b.commits - a.commits);

  return (
    <aside className="roster">
      <div className="roster__heading">⌨️ COMMIT ACTIVITY</div>

      {sorted.map((team, i) => {
        const isActive = selected === team.id;

        return (
          <div
            key={team.id}
            className={`roster__item${isActive ? " roster__item--active" : ""}`}
            style={{ "--item-color": team.color }}
            onClick={() => onSelect(team)}
            onMouseEnter={() => onHover(team.id)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="roster__rank">#{i + 1}</div>

            <div
              className="roster__sprite"
              style={{ filter: `drop-shadow(0 0 3px ${team.color}60)` }}
            >
              <HumanSprite
                skin={team.skinTones[0]}
                shirt={team.shirtColors[0]}
                shadow={false}
                scale={0.7}
              />
            </div>

            <div className="roster__info">
              <div className="roster__name">{team.name}</div>
              <div className="roster__meta">
                {team.commits} commits · {team.members}👤
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}