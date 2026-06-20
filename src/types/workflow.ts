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
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
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
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
