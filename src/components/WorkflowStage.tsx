"use client";

import { Workflow } from "@/types/workflow";
import { WorkflowViewer } from "@/components/WorkflowViewer";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/node-config";
import clsx from "clsx";

/**
 * Slim, shared per-workflow view: a minimal header (title + plain-language
 * summary + category) above the interactive graph. Used by both the featured
 * landing and the workflow detail route. Fills its parent (must be sized).
 */
export function WorkflowStage({ workflow }: { workflow: Workflow }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="shrink-0 flex items-center gap-4 px-6 py-3 border-b border-white/6 bg-[#03030a]/70 backdrop-blur-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-white/90 font-semibold text-[15px] truncate">
              {workflow.title}
            </h1>
            <span
              className={clsx(
                "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide",
                CATEGORY_COLORS[workflow.category]
              )}
            >
              {CATEGORY_LABELS[workflow.category]}
            </span>
          </div>
          {workflow.summary && (
            <p className="text-white/40 text-[12px] leading-snug truncate mt-0.5">
              {workflow.summary}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 p-4">
        <WorkflowViewer workflow={workflow} />
      </div>
    </div>
  );
}
