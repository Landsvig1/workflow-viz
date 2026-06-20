import { Workflow } from "@/types/workflow";

export const employeeOnboarding: Workflow = {
  id: "employee-onboarding",
  title: "Medarbejder Onboarding",
  description:
    "Ny ansættelse → opret konti og udstyr → AI-genereret onboardingplan → manager godkender → velkomst udsendes",
  summary:
    "Når en ny kollega ansættes, klargøres konti, udstyr og en personlig første-uge-plan automatisk — så de er klar fra dag ét.",
  category: "operations",
  tags: ["Onboarding", "IT", "Automation", "HR"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Ny Ansættelse",
        type: "trigger",
        description: "Ny medarbejder oprettet i HR-systemet",
        plainLanguage:
          "Det hele starter, når HR registrerer en ny ansættelse i systemet.",
        tool: "BambooHR",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Opret Konti",
        type: "api",
        description: "Opret email, SSO og adgange baseret på rolle",
        plainLanguage:
          "Den nye medarbejder får automatisk email og de adgange, som deres rolle kræver.",
        tool: "Google Workspace",
        config: {
          provisioning: "role-based",
          groups: "auto-assigned",
        },
      },
    },
    {
      id: "action-1",
      data: {
        label: "Bestil Udstyr",
        type: "action",
        description: "Opret IT-asset ticket for laptop og tilbehør",
        plainLanguage:
          "IT får automatisk besked om at klargøre laptop og udstyr.",
        tool: "Jira Service Mgmt",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Generer Onboardingplan",
        type: "llm",
        description: "Skab en rollespecifik plan for de første to uger",
        plainLanguage:
          "AI laver en personlig plan for de første to uger ud fra rollen og teamet.",
        tool: "Claude 3.5 Sonnet",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Manager Godkender",
        type: "human",
        description: "Nærmeste leder justerer og godkender planen",
        plainLanguage:
          "Lederen kigger planen igennem, tilpasser den og godkender.",
        tool: "Slack",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Send Velkomst",
        type: "action",
        description: "Udsend velkomstmail og kalenderinvitationer",
        plainLanguage:
          "Den nye kollega får en velkomstmail og alle relevante møder i kalenderen.",
        tool: "Gmail + Calendar",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "trigger-1", target: "action-1", animated: true },
    { id: "e3", source: "api-1", target: "llm-1" },
    { id: "e4", source: "llm-1", target: "human-1" },
    { id: "e5", source: "human-1", target: "action-2", label: "Godkendt" },
  ],
};
