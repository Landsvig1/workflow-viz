import Link from "next/link";
import { Workflow } from "@/types/workflow";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  COMPLEXITY_COLORS,
  NODE_CONFIG,
  NODE_TYPE_LABELS,
} from "@/lib/node-config";
import clsx from "clsx";

interface WorkflowCardProps {
  workflow: Workflow;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const nodeTypeCounts = workflow.nodes.reduce(
    (acc, node) => {
      const type = node.data.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Link href={`/workflow/${workflow.id}`} className="workflow-card-wrapper block group">
      <div className="relative bg-[#080810] rounded-[19px] p-6 overflow-hidden h-full transition-all duration-300 group-hover:bg-[#0a0a18]">
        {/* Inner glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.06), transparent 60%)" }}
        />

        {/* Top line accent */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-white font-semibold text-[15px] leading-snug group-hover:text-white transition-colors">
            {workflow.title}
          </h3>
          <span
            className={clsx(
              "shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wide",
              CATEGORY_COLORS[workflow.category]
            )}
          >
            {CATEGORY_LABELS[workflow.category]}
          </span>
        </div>

        {/* Description */}
        <p className="text-white/35 text-[13px] leading-relaxed mb-5 line-clamp-2">
          {workflow.description}
        </p>

        {/* Node type pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {Object.entries(nodeTypeCounts).map(([type, count]) => {
            const config = NODE_CONFIG[type as keyof typeof NODE_CONFIG];
            if (!config) return null;
            return (
              <span
                key={type}
                className={clsx(
                  "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                  config.badge
                )}
              >
                {config.icon}{" "}
                {NODE_TYPE_LABELS[type as keyof typeof NODE_TYPE_LABELS]}
                {count > 1 && (
                  <span className="opacity-50 ml-0.5">×{count}</span>
                )}
              </span>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {workflow.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-white/25 bg-white/4 border border-white/6 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-white/25">{workflow.nodes.length} noder</span>
            <span
              className={clsx(
                "font-semibold capitalize",
                COMPLEXITY_COLORS[workflow.complexity]
              )}
            >
              {workflow.complexity}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="absolute bottom-5 right-6 text-white/15 group-hover:text-white/40 group-hover:translate-x-1 transition-all duration-300 text-base font-light">
          →
        </div>
      </div>
    </Link>
  );
}
