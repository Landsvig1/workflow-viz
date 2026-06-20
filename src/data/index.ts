import { Workflow } from "@/types/workflow";
import { validateWorkflow } from "@/lib/schema";
import { leadEnrichment } from "./workflows/lead-enrichment";
import { invoiceProcessing } from "./workflows/invoice-processing";
import { customerSupport } from "./workflows/customer-support";
import { contentGeneration } from "./workflows/content-generation";
import { employeeOnboarding } from "./workflows/employee-onboarding";
import { recruitmentScreening } from "./workflows/recruitment-screening";
import { adOptimization } from "./workflows/ad-optimization";

const authored: Workflow[] = [
  leadEnrichment,
  invoiceProcessing,
  customerSupport,
  contentGeneration,
  employeeOnboarding,
  recruitmentScreening,
  adOptimization,
];

// Validate every workflow at module load. A malformed workflow fails fast
// with a readable error instead of rendering a broken graph.
for (const wf of authored) {
  const result = validateWorkflow(wf);
  if (!result.ok) {
    const detail = result.errors
      .map((e) => `${e.path || "(root)"}: ${e.message}`)
      .join("; ");
    throw new Error(`Invalid workflow "${wf.id}": ${detail}`);
  }
}

export const workflows: Workflow[] = authored;

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}
