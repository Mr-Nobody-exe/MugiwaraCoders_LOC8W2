import { useState, useEffect, useRef } from "react";
import { seeded } from "../utils/seeded";
import { TEAMS } from "../data/teams";

/**
 * useWander
 * Drives the autonomous wandering animation for all team clusters.
 * Each team gets a small random offset (ox, oy) from its base position.
 * Offsets update smoothly via rAF interpolation.
 *
 * @returns {{ offsets: Array<{id, ox, oy}> }}
 */
export function useWander() {
  const [offsets, setOffsets] = useState(() =>
    TEAMS.map((t) => ({ id: t.id, ox: 0, oy: 0 }))
  );

  const wanderTargets = useRef(TEAMS.map((t) => ({ id: t.id, tx: 0, ty: 0 })));
  const animRef       = useRef(null);
  const wanderTimer   = useRef(null);

  // Every 2.6 s, randomly pick new target offsets for some teams
  useEffect(() => {
    const rng = seeded(77);

    wanderTimer.current = setInterval(() => {
      wanderTargets.current = wanderTargets.current.map((w) =>
        rng() < 0.38
          ? { ...w, tx: (rng() - 0.5) * 26, ty: (rng() - 0.5) * 22 }
          : w
      );
    }, 2600);

    return () => clearInterval(wanderTimer.current);
  }, []);

  // rAF loop — smoothly interpolate current offsets toward targets
  useEffect(() => {
    let last = null;

    const tick = (ts) => {
      if (!last) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;

      setOffsets((prev) =>
        prev.map((cp) => {
          const tgt = wanderTargets.current.find((w) => w.id === cp.id);
          if (!tgt) return cp;

          const dx   = tgt.tx - cp.ox;
          const dy   = tgt.ty - cp.oy;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.4) return cp;

          const spd = 24;
          return {
            ...cp,
            ox: cp.ox + (dx / dist) * spd * dt,
            oy: cp.oy + (dy / dist) * spd * dt,
          };
        })
      );

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return { offsets };
}
