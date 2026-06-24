import { z } from "zod";
import type { Workflow } from "@/types/workflow";

export const nodeTypeSchema = z.enum([
  "trigger",
  "llm",
  "api",
  "erp",
  "condition",
  "action",
  "human",
  "transform",
  "webhook",
]);

export const categorySchema = z.enum([
  "sales",
  "finance",
  "customer-support",
  "operations",
  "hr",
  "marketing",
]);

export const complexitySchema = z.enum(["simple", "medium", "complex"]);

export const edgeKindSchema = z.enum([
  "sequence",
  "modifies",
  "refines",
  "authorizes",
  "duplicates",
  "shares-data",
]);

export const laneSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const workflowLayoutSchema = z.object({
  layerSpacing: z.number().positive().optional(),
  nodeSpacing: z.number().positive().optional(),
  rowPitch: z.number().positive().optional(),
  laneGap: z.number().nonnegative().optional(),
});

export const workflowNodeSchema = z.object({
  id: z.string().min(1),
  lane: z.string().optional(),
  data: z.object({
    label: z.string().min(1),
    type: nodeTypeSchema,
    description: z.string().optional(),
    plainLanguage: z.string().optional(),
    tool: z.string().optional(),
    config: z.record(z.string(), z.string()).optional(),
    io: z
      .object({
        inputs: z.array(z.string()).optional(),
        outputs: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
  animated: z.boolean().optional(),
  kind: edgeKindSchema.optional(),
});

export const workflowSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    summary: z.string().optional(),
    category: categorySchema,
    tags: z.array(z.string()),
    complexity: complexitySchema,
    lanes: z.array(laneSchema).optional(),
    layout: workflowLayoutSchema.optional(),
    nodes: z.array(workflowNodeSchema).min(1),
    edges: z.array(workflowEdgeSchema),
  })
  .superRefine((wf, ctx) => {
    const ids = new Set(wf.nodes.map((n) => n.id));
    wf.edges.forEach((e, i) => {
      if (!ids.has(e.source)) {
        ctx.addIssue({
          code: "custom",
          message: `Edge "${e.id}" references unknown source node "${e.source}"`,
          path: ["edges", i, "source"],
        });
      }
      if (!ids.has(e.target)) {
        ctx.addIssue({
          code: "custom",
          message: `Edge "${e.id}" references unknown target node "${e.target}"`,
          path: ["edges", i, "target"],
        });
      }
    });

    // A node's lane must reference a defined lane. Same consistency contract
    // as edge endpoints: fail fast on a typo rather than silently misplacing.
    const laneIds = new Set((wf.lanes ?? []).map((l) => l.id));
    wf.nodes.forEach((n, i) => {
      if (n.lane !== undefined && !laneIds.has(n.lane)) {
        ctx.addIssue({
          code: "custom",
          message: `Node "${n.id}" references unknown lane "${n.lane}"`,
          path: ["nodes", i, "lane"],
        });
      }
    });
  });

export interface ValidationError {
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; workflow: Workflow }
  | { ok: false; errors: ValidationError[] };

/**
 * Validate unknown input against the workflow schema. Returns a discriminated
 * result with human-readable errors (field path + message) on failure.
 */
export function validateWorkflow(input: unknown): ValidationResult {
  const result = workflowSchema.safeParse(input);
  if (result.success) {
    return { ok: true, workflow: result.data as Workflow };
  }
  return {
    ok: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}
