"use client";

import { useState } from "react";
import { Workflow } from "@/types/workflow";
import { FlowCanvas } from "@/components/FlowCanvas";
import { NodeInspector } from "@/components/NodeInspector";

interface WorkflowViewerProps {
  workflow: Workflow;
}

/**
 * Interactive canvas core: auto-laid-out graph + click-to-inspect. Fills its
 * parent (which must be `relative` and sized). Reused by the workflow detail
 * page and the import preview.
 */
export function WorkflowViewer({ workflow }: WorkflowViewerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode =
    workflow.nodes.find((n) => n.id === selectedNodeId)?.data ?? null;

  return (
    <div className="relative w-full h-full">
      <FlowCanvas
        workflow={workflow}
        onNodeClick={setSelectedNodeId}
        onPaneClick={() => setSelectedNodeId(null)}
      />
      <NodeInspector
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
