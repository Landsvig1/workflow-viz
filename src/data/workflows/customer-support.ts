import { Workflow } from "@/types/workflow";

export const customerSupport: Workflow = {
  id: "customer-support",
  title: "AI Kundeservice Agent",
  description:
    "Indgående supporthenvendelse → klassificer → løs automatisk eller eskaler til menneskelig agent",
  summary:
    "Supporthenvendelser besvares automatisk, når AI er sikker nok — og sendes ellers videre til en kollega med et resumé klar.",
  category: "customer-support",
  tags: ["AI Agent", "Support", "NLP", "Automation"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Ny Henvendelse",
        type: "trigger",
        description: "Email, chat eller formular",
        plainLanguage:
          "En kunde skriver ind via email, chat eller formular.",
        tool: "Zendesk / Email",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Klassificer & Analyser",
        type: "llm",
        description: "Sentiment, kategori og haster",
        plainLanguage:
          "AI forstår, hvad henvendelsen handler om, og hvor presserende den er.",
        tool: "Claude 3.5 Sonnet",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Hent Kundehistorik",
        type: "api",
        description: "Tidligere ordrer, sager og noter",
        plainLanguage:
          "Vi henter kundens historik, så svaret bliver relevant.",
        tool: "CRM API",
      },
    },
    {
      id: "llm-2",
      data: {
        label: "Generer Svar",
        type: "llm",
        description: "Kontekstbaseret svar med kundedata",
        plainLanguage:
          "AI skriver et udkast til svar med kundens situation in mente.",
        tool: "GPT-4o",
      },
    },
    {
      id: "condition-1",
      data: {
        label: "Confidence ≥ 85%?",
        type: "condition",
        description: "Er AI-svaret tilstrækkeligt sikkert?",
        plainLanguage:
          "Er AI sikker nok til at svare selv? Hvis ikke, kommer et menneske ind.",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Send Auto-Svar",
        type: "action",
        description: "Send svar direkte til kunden",
        plainLanguage:
          "Sikre svar sendes direkte til kunden med det samme.",
        tool: "Zendesk",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Eskaler til Agent",
        type: "human",
        description: "Viderestil med AI-opsummering",
        plainLanguage:
          "Tvivlsomme sager sendes til en kollega — med et færdigt resumé.",
        tool: "Zendesk / Slack",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "llm-1", animated: true },
    { id: "e2", source: "llm-1", target: "api-1" },
    { id: "e3", source: "api-1", target: "llm-2" },
    { id: "e4", source: "llm-2", target: "condition-1" },
    {
      id: "e5",
      source: "condition-1",
      target: "action-1",
      label: "Høj confidence",
    },
    {
      id: "e6",
      source: "condition-1",
      target: "human-1",
      label: "Lav confidence",
    },
  ],
};
