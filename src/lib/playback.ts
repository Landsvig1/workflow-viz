import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

/**
 * Execution order via Kahn's topological sort, seeded from trigger nodes
 * (indegree 0) in declaration order. Cyclic graphs (which valid DAGs are not)
 * are handled defensively: any nodes left unprocessed are appended, so the
 * function always terminates and includes every node exactly once.
 */
export function executionOrder(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => {
    indegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  edges.forEach((e) => {
    if (!indegree.has(e.source) || !indegree.has(e.target)) return;
    adj.get(e.source)!.push(e.target);
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
  });

  const queue = nodes
    .filter((n) => (indegree.get(n.id) ?? 0) === 0)
    .map((n) => n.id);

  const order: string[] = [];
  const visited = new Set<string>();

  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    order.push(id);
    for (const next of adj.get(id) ?? []) {
      indegree.set(next, (indegree.get(next) ?? 1) - 1);
      if ((indegree.get(next) ?? 0) <= 0 && !visited.has(next)) {
        queue.push(next);
      }
    }
  }

  // Defensive: append cycle members not reachable by the topo walk.
  for (const n of nodes) {
    if (!visited.has(n.id)) order.push(n.id);
  }
  return order;
}

export type PlaybackStatus = "idle" | "running" | "paused" | "done";

export interface PlaybackState {
  status: PlaybackStatus;
  index: number;
}

export type PlaybackAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "tick" }
  | { type: "step" }
  | { type: "reset" };

export const initialPlayback: PlaybackState = { status: "idle", index: 0 };

/** Pure transition for the playback state machine. `total` is the number of
 *  nodes in the execution order. */
export function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction,
  total: number
): PlaybackState {
  switch (action.type) {
    case "play":
      if (total === 0) return state;
      if (state.status === "done") return { status: "running", index: 0 };
      return {
        status: "running",
        index: state.status === "idle" ? 0 : state.index,
      };
    case "pause":
      return state.status === "running"
        ? { ...state, status: "paused" }
        : state;
    case "tick":
      if (state.status !== "running") return state;
      if (state.index >= total - 1) return { status: "done", index: total - 1 };
      return { ...state, index: state.index + 1 };
    case "step":
      // Manual single advance; pauses on the landed node.
      if (total === 0 || state.status === "done") return state;
      if (state.status === "idle") return { status: "paused", index: 0 };
      if (state.index >= total - 1) return { status: "done", index: total - 1 };
      return { status: "paused", index: state.index + 1 };
    case "reset":
      return { status: "idle", index: 0 };
    default:
      return state;
  }
}
