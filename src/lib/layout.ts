import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";
import type { WorkflowNode, WorkflowEdge, WorkflowNodeData } from "@/types/workflow";

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

export interface LayoutResult {
  nodes: PositionedNode[];
  edges: RoutedEdge[];
}

const layoutOptions: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.layered.spacing.nodeNodeBetweenLayers": "90",
  "elk.spacing.nodeNode": "48",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  // Route edges orthogonally around nodes instead of straight through them.
  "elk.edgeRouting": "ORTHOGONAL",
};

/**
 * Compute a left-to-right layered layout for a workflow. Returns positioned
 * nodes and the interior bend points elk routed each edge through. Authored
 * data never carries coordinates.
 */
export async function layoutWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<LayoutResult> {
  const graph: ElkNode = {
    id: "root",
    layoutOptions,
    children: nodes.map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: edges.map((e) => ({
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
  };
}
