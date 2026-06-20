import type {
  Workflow,
  WorkflowCategory,
  Complexity,
  NodeType,
} from "@/types/workflow";

export interface WorkflowFilters {
  query?: string;
  category?: WorkflowCategory | null;
  complexity?: Complexity | null;
  nodeType?: NodeType | null;
}

function matchesQuery(workflow: Workflow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (workflow.title.toLowerCase().includes(q)) return true;
  if (workflow.description.toLowerCase().includes(q)) return true;
  if (workflow.summary?.toLowerCase().includes(q)) return true;
  return workflow.tags.some((t) => t.toLowerCase().includes(q));
}

/**
 * Pure, composable filter for the library. All provided filters are ANDed;
 * empty/undefined/null filters impose no constraint.
 */
export function filterWorkflows(
  workflows: Workflow[],
  filters: WorkflowFilters
): Workflow[] {
  return workflows.filter((wf) => {
    if (filters.query && !matchesQuery(wf, filters.query)) return false;
    if (filters.category && wf.category !== filters.category) return false;
    if (filters.complexity && wf.complexity !== filters.complexity) return false;
    if (
      filters.nodeType &&
      !wf.nodes.some((n) => n.data.type === filters.nodeType)
    ) {
      return false;
    }
    return true;
  });
}

/** Distinct node types present across the library, for building filter chips. */
export function availableNodeTypes(workflows: Workflow[]): NodeType[] {
  const set = new Set<NodeType>();
  workflows.forEach((wf) => wf.nodes.forEach((n) => set.add(n.data.type)));
  return [...set];
}
