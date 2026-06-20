import { Workflow } from "@/types/workflow";

export const voiceToCrm: Workflow = {
  id: "voice-to-crm",
  title: "Salgsmøde → CRM via Stemme",
  description:
    "Møde optaget i Granola → transskribér → AI udtrækker action items & deal-stage → opdater HubSpot via MCP → Linear-tasks → Slack-resumé",
  summary:
    "Efter et salgsmøde opdateres CRM, oprettes opfølgningsopgaver og deles et resumé — automatisk, så sælgeren aldrig skal efterregistrere noter.",
  category: "sales",
  tags: ["MCP", "Granola", "Deepgram", "CRM", "Sales Ops"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Møde Optaget",
        type: "trigger",
        description: "Notat-AI færdig med salgsmøde",
        plainLanguage: "Et salgsmøde er slut, og optagelsen er klar.",
        tool: "Granola",
      },
    },
    {
      id: "transform-1",
      data: {
        label: "Transskribér & Diariser",
        type: "transform",
        description: "Tale-til-tekst med talersporing",
        plainLanguage: "Samtalen bliver til tekst med hvem-sagde-hvad.",
        tool: "Deepgram Nova-3",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Udtræk Indsigter",
        type: "llm",
        description: "Action items, indvendinger, deal-stage og næste skridt",
        plainLanguage:
          "AI'en finder aftaler, indvendinger og hvor langt handlen er.",
        tool: "Claude Sonnet 4.6",
        config: {
          extract: "action items, objections, MEDDIC, next step",
        },
      },
    },
    {
      id: "erp-1",
      data: {
        label: "Opdater HubSpot",
        type: "erp",
        description: "Deal-stage, noter og kontaktfelter",
        plainLanguage: "Handlen og noterne opdateres automatisk i CRM.",
        tool: "HubSpot MCP",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Opret Opfølgnings-tasks",
        type: "action",
        description: "Tasks med deadline og ansvarlig",
        plainLanguage: "Alle aftalte opfølgninger bliver til opgaver.",
        tool: "Linear",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Send Resumé i Slack",
        type: "action",
        description: "Kort mødeopsummering til teamet",
        plainLanguage: "Teamet får et kort resumé af mødet.",
        tool: "Slack",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "transform-1", animated: true },
    { id: "e2", source: "transform-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "erp-1" },
    { id: "e4", source: "llm-1", target: "action-1" },
    { id: "e5", source: "llm-1", target: "action-2" },
  ],
};
