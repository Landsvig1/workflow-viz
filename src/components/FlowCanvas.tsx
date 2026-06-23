"use client";

import { useCallback, useEffect, useState } from "react";
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
import { RoutedEdge } from "./edges/RoutedEdge";
import { NODE_CONFIG } from "@/lib/node-config";
import { layoutWorkflow, type PositionedNode, type Point } from "@/lib/layout";

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const edgeTypes = {
  routed: RoutedEdge,
};

interface FlowCanvasProps {
  workflow: Workflow;
  onNodeClick?: (id: string) => void;
  onPaneClick?: () => void;
}

/** Merge per-edge styling (stroke by source-node type, arrow marker, label)
 *  with the elk-computed bend points, producing routed React Flow edges. */
function buildStyledEdges(
  workflow: Workflow,
  bendsById: Map<string, Point[]>
): Edge[] {
  const nodeTypeMap = Object.fromEntries(
    workflow.nodes.map((n) => [n.id, n.data.type])
  );

  return workflow.edges.map((e) => {
    const sourceType = nodeTypeMap[e.source];
    const config = NODE_CONFIG[sourceType as keyof typeof NODE_CONFIG];
    const color = config?.accent ?? "rgba(255,255,255,0.2)";

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: "routed",
      label: e.label,
      animated: e.animated ?? false,
      data: { points: bendsById.get(e.id) ?? [] },
      style: { stroke: `${color}70`, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: `${color}80`,
        width: 16,
        height: 16,
      },
    } as Edge;
  });
}

/** Inner canvas: receives already-positioned nodes and routed edges so
 *  `fitView` runs once coordinates exist. */
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
      edgeTypes={edgeTypes}
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
  // Tag the computed layout with its workflow id so a stale layout from a
  // previous workflow is never rendered, without a synchronous reset.
  const [layout, setLayout] = useState<{
    id: string;
    nodes: PositionedNode[];
    edges: Edge[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    layoutWorkflow(workflow.nodes, workflow.edges).then((result) => {
      if (cancelled) return;
      const bendsById = new Map(
        result.edges.map((e) => [e.id, e.bendPoints])
      );
      setLayout({
        id: workflow.id,
        nodes: result.nodes,
        edges: buildStyledEdges(workflow, bendsById),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [workflow]);

  const ready = layout?.id === workflow.id ? layout : null;

  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden border border-white/6"
      style={{
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.6)",
      }}
    >
      {ready ? (
        // key forces a fresh mount per workflow so fitView re-frames
        <Canvas
          key={workflow.id}
          initialNodes={ready.nodes}
          initialEdges={ready.edges}
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
