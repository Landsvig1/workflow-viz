"use client";

import { useEffect } from "react";
import { WorkflowNodeData } from "@/types/workflow";
import { NODE_CONFIG, NODE_TYPE_LABELS } from "@/lib/node-config";

interface NodeInspectorProps {
  node: WorkflowNodeData | null;
  onClose: () => void;
}

/**
 * Right-side slide-over. Progressive disclosure: plain-language explanation
 * first (for non-technical readers), technical detail below (tool, config, I/O).
 * Rendered only when a node is selected; never affects canvas layout.
 */
export function NodeInspector({ node, onClose }: NodeInspectorProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!node) return null;
  const config = NODE_CONFIG[node.type];
  const configEntries = node.config ? Object.entries(node.config) : [];

  return (
    <aside
      role="dialog"
      aria-label={`Detaljer: ${node.label}`}
      className="absolute right-0 top-0 bottom-0 z-30 w-80 border-l border-white/8 bg-[#06060f]/90 backdrop-blur-xl overflow-y-auto"
      style={{ boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }}
    >
      <div className="p-5 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
              style={{
                color: config.accent,
                background: `${config.accent}18`,
              }}
            >
              <span>{config.icon}</span>
              <span>{NODE_TYPE_LABELS[node.type]}</span>
            </div>
            <h2 className="text-white font-semibold text-[15px] leading-snug">
              {node.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Luk"
            className="shrink-0 text-white/30 hover:text-white/80 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Plain-language — non-technical, shown first */}
        {node.plainLanguage && (
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-1.5">
              Hvad sker der her
            </p>
            <p className="text-white/70 text-[13px] leading-relaxed">
              {node.plainLanguage}
            </p>
          </div>
        )}

        {/* Technical detail */}
        {node.description && (
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-1.5">
              Teknisk
            </p>
            <p className="text-white/50 text-[13px] leading-relaxed">
              {node.description}
            </p>
          </div>
        )}

        {node.tool && (
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-1.5">
              Værktøj
            </p>
            <span
              className="text-[11px] font-mono px-2 py-1 rounded-md inline-block"
              style={{
                color: config.accent,
                background: `${config.accent}15`,
                border: `1px solid ${config.accent}30`,
              }}
            >
              {node.tool}
            </span>
          </div>
        )}

        {configEntries.length > 0 && (
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-2">
              Konfiguration
            </p>
            <div className="flex flex-col gap-1.5">
              {configEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-3 text-[11px] font-mono border-b border-white/5 pb-1.5"
                >
                  <span className="text-white/35">{key}</span>
                  <span className="text-white/65 text-right break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {node.io && (node.io.inputs?.length || node.io.outputs?.length) ? (
          <div className="grid grid-cols-2 gap-3">
            {node.io.inputs?.length ? (
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-1.5">
                  Input
                </p>
                <ul className="flex flex-col gap-1">
                  {node.io.inputs.map((i) => (
                    <li key={i} className="text-white/55 text-[11px]">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {node.io.outputs?.length ? (
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-1.5">
                  Output
                </p>
                <ul className="flex flex-col gap-1">
                  {node.io.outputs.map((o) => (
                    <li key={o} className="text-white/55 text-[11px]">
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
