import { getFeaturedWorkflow } from "@/data";
import { WorkflowStage } from "@/components/WorkflowStage";

export default function HomePage() {
  const workflow = getFeaturedWorkflow();

  return (
    <div className="h-full">
      <WorkflowStage workflow={workflow} />
    </div>
  );
}
