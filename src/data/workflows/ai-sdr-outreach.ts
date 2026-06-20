import { Workflow } from "@/types/workflow";

export const aiSdrOutreach: Workflow = {
  id: "ai-sdr-outreach",
  title: "AI SDR: Berigelse → Personlig Outreach",
  description:
    "Ny lead → Clay-berigelse → AI ICP-scoring via MCP → personlig 3-trins sekvens → sælger godkender → Smartlead",
  summary:
    "Hver ny lead beriges, scores mod jeres ideelle kundeprofil og får en personlig outreach-sekvens skrevet — sælgeren godkender blot, før den sendes.",
  category: "sales",
  tags: ["MCP", "Clay", "Smartlead", "Outbound", "AI SDR"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Ny Lead",
        type: "webhook",
        description: "Lead fra formular, LinkedIn-annonce eller liste-import",
        plainLanguage: "En ny potentiel kunde lander i systemet.",
        tool: "HubSpot Webhook",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Berig med Clay",
        type: "api",
        description: "Firmografi, tech-stack, intent-signaler og hiring-data",
        plainLanguage:
          "Vi henfinder automatisk alt offentligt om firmaet og personen.",
        tool: "Clay",
        config: {
          waterfall: "Apollo → LinkedIn → BuiltWith",
          intent: "Bombora",
        },
      },
    },
    {
      id: "llm-1",
      data: {
        label: "ICP-Scoring",
        type: "llm",
        description: "Match mod ideel kundeprofil via værktøjskald",
        plainLanguage:
          "AI vurderer, hvor godt leadet passer til jeres bedste kunder.",
        tool: "Claude Sonnet 4.6 + MCP",
      },
    },
    {
      id: "condition-1",
      data: {
        label: "ICP-match?",
        type: "condition",
        description: "Score over tærskel for outbound",
        plainLanguage: "Kun de rigtige leads går videre til outreach.",
      },
    },
    {
      id: "llm-2",
      data: {
        label: "Skriv 3-trins Sekvens",
        type: "llm",
        description: "Personlige emails med konkrete triggers og value-prop",
        plainLanguage:
          "AI skriver en personlig mailsekvens, der refererer til leadets faktiske situation.",
        tool: "Claude Sonnet 4.6",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Sælger Godkender",
        type: "human",
        description: "Hurtigt review og evt. tilretning i Slack",
        plainLanguage: "Sælgeren ser sekvensen igennem, før den sendes.",
        tool: "Slack",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Start Sekvens",
        type: "action",
        description: "Tilmeld leadet outbound-kampagnen",
        plainLanguage: "Mailsekvensen sættes i gang automatisk.",
        tool: "Smartlead",
      },
    },
    {
      id: "erp-1",
      data: {
        label: "Log i CRM",
        type: "erp",
        description: "Opret kontakt, deal og aktivitetslog",
        plainLanguage: "Alt registreres i CRM, så intet falder mellem stolene.",
        tool: "HubSpot",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "condition-1" },
    { id: "e4", source: "condition-1", target: "llm-2", label: "Match" },
    { id: "e5", source: "condition-1", target: "erp-1", label: "No-match" },
    { id: "e6", source: "llm-2", target: "human-1" },
    { id: "e7", source: "human-1", target: "action-1", label: "Godkendt" },
    { id: "e8", source: "action-1", target: "erp-1" },
  ],
};
