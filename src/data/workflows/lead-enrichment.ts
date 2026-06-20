import { Workflow } from "@/types/workflow";

export const leadEnrichment: Workflow = {
  id: "lead-enrichment",
  title: "Lead Enrichment & CRM Update",
  description:
    "Ny lead fra hjemmeside-formular → berig med firmadata → score med AI → opdater CRM → notificer sælger",
  category: "sales",
  tags: ["CRM", "AI Scoring", "Lead Gen", "Automation"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      type: "workflowNode",
      position: { x: 50, y: 200 },
      data: {
        label: "Webhook: Ny Lead",
        type: "trigger",
        description: "Formular indsendt på hjemmeside",
        tool: "Webhook",
      },
    },
    {
      id: "api-1",
      type: "workflowNode",
      position: { x: 280, y: 200 },
      data: {
        label: "Hent Firmadata",
        type: "api",
        description: "Slår virksomhed op via CVR/Clearbit",
        tool: "Clearbit API",
      },
    },
    {
      id: "llm-1",
      type: "workflowNode",
      position: { x: 510, y: 200 },
      data: {
        label: "AI Lead Scoring",
        type: "llm",
        description: "Vurder lead-kvalitet baseret på firmaprofil og adfærd",
        tool: "GPT-4o",
      },
    },
    {
      id: "condition-1",
      type: "workflowNode",
      position: { x: 740, y: 200 },
      data: {
        label: "Score ≥ 70?",
        type: "condition",
        description: "Forgrening baseret på lead score",
      },
    },
    {
      id: "erp-1",
      type: "workflowNode",
      position: { x: 970, y: 100 },
      data: {
        label: "Opret i HubSpot",
        type: "erp",
        description: "Opret kontakt og deal i CRM",
        tool: "HubSpot CRM",
      },
    },
    {
      id: "action-1",
      type: "workflowNode",
      position: { x: 970, y: 300 },
      data: {
        label: "Notificer Sælger",
        type: "action",
        description: "Send Slack besked med lead-detaljer",
        tool: "Slack",
      },
    },
    {
      id: "action-2",
      type: "workflowNode",
      position: { x: 1200, y: 100 },
      data: {
        label: "Send Velkomst-Email",
        type: "action",
        description: "Personlig email via AI-genereret indhold",
        tool: "Resend",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "condition-1" },
    { id: "e4", source: "condition-1", target: "erp-1", label: "Høj score" },
    { id: "e5", source: "condition-1", target: "action-1", label: "Lav score" },
    { id: "e6", source: "erp-1", target: "action-2" },
  ],
};
