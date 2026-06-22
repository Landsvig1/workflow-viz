"use client";

import { Workflow } from "@/types/workflow";
import { WorkflowStage } from "@/components/WorkflowStage";

interface WorkflowDetailClientProps {
  workflow: Workflow;
}

export function WorkflowDetailClient({ workflow }: WorkflowDetailClientProps) {
  return (
    <div className="h-full">
      <WorkflowStage workflow={workflow} />
    </div>
  );
}
