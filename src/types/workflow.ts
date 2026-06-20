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

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  description?: string;
  tool?: string; // e.g. "GPT-4o", "Business Central", "Slack"
  config?: Record<string, string>;
}

export interface WorkflowNode {
  id: string;
  type: string; // React Flow node type key
  position: { x: number; y: number };
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
  category: WorkflowCategory;
  tags: string[];
  complexity: "simple" | "medium" | "complex";
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
