import { Workflow } from "@/types/workflow";
import { validateWorkflow } from "@/lib/schema";
import { leadEnrichment } from "./workflows/lead-enrichment";
import { invoiceProcessing } from "./workflows/invoice-processing";
import { customerSupport } from "./workflows/customer-support";
import { contentGeneration } from "./workflows/content-generation";
import { employeeOnboarding } from "./workflows/employee-onboarding";
import { recruitmentScreening } from "./workflows/recruitment-screening";
import { adOptimization } from "./workflows/ad-optimization";
import { aiSdrOutreach } from "./workflows/ai-sdr-outreach";
import { claudeCodePrReview } from "./workflows/claude-code-pr-review";
import { incidentResponseCopilot } from "./workflows/incident-response-copilot";
import { voiceToCrm } from "./workflows/voice-to-crm";
import { stripeDunningRecovery } from "./workflows/stripe-dunning-recovery";
import { youtubeContentRepurpose } from "./workflows/youtube-content-repurpose";
import { hireOnboardingAutomation } from "./workflows/hire-onboarding-automation";
import { churnPredictionWinback } from "./workflows/churn-prediction-winback";
import { aiReleaseNotes } from "./workflows/ai-release-notes";
import { figmaToCode } from "./workflows/figma-to-code";

const authored: Workflow[] = [
  leadEnrichment,
  invoiceProcessing,
  customerSupport,
  contentGeneration,
  employeeOnboarding,
  recruitmentScreening,
  adOptimization,
  aiSdrOutreach,
  claudeCodePrReview,
  incidentResponseCopilot,
  voiceToCrm,
  stripeDunningRecovery,
  youtubeContentRepurpose,
  hireOnboardingAutomation,
  churnPredictionWinback,
  aiReleaseNotes,
  figmaToCode,
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

/** The workflow shown on the landing page. Change this one line to re-feature. */
export const FEATURED_WORKFLOW_ID = "figma-to-code";

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}
