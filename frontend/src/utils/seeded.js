/**
 * Returns a seeded pseudo-random number generator.
 * Produces deterministic values so map layout stays consistent across renders.
 *
 * @param {number} seed
 * @returns {() => number}  Returns values in [0, 1)
 */
export function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
