import { Workflow } from "@/types/workflow";
import { leadEnrichment } from "./workflows/lead-enrichment";
import { invoiceProcessing } from "./workflows/invoice-processing";
import { customerSupport } from "./workflows/customer-support";
import { contentGeneration } from "./workflows/content-generation";

export const workflows: Workflow[] = [
  leadEnrichment,
  invoiceProcessing,
  customerSupport,
  contentGeneration,
];

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}
