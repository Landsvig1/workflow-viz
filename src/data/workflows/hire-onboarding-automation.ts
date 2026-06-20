import { Workflow } from "@/types/workflow";

export const hireOnboardingAutomation: Workflow = {
  id: "hire-onboarding-automation",
  title: "Ny Ansat → Notion + Linear Onboarding",
  description:
    "Ny ansat i Rippling → AI 30-60-90 plan → opret Notion-sider via MCP → Linear onboarding-tasks → book intro-møder → Slack-velkomst",
  summary:
    "Når en ny kollega oprettes i HR-systemet, bygges en personlig onboarding-plan, dokumenter, opgaver og møder automatisk.",
  category: "hr",
  tags: ["MCP", "Notion", "Rippling", "Linear", "Onboarding"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Ny Ansat",
        type: "trigger",
        description: "Medarbejder oprettet i HR-system",
        plainLanguage: "HR registrerer en ny ansættelse.",
        tool: "Rippling",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Generér 30-60-90 Plan",
        type: "llm",
        description: "Rollespecifik plan med mål og milepæle",
        plainLanguage:
          "AI'en laver en personlig plan for de første tre måneder.",
        tool: "Claude Sonnet 4.6",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Opret Notion-sider",
        type: "api",
        description: "Onboarding-hub, plan og ressourcer",
        plainLanguage:
          "Alt materiale samles automatisk på en Notion-side til den nye kollega.",
        tool: "Notion MCP",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Opret Onboarding-tasks",
        type: "action",
        description: "Tasks til den ansatte, lederen og IT",
        plainLanguage: "Alle får deres opgaver i onboardingen automatisk.",
        tool: "Linear MCP",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Book Intro-møder",
        type: "action",
        description: "1:1'er og team-introduktioner",
        plainLanguage:
          "De vigtigste intromøder lægges direkte i kalenderen.",
        tool: "Google Calendar MCP",
      },
    },
    {
      id: "action-3",
      data: {
        label: "Velkomst i Slack",
        type: "action",
        description: "Præsentation og adgang til kanaler",
        plainLanguage: "Den nye kollega bydes velkommen i teamet.",
        tool: "Slack",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "llm-1", animated: true },
    { id: "e2", source: "llm-1", target: "api-1" },
    { id: "e3", source: "api-1", target: "action-1" },
    { id: "e4", source: "api-1", target: "action-2" },
    { id: "e5", source: "api-1", target: "action-3" },
  ],
};
