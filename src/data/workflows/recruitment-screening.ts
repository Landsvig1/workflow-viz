import { Workflow } from "@/types/workflow";

export const recruitmentScreening: Workflow = {
  id: "recruitment-screening",
  title: "AI Rekruttering & Screening",
  description:
    "Ny ansøgning → AI matcher CV mod jobkrav → score → auto-afslag eller book interview → rekrutterer reviewer grænsetilfælde",
  summary:
    "Hver ansøgning vurderes automatisk mod jobkravene, så rekrutteringsteamet kun bruger tid på de mest relevante kandidater.",
  category: "hr",
  tags: ["Rekruttering", "AI Scoring", "HR", "Screening"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Ny Ansøgning",
        type: "trigger",
        description: "Kandidat ansøger via jobopslag",
        plainLanguage:
          "Workflowet starter, så snart en kandidat sender en ansøgning.",
        tool: "Workable",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "CV-Match mod Jobkrav",
        type: "llm",
        description: "Udtræk erfaring og kompetencer, match mod kravprofil",
        plainLanguage:
          "AI læser CV'et og sammenligner det med, hvad jobbet kræver.",
        tool: "GPT-4o",
        config: {
          weighting: "skills 60% / erfaring 40%",
          output: "score 0-100 + begrundelse",
        },
      },
    },
    {
      id: "condition-1",
      data: {
        label: "Score ≥ 75?",
        type: "condition",
        description: "Forgrening baseret på match-score",
        plainLanguage:
          "Kandidater deles op efter, hvor godt de matcher jobbet.",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Book Interview",
        type: "action",
        description: "Send selvbooking-link til kandidaten",
        plainLanguage:
          "Stærke kandidater får automatisk et link til at booke en samtale.",
        tool: "Calendly",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Rekrutterer Review",
        type: "human",
        description: "Manuel vurdering af grænsetilfælde",
        plainLanguage:
          "Kandidater i midterfeltet vurderes af en rekrutterer — ikke afvist af en maskine.",
        tool: "Slack",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Venligt Afslag",
        type: "action",
        description: "Personaliseret afslagsmail med feedback",
        plainLanguage:
          "Kandidater, der ikke matcher, får et hurtigt og respektfuldt svar.",
        tool: "Resend",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "llm-1", animated: true },
    { id: "e2", source: "llm-1", target: "condition-1" },
    { id: "e3", source: "condition-1", target: "action-1", label: "Høj" },
    { id: "e4", source: "condition-1", target: "human-1", label: "Mellem" },
    { id: "e5", source: "condition-1", target: "action-2", label: "Lav" },
    { id: "e6", source: "human-1", target: "action-1", label: "Videre" },
    { id: "e7", source: "human-1", target: "action-2", label: "Afvist" },
  ],
};
