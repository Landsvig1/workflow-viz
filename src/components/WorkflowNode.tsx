"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { WorkflowNodeData } from "@/types/workflow";
import { NODE_CONFIG, NODE_TYPE_LABELS } from "@/lib/node-config";
import clsx from "clsx";

export function WorkflowNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as WorkflowNodeData;
  const config = NODE_CONFIG[nodeData.type];

  return (
    <div
      className={clsx(
        "relative rounded-2xl border backdrop-blur-md px-4 py-3.5 min-w-[200px] max-w-[240px] transition-all duration-300",
        config.color,
        config.border,
        selected ? "scale-105" : "hover:scale-[1.02]"
      )}
      style={{
        boxShadow: selected
          ? `${config.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)` }}
      />

      {/* Inner glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.08] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${config.accent}, transparent 70%)` }}
      />

      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          background: config.handleColor,
          border: "2px solid rgba(0,0,0,0.5)",
          borderRadius: "50%",
          boxShadow: `0 0 8px ${config.accent}80`,
        }}
      />

      {/* Type badge */}
      <div
        className={clsx(
          "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2.5",
          config.badge
        )}
      >
        <span className="text-[9px]">{config.icon}</span>
        <span>{NODE_TYPE_LABELS[nodeData.type]}</span>
      </div>

      {/* Label */}
      <p className="text-white text-[13px] font-semibold leading-snug mb-1.5">
        {nodeData.label}
      </p>

      {/* Description */}
      {nodeData.description && (
        <p className="text-white/45 text-[11px] leading-relaxed">
          {nodeData.description}
        </p>
      )}

      {/* Tool badge */}
      {nodeData.tool && (
        <div
          className="mt-2.5 text-[10px] font-mono px-2 py-0.5 rounded-md inline-block"
          style={{
            color: config.accent,
            background: `${config.accent}15`,
            border: `1px solid ${config.accent}30`,
          }}
        >
          {nodeData.tool}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          background: config.handleColor,
          border: "2px solid rgba(0,0,0,0.5)",
          borderRadius: "50%",
          boxShadow: `0 0 8px ${config.accent}80`,
        }}
      />
    </div>
  );
}
