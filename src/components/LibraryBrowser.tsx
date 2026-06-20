"use client";

import { useMemo, useState } from "react";
import { Workflow, WorkflowCategory, Complexity, NodeType } from "@/types/workflow";
import { WorkflowCard } from "./WorkflowCard";
import {
  filterWorkflows,
  availableNodeTypes,
} from "@/lib/workflow-filter";
import {
  CATEGORY_LABELS,
  NODE_CONFIG,
  NODE_TYPE_LABELS,
} from "@/lib/node-config";
import clsx from "clsx";

interface LibraryBrowserProps {
  workflows: Workflow[];
}

const COMPLEXITIES: Complexity[] = ["simple", "medium", "complex"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors",
        active
          ? "bg-white/12 border-white/25 text-white"
          : "bg-white/[0.02] border-white/8 text-white/40 hover:text-white/70 hover:border-white/15"
      )}
    >
      {children}
    </button>
  );
}

export function LibraryBrowser({ workflows }: LibraryBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<WorkflowCategory | null>(null);
  const [complexity, setComplexity] = useState<Complexity | null>(null);
  const [nodeType, setNodeType] = useState<NodeType | null>(null);

  const categories = useMemo(
    () => [...new Set(workflows.map((w) => w.category))],
    [workflows]
  );
  const nodeTypes = useMemo(() => availableNodeTypes(workflows), [workflows]);

  const results = useMemo(
    () => filterWorkflows(workflows, { query, category, complexity, nodeType }),
    [workflows, query, category, complexity, nodeType]
  );

  const hasFilters = query || category || complexity || nodeType;

  const toggle = <T,>(value: T, current: T | null, set: (v: T | null) => void) =>
    set(current === value ? null : value);

  return (
    <div>
      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søg i workflows, beskrivelser, tags…"
          className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2.5 mb-6">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => toggle(c, category, setCategory)}
            >
              {CATEGORY_LABELS[c] ?? c}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMPLEXITIES.map((c) => (
            <Chip
              key={c}
              active={complexity === c}
              onClick={() => toggle(c, complexity, setComplexity)}
            >
              <span className="capitalize">{c}</span>
            </Chip>
          ))}
          <div className="w-px bg-white/8 mx-1" />
          {nodeTypes.map((t) => (
            <Chip
              key={t}
              active={nodeType === t}
              onClick={() => toggle(t, nodeType, setNodeType)}
            >
              {NODE_CONFIG[t]?.icon} {NODE_TYPE_LABELS[t]}
            </Chip>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] text-white/30">
          {results.length} af {workflows.length} workflows
        </span>
        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              setCategory(null);
              setComplexity(null);
              setNodeType(null);
            }}
            className="text-[12px] text-white/30 hover:text-white/70 transition-colors"
          >
            Ryd filtre
          </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      ) : (
        <div className="border border-white/8 border-dashed rounded-2xl py-16 text-center">
          <p className="text-white/40 text-sm">
            Ingen workflows matcher dine filtre.
          </p>
        </div>
      )}
    </div>
  );
}
