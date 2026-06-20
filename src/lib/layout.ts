import ELK, { type ElkNode } from "elkjs/lib/elk.bundled.js";
import type { WorkflowNode, WorkflowEdge, WorkflowNodeData } from "@/types/workflow";

const elk = new ELK();

/** Fixed node dimensions fed to elk so layers don't overlap. Roughly matches
 *  the rendered card footprint (see WorkflowNode.tsx). */
export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 120;

/** A React Flow node with computed position, produced from authored data. */
export interface PositionedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

const layoutOptions: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.layered.spacing.nodeNodeBetweenLayers": "90",
  "elk.spacing.nodeNode": "48",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
};

/**
 * Compute a left-to-right layered layout for a workflow. Returns React Flow
 * nodes with injected positions; authored data never carries coordinates.
 */
export async function layoutWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<PositionedNode[]> {
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
  const positions = new Map<string, { x: number; y: number }>();
  for (const child of laid.children ?? []) {
    positions.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }

  return nodes.map((n) => ({
    id: n.id,
    type: "workflowNode",
    position: positions.get(n.id) ?? { x: 0, y: 0 },
    data: n.data,
  }));
}
