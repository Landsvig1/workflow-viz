import { Workflow } from "@/types/workflow";

export const figmaToCode: Workflow = {
  id: "figma-to-code",
  title: "Figma → Kode med Claude Code",
  description:
    "Figma opdateret → design-kontekst via Figma MCP → Claude Code genererer komponent → PR → Vercel preview → visuel diff → designer godkender",
  summary:
    "Når et design ændres, genererer Claude Code den tilsvarende komponent, åbner en PR og verificerer den visuelt mod designet — designeren godkender til sidst.",
  category: "operations",
  tags: ["Figma MCP", "Claude Code", "Design-to-Code", "Vercel", "Agentic"],
  complexity: "complex",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Figma Fil Opdateret",
        type: "webhook",
        description: "Komponent markeret klar til build",
        plainLanguage: "En designer markerer et design som klar til kode.",
        tool: "Figma Webhook",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Hent Design-kontekst",
        type: "api",
        description: "Tokens, layout, varianter og assets",
        plainLanguage:
          "Vi trækker de præcise design-detaljer ud, AI'en skal bygge efter.",
        tool: "Figma MCP",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Generér Komponent",
        type: "llm",
        description: "React + Tailwind, matcher design-system",
        plainLanguage:
          "Claude Code skriver komponenten, så den følger jeres design-system.",
        tool: "Claude Opus 4.8",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Åbn PR",
        type: "action",
        description: "Branch, commit og pull request",
        plainLanguage: "Koden lægges op som en pull request klar til review.",
        tool: "GitHub MCP",
      },
    },
    {
      id: "api-2",
      data: {
        label: "Vercel Preview",
        type: "api",
        description: "Deploy preview af komponenten",
        plainLanguage: "Komponenten deployes, så den kan ses live.",
        tool: "Vercel",
      },
    },
    {
      id: "llm-2",
      data: {
        label: "Visuel Diff-review",
        type: "llm",
        description: "Sammenlign render mod Figma-design",
        plainLanguage:
          "AI'en sammenligner det byggede med designet pixel for pixel.",
        tool: "Claude Opus 4.8 Vision",
      },
    },
    {
      id: "condition-1",
      data: {
        label: "Pixel-match?",
        type: "condition",
        description: "Inden for tolerance mod design",
        plainLanguage: "Ligner koden designet godt nok?",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Designer Godkender",
        type: "human",
        description: "Sidste øjekast ved afvigelser",
        plainLanguage: "Ved tvivl tager en designer den endelige beslutning.",
        tool: "Slack",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Slack-notifikation",
        type: "action",
        description: "Status og preview-link",
        plainLanguage: "Teamet får besked med et link til at se resultatet.",
        tool: "Slack",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "action-1" },
    { id: "e4", source: "action-1", target: "api-2" },
    { id: "e5", source: "api-2", target: "llm-2" },
    { id: "e6", source: "llm-2", target: "condition-1" },
    { id: "e7", source: "condition-1", target: "human-1", label: "Afvigelse" },
    { id: "e8", source: "condition-1", target: "action-2", label: "Match" },
    { id: "e9", source: "human-1", target: "action-2" },
  ],
};
