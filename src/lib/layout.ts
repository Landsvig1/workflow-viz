import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  Lane,
  WorkflowLayout,
} from "@/types/workflow";

const elk = new ELK();

/** Fixed node dimensions fed to elk so layers don't overlap. Roughly matches
 *  the rendered card footprint (see WorkflowNode.tsx). */
export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 120;

export interface Point {
  x: number;
  y: number;
}

/** A React Flow node with computed position, produced from authored data. */
export interface PositionedNode {
  id: string;
  type: string;
  position: Point;
  data: WorkflowNodeData;
}

/** Interior bend points elk computed to route this edge around nodes. The
 *  path's endpoints are anchored to React Flow handles at render time, so only
 *  the interior points are carried here. */
export interface RoutedEdge {
  id: string;
  bendPoints: Point[];
}

/** A laid-out swimlane band, in flow coordinates. Rendered behind the nodes. */
export interface LaneBand {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  nodes: PositionedNode[];
  edges: RoutedEdge[];
  /** Empty unless the workflow defines lanes. */
  lanes: LaneBand[];
}

// Layout defaults. Any of these can be overridden per workflow via
// `Workflow.layout` (see WorkflowLayout).
const DEFAULT_LAYER_SPACING = 90; // horizontal gap between layers
const DEFAULT_NODE_SPACING = 48; // gap within a layer / lane sub-row packing
const DEFAULT_ROW_PITCH = NODE_HEIGHT + 44; // swimlane stacked-row stride
const DEFAULT_LANE_GAP = 56; // gap between swimlane bands

const LANE_PAD_TOP = 34; // header room inside a band
const BAND_PAD_X = 56; // horizontal breathing room on a band

function buildLayoutOptions(layerSpacing: number, nodeSpacing: number) {
  return {
    "elk.algorithm": "layered",
    "elk.direction": "RIGHT",
    "elk.layered.spacing.nodeNodeBetweenLayers": String(layerSpacing),
    "elk.spacing.nodeNode": String(nodeSpacing),
    "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    // Route edges orthogonally around nodes instead of straight through them.
    "elk.edgeRouting": "ORTHOGONAL",
  } satisfies Record<string, string>;
}

/**
 * Compute a left-to-right layered layout for a workflow. Returns positioned
 * nodes and the interior bend points elk routed each edge through. Authored
 * data never carries coordinates.
 *
 * When `lanes` are provided, the result becomes a swimlane layout: elk still
 * drives the horizontal axis (process sequence / layering), but the vertical
 * axis is overridden so each node sits in its lane's band. Reference edges
 * (any `kind` other than `sequence`) are excluded from elk's graph so they
 * never distort the flow's layering — they're rendered as straight connectors.
 */
export async function layoutWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  lanes?: Lane[],
  opts?: WorkflowLayout
): Promise<LayoutResult> {
  const hasLanes = !!lanes && lanes.length > 0;

  const layerSpacing = opts?.layerSpacing ?? DEFAULT_LAYER_SPACING;
  const nodeSpacing = opts?.nodeSpacing ?? DEFAULT_NODE_SPACING;
  const rowPitch = opts?.rowPitch ?? DEFAULT_ROW_PITCH;
  const laneGap = opts?.laneGap ?? DEFAULT_LANE_GAP;

  // In lane mode, layering is driven only by the process flow, so reference
  // edges (back-references, "refines", etc.) don't pull nodes out of place.
  const layoutEdges = hasLanes
    ? edges.filter((e) => (e.kind ?? "sequence") === "sequence")
    : edges;

  const graph: ElkNode = {
    id: "root",
    layoutOptions: buildLayoutOptions(layerSpacing, nodeSpacing),
    children: nodes.map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: layoutEdges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };

  const laid = await elk.layout(graph);

  const positions = new Map<string, Point>();
  for (const child of laid.children ?? []) {
    positions.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }

  if (!hasLanes) {
    const bendsById = new Map<string, Point[]>();
    for (const e of laid.edges ?? []) {
      const section = e.sections?.[0];
      const bends = (section?.bendPoints ?? []).map((p) => ({ x: p.x, y: p.y }));
      bendsById.set(e.id, bends);
    }

    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: "workflowNode",
        position: positions.get(n.id) ?? { x: 0, y: 0 },
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        bendPoints: bendsById.get(e.id) ?? [],
      })),
      lanes: [],
    };
  }

  // ---- Swimlane mode -------------------------------------------------------
  const laneList = lanes!;
  const fallbackLane = laneList[laneList.length - 1].id;
  const laneOf = (n: WorkflowNode) =>
    n.lane && laneList.some((l) => l.id === n.lane) ? n.lane : fallbackLane;

  // Greedy horizontal packing per lane: a node drops into the first sub-row
  // whose last occupant clears it, otherwise a new sub-row opens. This keeps a
  // lane compact while never overlapping two cards that share an elk layer.
  const subRowOf = new Map<string, number>();
  const laneRowCount = new Map<string, number>();

  for (const lane of laneList) {
    const laneNodes = nodes
      .filter((n) => laneOf(n) === lane.id)
      .sort(
        (a, b) =>
          (positions.get(a.id)?.x ?? 0) - (positions.get(b.id)?.x ?? 0)
      );

    const rowRightEdge: number[] = [];
    for (const n of laneNodes) {
      const x = positions.get(n.id)?.x ?? 0;
      let row = rowRightEdge.findIndex((right) => x >= right + nodeSpacing);
      if (row === -1) {
        row = rowRightEdge.length;
        rowRightEdge.push(0);
      }
      subRowOf.set(n.id, row);
      rowRightEdge[row] = x + NODE_WIDTH;
    }
    laneRowCount.set(lane.id, Math.max(1, rowRightEdge.length));
  }

  // Stack the bands top-to-bottom in declared order.
  const laneTop = new Map<string, number>();
  let cursor = 0;
  for (const lane of laneList) {
    laneTop.set(lane.id, cursor + LANE_PAD_TOP);
    cursor += LANE_PAD_TOP + laneRowCount.get(lane.id)! * rowPitch + laneGap;
  }

  const positioned: PositionedNode[] = nodes.map((n) => {
    const lane = laneOf(n);
    return {
      id: n.id,
      type: "workflowNode",
      position: {
        x: positions.get(n.id)?.x ?? 0,
        y: laneTop.get(lane)! + (subRowOf.get(n.id) ?? 0) * rowPitch,
      },
      data: n.data,
    };
  });

  // Bands span the full horizontal extent of all nodes so they read as lanes.
  const allX = positioned.map((p) => p.position.x);
  const xMin = Math.min(...allX) - BAND_PAD_X;
  const xMax = Math.max(...allX.map((x) => x + NODE_WIDTH)) + BAND_PAD_X;

  const laneBands: LaneBand[] = laneList.map((lane) => ({
    id: lane.id,
    label: lane.label,
    x: xMin,
    y: laneTop.get(lane.id)! - LANE_PAD_TOP,
    width: xMax - xMin,
    height: LANE_PAD_TOP + laneRowCount.get(lane.id)! * rowPitch,
  }));

  return {
    nodes: positioned,
    // Positions changed, so elk's bend points are stale — render straight
    // (rounded) connectors between handles instead.
    edges: edges.map((e) => ({ id: e.id, bendPoints: [] })),
    lanes: laneBands,
  };
}
