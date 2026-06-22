import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import { buildEdgePath, edgeMidpoint, type Point } from "@/lib/edge-path";

/**
 * Custom edge that renders along elkjs-computed bend points so connectors
 * route around node cards. Endpoints are anchored to React Flow's source/target
 * handles; the interior follows elk's `data.points`. Preserves the arrowhead
 * marker and renders the label at the routed midpoint.
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
  const points: Point[] = [
    { x: sourceX, y: sourceY },
    ...bends,
    { x: targetX, y: targetY },
  ];

  const path = buildEdgePath(points);
  const mid = edgeMidpoint(points);

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
