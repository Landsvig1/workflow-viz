import type { EdgeKind } from "@/types/workflow";

/** Visual treatment for a non-sequential edge relationship. */
export interface EdgeKindStyle {
  color: string;
  /** SVG `stroke-dasharray`; omit for a solid line. */
  dash?: string;
  /** Human label for the legend. */
  legend: string;
}

/**
 * Reference edges (everything except `sequence`) are colored and dashed by
 * relationship so the eye separates "the process flows this way" from "this
 * node refers to that node". `sequence` is intentionally absent — process
 * edges keep their source-node accent color (see FlowCanvas.buildStyledEdges).
 */
export const EDGE_KIND_STYLE: Record<
  Exclude<EdgeKind, "sequence">,
  EdgeKindStyle
> = {
  modifies: { color: "#f59e0b", dash: "7 5", legend: "modificerer" },
  refines: { color: "#06b6d4", dash: "7 5", legend: "præciserer" },
  authorizes: { color: "#a855f7", dash: "7 5", legend: "bemyndiger" },
  duplicates: { color: "#f43f5e", dash: "2 5", legend: "dublerer" },
  "shares-data": { color: "#fb923c", dash: "4 5", legend: "deler data" },
};

export function isReferenceKind(
  kind: EdgeKind | undefined
): kind is Exclude<EdgeKind, "sequence"> {
  return !!kind && kind !== "sequence";
}
