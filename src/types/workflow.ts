export type NodeType =
  | "trigger"
  | "llm"
  | "api"
  | "erp"
  | "condition"
  | "action"
  | "human"
  | "transform"
  | "webhook";

export type WorkflowCategory =
  | "sales"
  | "finance"
  | "customer-support"
  | "operations"
  | "hr"
  | "marketing";

export type Complexity = "simple" | "medium" | "complex";

/**
 * The semantic relationship an edge expresses. `sequence` is the process flow
 * (the happy path); the rest are non-sequential references between nodes —
 * rendered distinctly (color + dash) and kept out of the layout's layering so
 * they don't distort the flow. Omit for plain process edges.
 */
export type EdgeKind =
  | "sequence"
  | "modifies"
  | "refines"
  | "authorizes"
  | "duplicates"
  | "shares-data";

/** A horizontal swimlane band. Order in `Workflow.lanes` is top-to-bottom. */
export interface Lane {
  id: string;
  label: string;
}

/**
 * Per-workflow spacing overrides for the auto-layout. All optional; omitted
 * values fall back to the engine defaults. Lets a dense or sparse graph be
 * tuned per workflow without touching the layout engine.
 */
export interface WorkflowLayout {
  /** Horizontal gap between process layers (px). Engine default ~90. */
  layerSpacing?: number;
  /** Gap between nodes sharing a layer or packed into a lane sub-row (px).
   *  Engine default ~48. */
  nodeSpacing?: number;
  /** Swimlane only: vertical stride between stacked rows (px). Default ~164. */
  rowPitch?: number;
  /** Swimlane only: vertical gap between lane bands (px). Default ~56. */
  laneGap?: number;
}

export interface NodeIO {
  inputs?: string[];
  outputs?: string[];
}

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  /** Technical detail, shown in the inspector. */
  description?: string;
  /** Plain-language "what this does" for non-technical readers. */
  plainLanguage?: string;
  tool?: string; // e.g. "GPT-4o", "Business Central", "Slack"
  config?: Record<string, string>;
  io?: NodeIO;
}

/**
 * Authored workflow node — position-free. Positions are computed by the
 * auto-layout engine (src/lib/layout.ts), never hand-authored.
 */
export interface WorkflowNode {
  id: string;
  data: WorkflowNodeData;
  /** Swimlane this node belongs to (references a `Workflow.lanes[].id`).
   *  Only meaningful when the workflow defines lanes. */
  lane?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  /** Relationship type. Defaults to `sequence` (process flow) when omitted. */
  kind?: EdgeKind;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  /** Plain-language one-liner summarizing the whole workflow. */
  summary?: string;
  category: WorkflowCategory;
  tags: string[];
  complexity: Complexity;
  /** Optional swimlanes. When present, nodes are arranged into horizontal
   *  bands by `WorkflowNode.lane`; x stays driven by the process sequence. */
  lanes?: Lane[];
  /** Optional per-workflow spacing overrides for the auto-layout. */
  layout?: WorkflowLayout;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
