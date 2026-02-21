import { useState, useCallback } from "react";
import { WORLD_W, WORLD_H } from "../data/teams";

/**
 * useCamera
 * Manages camera position and drag-to-pan behaviour.
 *
 * @returns {{
 *   camX: number,
 *   camY: number,
 *   vpSize: { w: number, h: number },
 *   isDragging: boolean,
 *   focusTeam: (team) => void,
 *   onMouseDown: (e) => void,
 *   onMouseMove: (e) => void,
 *   onMouseUp:   ()  => void,
 * }}
 */
export function useCamera() {
  const [vpSize, setVpSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });
  const [cam,  setCam]  = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);

  // Keep viewport size in sync with window
  useState(() => {
    const fn = () => setVpSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Clamped camera — never scroll past world bounds
  const camX = Math.max(0, Math.min(cam.x, Math.max(0, WORLD_W - vpSize.w)));
  const camY = Math.max(0, Math.min(cam.y, Math.max(0, WORLD_H - vpSize.h)));

  const onMouseDown = useCallback(
    (e) => {
      // Don't start a drag when clicking on a team character
      if (e.target.closest("[data-team]")) return;
      setDrag({ mx: e.clientX, my: e.clientY, cx: cam.x, cy: cam.y });
    },
    [cam]
  );

  const onMouseMove = useCallback(
    (e) => {
      if (!drag) return;
      setCam({
        x: drag.cx - (e.clientX - drag.mx),
        y: drag.cy - (e.clientY - drag.my),
      });
    },
    [drag]
  );

  const onMouseUp = useCallback(() => setDrag(null), []);

  const focusTeam = useCallback(
    (team) =>
      setCam({
        x: team.x - vpSize.w / 2 + 10,
        y: team.y - vpSize.h / 2 + 15,
      }),
    [vpSize]
  );

  return {
    camX,
    camY,
    vpSize,
    isDragging: !!drag,
    focusTeam,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}
