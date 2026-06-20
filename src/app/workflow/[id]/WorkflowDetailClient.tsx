"use client";

import Link from "next/link";
import { Workflow } from "@/types/workflow";
import { FlowCanvas } from "@/components/FlowCanvas";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  COMPLEXITY_COLORS,
  NODE_CONFIG,
  NODE_TYPE_LABELS,
} from "@/lib/node-config";
import clsx from "clsx";

interface WorkflowDetailClientProps {
  workflow: Workflow;
}

export function WorkflowDetailClient({ workflow }: WorkflowDetailClientProps) {
  const nodeTypeCounts = workflow.nodes.reduce(
    (acc, node) => {
      const type = node.data.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-[#03030a] bg-grid flex flex-col">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/4 w-[500px] h-[400px] bg-blue-600/7 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[350px] bg-violet-600/7 rounded-full blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center gap-4 px-6 py-4 border-b border-white/6 bg-[#03030a]/80 backdrop-blur-xl">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-sm font-medium group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Alle workflows
        </Link>
        <div className="h-3.5 w-px bg-white/10" />
        <h1 className="text-white/80 font-semibold text-[14px] truncate">{workflow.title}</h1>

        <div className="ml-auto flex items-center gap-3">
          <span
            className={clsx(
              "text-[10px] font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wide",
              CATEGORY_COLORS[workflow.category]
            )}
          >
            {CATEGORY_LABELS[workflow.category]}
          </span>
          <span
            className={clsx(
              "text-[11px] font-semibold capitalize",
              COMPLEXITY_COLORS[workflow.complexity]
            )}
          >
            {workflow.complexity}
          </span>
        </div>
      </header>

      {/* Main */}
      <div className="relative flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="relative z-10 w-60 shrink-0 border-r border-white/6 bg-[#03030a]/60 backdrop-blur-xl overflow-y-auto">
          <div className="p-5 flex flex-col gap-6">
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-2.5">
                Beskrivelse
              </p>
              <p className="text-white/50 text-[13px] leading-relaxed">
                {workflow.description}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-3">
                Node-typer
              </p>
              <div className="flex flex-col gap-2">
                {Object.entries(nodeTypeCounts).map(([type, count]) => {
                  const config = NODE_CONFIG[type as keyof typeof NODE_CONFIG];
                  if (!config) return null;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span
                        className={clsx(
                          "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                          config.badge
                        )}
                      >
                        {config.icon}{" "}
                        {NODE_TYPE_LABELS[type as keyof typeof NODE_TYPE_LABELS]}
                      </span>
                      <span className="text-white/25 text-[11px] font-mono">×{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-2.5">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {workflow.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-white/35 bg-white/4 border border-white/6 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/6">
              <div className="flex justify-between text-[11px] text-white/25 font-mono">
                <span>{workflow.nodes.length} noder</span>
                <span>{workflow.edges.length} kanter</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div
          className="flex-1 p-4 min-h-0"
          style={{ height: "calc(100vh - 57px)" }}
        >
          <FlowCanvas workflow={workflow} />
        </div>
      </div>
    </div>
  );
}
