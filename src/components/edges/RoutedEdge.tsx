import {
  BaseEdge,
  EdgeLabelRenderer,
  Position,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { buildEdgePath, edgeMidpoint, type Point } from "@/lib/edge-path";

/**
 * Custom edge with two routing modes:
 *
 * - When elk supplied interior bend points (`data.points`), follow them — used
 *   in the default layered layout where elk routes orthogonally around cards.
 * - Otherwise route orthogonally with a rounded smooth-step path between the
 *   handles — used in swimlane mode, where elk's bends are dropped (node y is
 *   overridden by lane), so reference edges become clean 90° connectors instead
 *   of diagonals. A perfectly aligned edge degenerates to a straight line, so
 *   this stays correct for non-lane workflows too.
 *
 * Endpoints are always anchored to React Flow's source (right) / target (left)
 * handles. The arrowhead marker and a midpoint label are preserved.
 */
export function RoutedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style,
  data,
  label,
}: EdgeProps) {
  const bends = (data?.points as Point[] | undefined) ?? [];
  const dimmed = (data as { dimmed?: boolean } | undefined)?.dimmed ?? false;

  let path: string;
  let mid: Point;
  if (bends.length > 0) {
    const points: Point[] = [
      { x: sourceX, y: sourceY },
      ...bends,
      { x: targetX, y: targetY },
    ];
    path = buildEdgePath(points);
    mid = edgeMidpoint(points);
  } else {
    const [stepPath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: Position.Right,
      targetX,
      targetY,
      targetPosition: Position.Left,
      borderRadius: 12,
    });
    path = stepPath;
    mid = { x: labelX, y: labelY };
  }

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${mid.x}px, ${mid.y}px)`,
              pointerEvents: "none",
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(255,255,255,0.55)",
              background: "rgba(3,3,10,0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              padding: "2px 6px",
              whiteSpace: "nowrap",
              opacity: dimmed ? 0.1 : 1,
              transition: "opacity 150ms ease",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
