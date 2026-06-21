"use client";

import { Workflow } from "@/types/workflow";
import { WorkflowStage } from "@/components/WorkflowStage";

interface WorkflowDetailClientProps {
  workflow: Workflow;
}

export function WorkflowDetailClient({ workflow }: WorkflowDetailClientProps) {
  return (
    <div className="h-screen bg-[#03030a] bg-grid">
      <WorkflowStage workflow={workflow} />
    </div>
  );
}
