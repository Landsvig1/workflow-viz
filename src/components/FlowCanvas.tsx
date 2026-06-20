"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  MarkerType,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Workflow } from "@/types/workflow";
import { WorkflowNode } from "./WorkflowNode";
import { NODE_CONFIG } from "@/lib/node-config";
import { layoutWorkflow, type PositionedNode } from "@/lib/layout";

const nodeTypes = {
  workflowNode: WorkflowNode,
};

interface FlowCanvasProps {
  workflow: Workflow;
  onNodeClick?: (id: string) => void;
  onPaneClick?: () => void;
}

function buildStyledEdges(workflow: Workflow): Edge[] {
  const nodeTypeMap = Object.fromEntries(
    workflow.nodes.map((n) => [n.id, n.data.type])
  );

  return workflow.edges.map((e) => {
    const sourceType = nodeTypeMap[e.source];
    const config = NODE_CONFIG[sourceType as keyof typeof NODE_CONFIG];
    const color = config?.accent ?? "rgba(255,255,255,0.2)";

    return {
      ...e,
      style: { stroke: `${color}70`, strokeWidth: 2 },
      labelStyle: {
        fill: "rgba(255,255,255,0.4)",
        fontSize: 10,
        fontFamily: "inherit",
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: "rgba(3,3,10,0.8)",
        stroke: "rgba(255,255,255,0.06)",
        strokeWidth: 1,
        rx: 4,
      },
      labelBgPadding: [6, 4] as [number, number],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: `${color}80`,
        width: 16,
        height: 16,
      },
    };
  });
}

/** Inner canvas: receives already-positioned nodes so `fitView` runs once
 *  coordinates exist. */
function Canvas({
  initialNodes,
  initialEdges,
  onNodeClick,
  onPaneClick,
}: {
  initialNodes: PositionedNode[];
  initialEdges: Edge[];
  onNodeClick?: (id: string) => void;
  onPaneClick?: () => void;
}) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes as never);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) => onNodeClick?.(node.id)}
      onPaneClick={() => onPaneClick?.()}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      style={{ background: "transparent" }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={28}
        size={1}
        color="rgba(255,255,255,0.04)"
      />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={(node) => {
          const type = (node.data as { type?: string })?.type;
          const config = NODE_CONFIG[type as keyof typeof NODE_CONFIG];
          return config?.accent ?? "#555";
        }}
        maskColor="rgba(3,3,10,0.6)"
        style={{ background: "rgba(8,8,20,0.8)" }}
      />
    </ReactFlow>
  );
}

export function FlowCanvas({
  workflow,
  onNodeClick,
  onPaneClick,
}: FlowCanvasProps) {
  const [positioned, setPositioned] = useState<PositionedNode[] | null>(null);
  const styledEdges = useMemo(() => buildStyledEdges(workflow), [workflow]);

  useEffect(() => {
    let cancelled = false;
    setPositioned(null);
    layoutWorkflow(workflow.nodes, workflow.edges).then((p) => {
      if (!cancelled) setPositioned(p);
    });
    return () => {
      cancelled = true;
    };
  }, [workflow]);

  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden border border-white/6"
      style={{
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.6)",
      }}
    >
      {positioned ? (
        // key forces a fresh mount per workflow so fitView re-frames
        <Canvas
          key={workflow.id}
          initialNodes={positioned}
          initialEdges={styledEdges}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-white/30 text-sm">
          <span className="animate-pulse">Beregner layout…</span>
        </div>
      )}
    </div>
  );
}
