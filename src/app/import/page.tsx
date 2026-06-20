"use client";

import { useState } from "react";
import Link from "next/link";
import { validateWorkflow, type ValidationError } from "@/lib/schema";
import { WorkflowViewer } from "@/components/WorkflowViewer";
import type { Workflow } from "@/types/workflow";

type Outcome =
  | { kind: "idle" }
  | { kind: "parseError"; message: string }
  | { kind: "invalid"; errors: ValidationError[] }
  | { kind: "ok"; workflow: Workflow };

export default function ImportPage() {
  const [raw, setRaw] = useState("");
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  function visualize() {
    if (!raw.trim()) {
      setOutcome({ kind: "parseError", message: "Indsæt JSON først." });
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      setOutcome({
        kind: "parseError",
        message: `Ugyldig JSON: ${(e as Error).message}`,
      });
      return;
    }
    const result = validateWorkflow(parsed);
    if (result.ok) {
      setOutcome({ kind: "ok", workflow: result.workflow });
    } else {
      setOutcome({ kind: "invalid", errors: result.errors });
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => setRaw(text));
  }

  if (outcome.kind === "ok") {
    return (
      <main className="h-screen bg-[#03030a] bg-grid flex flex-col">
        <header className="relative z-10 flex items-center gap-4 px-6 py-4 border-b border-white/6 bg-[#03030a]/80 backdrop-blur-xl">
          <button
            onClick={() => setOutcome({ kind: "idle" })}
            className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-sm font-medium"
          >
            <span>←</span> Tilbage til import
          </button>
          <div className="h-3.5 w-px bg-white/10" />
          <h1 className="text-white/80 font-semibold text-[14px] truncate">
            {outcome.workflow.title}{" "}
            <span className="text-white/30 font-normal">(forhåndsvisning)</span>
          </h1>
        </header>
        <div className="flex-1 p-4 min-h-0">
          <WorkflowViewer workflow={outcome.workflow} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#03030a] bg-grid">
      <div className="relative max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-white/30 hover:text-white/70 transition-colors text-sm font-medium"
        >
          ← Alle workflows
        </Link>

        <h1 className="text-3xl font-bold text-white mt-6 mb-2">
          Importér workflow
        </h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Indsæt eller upload et workflow i JSON-format, der følger skemaet, og
          se det visualiseret med det samme. Intet gemmes — forhåndsvisningen er
          kun i din session.
        </p>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder='{ "id": "...", "title": "...", "nodes": [...], "edges": [...] }'
          spellCheck={false}
          className="w-full h-72 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-[13px] font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-y"
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={visualize}
            className="bg-white/12 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Visualisér
          </button>
          <label className="text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer">
            eller upload .json
            <input
              type="file"
              accept="application/json,.json"
              onChange={onFile}
              className="hidden"
            />
          </label>
        </div>

        {outcome.kind === "parseError" && (
          <div className="mt-6 border border-rose-500/30 bg-rose-500/8 rounded-xl px-4 py-3">
            <p className="text-rose-300 text-[13px]">{outcome.message}</p>
          </div>
        )}

        {outcome.kind === "invalid" && (
          <div className="mt-6 border border-amber-500/30 bg-amber-500/8 rounded-xl px-4 py-3">
            <p className="text-amber-300 text-[13px] font-semibold mb-2">
              Skemaet matcher ikke ({outcome.errors.length} fejl):
            </p>
            <ul className="flex flex-col gap-1">
              {outcome.errors.map((err, i) => (
                <li key={i} className="text-amber-200/80 text-[12px] font-mono">
                  <span className="text-amber-400/70">
                    {err.path || "(root)"}
                  </span>{" "}
                  — {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
