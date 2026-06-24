"use client";

import { type NodeProps } from "@xyflow/react";

/**
 * Background swimlane band. Non-interactive — it sits behind the workflow
 * nodes (negative zIndex) and never intercepts clicks, so panning and node
 * selection pass straight through. Sized by the node's width/height.
 */
export function LaneNode({ data }: NodeProps) {
  const { label } = data as unknown as { label: string };
  return (
    <div
      className="relative h-full w-full rounded-2xl border border-white/[0.07] bg-white/[0.015]"
      style={{ pointerEvents: "none" }}
    >
      <span className="absolute left-4 top-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
        {label}
      </span>
    </div>
  );
}
