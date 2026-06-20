import { Workflow } from "@/types/workflow";

export const adOptimization: Workflow = {
  id: "ad-optimization",
  title: "AI Annonce-Optimering",
  description:
    "Daglig kørsel → hent kampagnedata → AI analyserer performance → juster budget og generer nye annoncer → marketing godkender",
  summary:
    "Hver dag analyseres annoncekampagner automatisk, og AI foreslår budget- og tekstændringer, så marketing kan godkende i stedet for at grave i tal.",
  category: "marketing",
  tags: ["Ads", "AI", "Marketing", "Optimering", "Meta"],
  complexity: "complex",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Daglig Kørsel",
        type: "trigger",
        description: "Planlagt hver morgen kl. 07:00",
        plainLanguage:
          "Workflowet kører automatisk hver morgen — ingen skal huske at starte det.",
        tool: "Cron / Scheduler",
        config: { schedule: "0 7 * * *", timezone: "Europe/Copenhagen" },
      },
    },
    {
      id: "api-1",
      data: {
        label: "Hent Kampagnedata",
        type: "api",
        description: "Træk spend, ROAS og konverteringer pr. kampagne",
        plainLanguage:
          "Gårsdagens tal for annoncerne hentes ind automatisk.",
        tool: "Meta Ads API",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Analyser Performance",
        type: "llm",
        description: "Identificer vindere, tabere og anbefalinger",
        plainLanguage:
          "AI finder ud af, hvilke annoncer der virker, og hvilke der spilder penge.",
        tool: "Claude 3.5 Sonnet",
      },
    },
    {
      id: "condition-1",
      data: {
        label: "ROAS under mål?",
        type: "condition",
        description: "Sammenlign mod målsætning pr. kampagne",
        plainLanguage:
          "Hvis en kampagne tjener for lidt hjem, sættes optimering i gang.",
      },
    },
    {
      id: "transform-1",
      data: {
        label: "Juster Budget",
        type: "transform",
        description: "Omfordel budget mod bedst performende kampagner",
        plainLanguage:
          "Penge flyttes væk fra det, der ikke virker, over mod det, der gør.",
        tool: "Internal logic",
      },
    },
    {
      id: "llm-2",
      data: {
        label: "Generer Nye Annoncer",
        type: "llm",
        description: "Skriv nye varianter til underperformende sæt",
        plainLanguage:
          "AI skriver friske annoncetekster til de annoncer, der er kørt trætte.",
        tool: "GPT-4o",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Marketing Godkender",
        type: "human",
        description: "Gennemgå forslag før de går live",
        plainLanguage:
          "Marketing ser ændringerne igennem og siger god for dem, før noget ændres.",
        tool: "Slack",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Push Opdateringer",
        type: "action",
        description: "Send budget- og annoncechanges til platformen",
        plainLanguage:
          "De godkendte ændringer sendes automatisk tilbage til annonceplatformen.",
        tool: "Meta Ads API",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "condition-1" },
    { id: "e4", source: "condition-1", target: "transform-1", label: "Ja" },
    { id: "e5", source: "condition-1", target: "llm-2", label: "Ja" },
    { id: "e6", source: "transform-1", target: "human-1" },
    { id: "e7", source: "llm-2", target: "human-1" },
    { id: "e8", source: "human-1", target: "action-1", label: "Godkendt" },
  ],
};
