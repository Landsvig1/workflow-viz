import { Workflow } from "@/types/workflow";

export const churnPredictionWinback: Workflow = {
  id: "churn-prediction-winback",
  title: "Churn-Prædiktion & Win-back",
  description:
    "Daglig kørsel → produkt-usage via PostHog MCP → AI churn-score → høj risiko? → udkast til win-back → CSM godkender → send + task",
  summary:
    "Hver dag scorer AI'en hvilke kunder der er ved at falde fra, og forbereder en personlig win-back, så CSM-teamet når dem i tide.",
  category: "customer-support",
  tags: ["MCP", "PostHog", "Retention", "CSM", "Churn"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Daglig Kørsel",
        type: "trigger",
        description: "Planlagt hver morgen",
        plainLanguage: "Workflowet kører automatisk hver dag.",
        tool: "Cron",
        config: { schedule: "0 6 * * *" },
      },
    },
    {
      id: "api-1",
      data: {
        label: "Hent Produkt-usage",
        type: "api",
        description: "Aktivitet, feature-adoption og trends",
        plainLanguage:
          "Vi henfinder, hvordan hver kunde faktisk bruger produktet.",
        tool: "PostHog MCP",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Churn-risiko Score",
        type: "llm",
        description: "Vægt signaler og forklar risikoen",
        plainLanguage:
          "AI'en vurderer, hvilke kunder der er ved at miste interessen — og hvorfor.",
        tool: "Claude Sonnet 4.6",
      },
    },
    {
      id: "condition-1",
      data: {
        label: "Høj Risiko?",
        type: "condition",
        description: "Over tærskel for proaktiv kontakt",
        plainLanguage: "Kun de mest udsatte kunder går videre.",
      },
    },
    {
      id: "llm-2",
      data: {
        label: "Udkast til Win-back",
        type: "llm",
        description: "Personlig outreach med relevant værdi",
        plainLanguage:
          "AI'en skriver et oplæg til at vinde kunden tilbage.",
        tool: "Claude Sonnet 4.6",
      },
    },
    {
      id: "human-1",
      data: {
        label: "CSM Godkender",
        type: "human",
        description: "Tilret og send fra egen konto",
        plainLanguage:
          "Kundeansvarlig læser igennem og sender personligt.",
        tool: "Slack",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Send & Opret Task",
        type: "action",
        description: "Email + opfølgningsopgave til CSM",
        plainLanguage:
          "Beskeden sendes, og der oprettes en opfølgning, så kunden ikke tabes.",
        tool: "Resend + Linear",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "condition-1" },
    { id: "e4", source: "condition-1", target: "llm-2", label: "Høj" },
    { id: "e5", source: "llm-2", target: "human-1" },
    { id: "e6", source: "human-1", target: "action-1", label: "Godkendt" },
  ],
};
