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
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Workflow, EdgeKind } from "@/types/workflow";
import { WorkflowNode } from "./WorkflowNode";
import { LaneNode } from "./LaneNode";
import { RoutedEdge } from "./edges/RoutedEdge";
import { NODE_CONFIG } from "@/lib/node-config";
import { EDGE_KIND_STYLE, isReferenceKind } from "@/lib/edge-style";
import { layoutWorkflow, type LaneBand, type Point } from "@/lib/layout";

const nodeTypes = {
  workflowNode: WorkflowNode,
  lane: LaneNode,
};

const edgeTypes = {
  routed: RoutedEdge,
};

interface FlowCanvasProps {
  workflow: Workflow;
  /** When set, that node's dependency subgraph (it + direct neighbors and the
   *  edges between them) is highlighted; everything else is dimmed. */
  focusNodeId?: string | null;
  onNodeClick?: (id: string) => void;
  onPaneClick?: () => void;
}

/** node id -> ids of its direct neighbors, and node id -> ids of edges that
 *  touch it. Built once per workflow; used to compute the focus subgraph. */
interface Adjacency {
  neighbors: Map<string, Set<string>>;
  edgesOf: Map<string, Set<string>>;
}

function buildAdjacency(workflow: Workflow): Adjacency {
  const neighbors = new Map<string, Set<string>>();
  const edgesOf = new Map<string, Set<string>>();
  const ensure = <T,>(m: Map<string, Set<T>>, k: string) => {
    let s = m.get(k);
    if (!s) m.set(k, (s = new Set<T>()));
    return s;
  };
  for (const e of workflow.edges) {
    ensure(neighbors, e.source).add(e.target);
    ensure(neighbors, e.target).add(e.source);
    ensure(edgesOf, e.source).add(e.id);
    ensure(edgesOf, e.target).add(e.id);
  }
  return { neighbors, edgesOf };
}

/** Style an edge by its relationship. Process (`sequence`) edges keep the
 *  source node's accent color and stay solid; reference edges get the
 *  relationship's color + dash so the two read as different things. */
function buildStyledEdges(
  workflow: Workflow,
  bendsById: Map<string, Point[]>
): Edge[] {
  const nodeTypeMap = Object.fromEntries(
    workflow.nodes.map((n) => [n.id, n.data.type])
  );

  return workflow.edges.map((e) => {
    const isRef = isReferenceKind(e.kind);
    let color: string;
    let dash: string | undefined;

    if (isRef) {
      const ks = EDGE_KIND_STYLE[e.kind as Exclude<EdgeKind, "sequence">];
      color = ks.color;
      dash = ks.dash;
    } else {
      const config = NODE_CONFIG[nodeTypeMap[e.source] as keyof typeof NODE_CONFIG];
      color = config?.accent ?? "rgba(255,255,255,0.2)";
    }

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: "routed",
      label: e.label,
      // Reference edges are relationships, not flow — never animate them.
      animated: isRef ? false : e.animated ?? false,
      data: { points: bendsById.get(e.id) ?? [] },
      style: {
        stroke: `${color}${isRef ? "cc" : "70"}`,
        strokeWidth: 2,
        strokeDasharray: dash,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: `${color}${isRef ? "e0" : "80"}`,
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
  adjacency,
  focusNodeId,
  onNodeClick,
  onPaneClick,
}: {
  initialNodes: Node[];
  initialEdges: Edge[];
  adjacency: Adjacency;
  focusNodeId?: string | null;
  onNodeClick?: (id: string) => void;
  onPaneClick?: () => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Focus/trace: dim everything outside the focused node's dependency subgraph.
  // Lane bands are never dimmed; the focused node keeps its selected styling.
  useEffect(() => {
    const focusedNodes = focusNodeId
      ? new Set<string>([
          focusNodeId,
          ...(adjacency.neighbors.get(focusNodeId) ?? []),
        ])
      : null;
    const focusedEdges = focusNodeId
      ? adjacency.edgesOf.get(focusNodeId) ?? new Set<string>()
      : null;

    setNodes((nds) =>
      nds.map((n) => {
        if (n.type === "lane") return n;
        const dim = focusedNodes ? !focusedNodes.has(n.id) : false;
        return {
          ...n,
          style: {
            ...n.style,
            opacity: dim ? 0.2 : 1,
            transition: "opacity 150ms ease",
          },
        };
      })
    );
    setEdges((eds) =>
      eds.map((e) => {
        const connected = focusedEdges ? focusedEdges.has(e.id) : true;
        const dim = focusedEdges ? !connected : false;
        return {
          ...e,
          style: {
            ...e.style,
            opacity: dim ? 0.1 : 1,
            strokeWidth: focusNodeId && connected ? 3 : 2,
            transition: "opacity 150ms ease",
          },
          data: { ...e.data, dimmed: dim },
        };
      })
    );
  }, [focusNodeId, adjacency, setNodes, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) => {
        // Lane bands are decorative — ignore clicks on them.
        if (node.id.startsWith("lane-")) return;
        onNodeClick?.(node.id);
      }}
      onPaneClick={() => onPaneClick?.()}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
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
          if (node.id.startsWith("lane-")) return "transparent";
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

/** Build the decorative React Flow nodes that render lane bands behind the
 *  graph. Non-interactive and pushed to the back via zIndex. */
function buildLaneNodes(bands: LaneBand[]): Node[] {
  return bands.map((b) => ({
    id: `lane-${b.id}`,
    type: "lane",
    position: { x: b.x, y: b.y },
    data: { label: b.label },
    draggable: false,
    selectable: false,
    focusable: false,
    zIndex: -1,
    width: b.width,
    height: b.height,
    style: { width: b.width, height: b.height, pointerEvents: "none" },
  }));
}

/** Legend mapping reference-edge colors to their meaning. Only the kinds the
 *  workflow actually uses are shown. */
function EdgeLegend({ kinds }: { kinds: Exclude<EdgeKind, "sequence">[] }) {
  if (kinds.length === 0) return null;
  return (
    <div className="absolute right-3 top-3 z-10 rounded-xl border border-white/8 bg-black/55 px-3 py-2 backdrop-blur-md">
      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/35">
        Relationer
      </p>
      <ul className="space-y-1">
        {kinds.map((k) => {
          const ks = EDGE_KIND_STYLE[k];
          return (
            <li key={k} className="flex items-center gap-2">
              <svg width="22" height="6" className="shrink-0">
                <line
                  x1="0"
                  y1="3"
                  x2="22"
                  y2="3"
                  stroke={ks.color}
                  strokeWidth="2"
                  strokeDasharray={ks.dash}
                />
              </svg>
              <span className="text-[10px] text-white/60">{ks.legend}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function FlowCanvas({
  workflow,
  focusNodeId,
  onNodeClick,
  onPaneClick,
}: FlowCanvasProps) {
  const adjacency = useMemo(() => buildAdjacency(workflow), [workflow]);
  // Tag the computed layout with its workflow id so a stale layout from a
  // previous workflow is never rendered, without a synchronous reset.
  const [layout, setLayout] = useState<{
    id: string;
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    layoutWorkflow(
      workflow.nodes,
      workflow.edges,
      workflow.lanes,
      workflow.layout
    ).then((result) => {
        if (cancelled) return;
        const bendsById = new Map(
          result.edges.map((e) => [e.id, e.bendPoints])
        );
        const flowNodes: Node[] = result.nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data as unknown as Record<string, unknown>,
        }));
        setLayout({
          id: workflow.id,
          // Lane bands first so they sit behind the flow nodes.
          nodes: [...buildLaneNodes(result.lanes), ...flowNodes],
          edges: buildStyledEdges(workflow, bendsById),
        });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [workflow]);

  const referenceKinds = useMemo(
    () =>
      Array.from(
        new Set(
          workflow.edges
            .map((e) => e.kind)
            .filter(isReferenceKind)
        )
      ),
    [workflow]
  );

  const ready = layout?.id === workflow.id ? layout : null;

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden border border-white/6"
      style={{
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.6)",
      }}
    >
      {ready ? (
        <>
          {/* key forces a fresh mount per workflow so fitView re-frames */}
          <Canvas
            key={workflow.id}
            initialNodes={ready.nodes}
            initialEdges={ready.edges}
            adjacency={adjacency}
            focusNodeId={focusNodeId}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
          />
          <EdgeLegend kinds={referenceKinds} />
        </>
      ) : (
        <div className="w-full h-full grid place-items-center text-white/30 text-sm">
          <span className="animate-pulse">Beregner layout…</span>
        </div>
      )}
    </div>
  );
}
