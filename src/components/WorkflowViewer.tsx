"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { Workflow } from "@/types/workflow";
import { FlowCanvas } from "@/components/FlowCanvas";
import { NodeInspector } from "@/components/NodeInspector";
import { PlaybackControls } from "@/components/PlaybackControls";
import {
  executionOrder,
  playbackReducer,
  initialPlayback,
} from "@/lib/playback";

interface WorkflowViewerProps {
  workflow: Workflow;
}

/**
 * Interactive canvas core: auto-laid-out graph + click-to-inspect + run
 * playback. Fills its parent (which must be `relative` and sized). Reused by
 * the workflow detail page and the import preview.
 */
export function WorkflowViewer({ workflow }: WorkflowViewerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode =
    workflow.nodes.find((n) => n.id === selectedNodeId)?.data ?? null;

  const order = useMemo(
    () => executionOrder(workflow.nodes, workflow.edges),
    [workflow]
  );
  const [playback, dispatch] = useReducer(
    (
      state: typeof initialPlayback,
      action: Parameters<typeof playbackReducer>[1]
    ) => playbackReducer(state, action, order.length),
    initialPlayback
  );

  useEffect(() => {
    if (playback.status !== "running") return;
    const timer = setInterval(() => dispatch({ type: "tick" }), 900);
    return () => clearInterval(timer);
  }, [playback.status]);

  const activeNodeId =
    playback.status === "idle" ? null : order[playback.index] ?? null;

  return (
    <div className="relative w-full h-full">
      <FlowCanvas
        workflow={workflow}
        onNodeClick={setSelectedNodeId}
        onPaneClick={() => setSelectedNodeId(null)}
        activeNodeId={activeNodeId}
      />

      <div className="absolute top-7 left-1/2 -translate-x-1/2 z-20">
        <PlaybackControls
          status={playback.status}
          index={playback.index}
          total={order.length}
          onPlay={() => dispatch({ type: "play" })}
          onPause={() => dispatch({ type: "pause" })}
          onStep={() => dispatch({ type: "step" })}
          onReset={() => dispatch({ type: "reset" })}
        />
      </div>

      <NodeInspector
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
