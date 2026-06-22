export interface Point {
  x: number;
  y: number;
}

/** A point `dist` along the segment from `from` toward `to`, clamped to the
 *  segment's half-length so rounded corners never overshoot. */
function towards(from: Point, to: Point, dist: number): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { ...from };
  const d = Math.min(dist, len / 2);
  return { x: from.x + (dx / len) * d, y: from.y + (dy / len) * d };
}

/**
 * Build an SVG path string through an ordered point list, rounding interior
 * corners with a short quadratic curve. Pure and deterministic.
 */
export function buildEdgePath(points: Point[], radius = 8): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const next = points[i + 1];
    const before = towards(cur, prev, radius);
    const after = towards(cur, next, radius);
    d += ` L ${before.x} ${before.y} Q ${cur.x} ${cur.y} ${after.x} ${after.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

/** The point at half the polyline's total arc length — a label anchor that
 *  follows the routed path rather than the straight source→target midpoint. */
export function edgeMidpoint(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };

  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y
    );
  }
  let half = total / 2;
  for (let i = 1; i < points.length; i++) {
    const seg = Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y
    );
    if (seg >= half) {
      const t = seg === 0 ? 0 : half / seg;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
      };
    }
    half -= seg;
  }
  return { ...points[points.length - 1] };
}
