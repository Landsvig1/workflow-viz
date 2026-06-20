import { Workflow } from "@/types/workflow";

export const incidentResponseCopilot: Workflow = {
  id: "incident-response-copilot",
  title: "Incident Response Copilot",
  description:
    "PagerDuty-alarm → hent logs & traces via Datadog MCP → AI root-cause → foreslå fix + runbook → on-call godkender → Linear + Slack",
  summary:
    "Når en alarm går, samler AI'en logs og traces, finder den sandsynlige årsag og foreslår et fix — så on-call starter med svar i stedet for at lede.",
  category: "operations",
  tags: ["MCP", "Datadog", "PagerDuty", "SRE", "Incident"],
  complexity: "complex",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "PagerDuty Alarm",
        type: "webhook",
        description: "P1/P2 incident udløst",
        plainLanguage: "En kritisk alarm går i produktionen.",
        tool: "PagerDuty",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Hent Logs & Traces",
        type: "api",
        description: "Korreler metrics, logs og distributed traces",
        plainLanguage:
          "AI'en trækker automatisk alle relevante data omkring fejlen.",
        tool: "Datadog MCP",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Root-Cause Analyse",
        type: "llm",
        description: "Identificér sandsynlig årsag og blast-radius",
        plainLanguage:
          "AI'en gætter kvalificeret på, hvad der gik galt, og hvor slemt det er.",
        tool: "Claude Opus 4.8",
      },
    },
    {
      id: "llm-2",
      data: {
        label: "Foreslå Fix + Runbook",
        type: "llm",
        description: "Konkrete mitigations-trin og rollback-plan",
        plainLanguage:
          "AI'en skriver en trin-for-trin plan til at få systemet op igen.",
        tool: "Claude Opus 4.8",
      },
    },
    {
      id: "human-1",
      data: {
        label: "On-call Godkender",
        type: "human",
        description: "Vurdér og udfør foreslået mitigation",
        plainLanguage:
          "Et menneske beslutter — AI'en foreslår, mennesket trykker på knappen.",
        tool: "Slack",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Opret Incident-issue",
        type: "action",
        description: "Issue med tidslinje, årsag og fix",
        plainLanguage:
          "Hele forløbet dokumenteres automatisk som en sag.",
        tool: "Linear",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Post Runbook i Slack",
        type: "action",
        description: "Del analyse og næste skridt i incident-kanalen",
        plainLanguage: "Teamet får analysen og planen samlet ét sted.",
        tool: "Slack",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "llm-2" },
    { id: "e4", source: "llm-2", target: "human-1" },
    { id: "e5", source: "human-1", target: "action-1" },
    { id: "e6", source: "human-1", target: "action-2" },
  ],
};
