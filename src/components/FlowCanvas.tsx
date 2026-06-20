"use client";

import { useCallback } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Workflow } from "@/types/workflow";
import { WorkflowNode } from "./WorkflowNode";
import { NODE_CONFIG } from "@/lib/node-config";

const nodeTypes = {
  workflowNode: WorkflowNode,
};

interface FlowCanvasProps {
  workflow: Workflow;
}

export function FlowCanvas({ workflow }: FlowCanvasProps) {
  // Build a map: nodeId -> nodeType for edge coloring
  const nodeTypeMap = Object.fromEntries(
    workflow.nodes.map((n) => [n.id, n.data.type])
  );

  const styledEdges = workflow.edges.map((e) => {
    const sourceType = nodeTypeMap[e.source];
    const config = NODE_CONFIG[sourceType as keyof typeof NODE_CONFIG];
    const color = config?.accent ?? "rgba(255,255,255,0.2)";

    return {
      ...e,
      style: {
        stroke: `${color}70`,
        strokeWidth: 2,
      },
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

  const [nodes, , onNodesChange] = useNodesState(workflow.nodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(styledEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/6"
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.6)" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
            const type = (node.data as any)?.type;
            const config = NODE_CONFIG[type as keyof typeof NODE_CONFIG];
            return config?.accent ?? "#555";
          }}
          maskColor="rgba(3,3,10,0.6)"
          style={{ background: "rgba(8,8,20,0.8)" }}
        />
      </ReactFlow>
    </div>
  );
}
