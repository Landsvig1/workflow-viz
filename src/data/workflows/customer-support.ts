import { Workflow } from "@/types/workflow";

export const customerSupport: Workflow = {
  id: "customer-support",
  title: "AI Kundeservice Agent",
  description:
    "Indgående supporthenvendelse → klassificer → løs automatisk eller eskaler til menneskelig agent",
  category: "customer-support",
  tags: ["AI Agent", "Support", "NLP", "Automation"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      type: "workflowNode",
      position: { x: 50, y: 250 },
      data: {
        label: "Ny Henvendelse",
        type: "trigger",
        description: "Email, chat eller formular",
        tool: "Zendesk / Email",
      },
    },
    {
      id: "llm-1",
      type: "workflowNode",
      position: { x: 280, y: 250 },
      data: {
        label: "Klassificer & Analyser",
        type: "llm",
        description: "Sentiment, kategori og haster",
        tool: "Claude 3.5 Sonnet",
      },
    },
    {
      id: "api-1",
      type: "workflowNode",
      position: { x: 510, y: 250 },
      data: {
        label: "Hent Kundehistorik",
        type: "api",
        description: "Tidligere ordrer, sager og noter",
        tool: "CRM API",
      },
    },
    {
      id: "llm-2",
      type: "workflowNode",
      position: { x: 740, y: 250 },
      data: {
        label: "Generer Svar",
        type: "llm",
        description: "Kontekstbaseret svar med kundedata",
        tool: "GPT-4o",
      },
    },
    {
      id: "condition-1",
      type: "workflowNode",
      position: { x: 970, y: 250 },
      data: {
        label: "Confidence ≥ 85%?",
        type: "condition",
        description: "Er AI-svaret tilstrækkeligt sikkert?",
      },
    },
    {
      id: "action-1",
      type: "workflowNode",
      position: { x: 1200, y: 150 },
      data: {
        label: "Send Auto-Svar",
        type: "action",
        description: "Send svar direkte til kunden",
        tool: "Zendesk",
      },
    },
    {
      id: "human-1",
      type: "workflowNode",
      position: { x: 1200, y: 350 },
      data: {
        label: "Eskaler til Agent",
        type: "human",
        description: "Viderestil med AI-opsummering",
        tool: "Zendesk / Slack",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "llm-1", animated: true },
    { id: "e2", source: "llm-1", target: "api-1" },
    { id: "e3", source: "api-1", target: "llm-2" },
    { id: "e4", source: "llm-2", target: "condition-1" },
    { id: "e5", source: "condition-1", target: "action-1", label: "Høj confidence" },
    { id: "e6", source: "condition-1", target: "human-1", label: "Lav confidence" },
  ],
};
