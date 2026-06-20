import { Workflow } from "@/types/workflow";

export const claudeCodePrReview: Workflow = {
  id: "claude-code-pr-review",
  title: "Claude Code PR-Review & Auto-Merge",
  description:
    "PR åbnet → hent diff via GitHub MCP → Claude Code review → blokerende issues? → inline-kommentarer eller auto-merge → Vercel preview → Slack",
  summary:
    "Hver pull request reviewes automatisk af Claude Code; rene PR'er merges og deployes, mens dem med problemer får konkrete inline-kommentarer.",
  category: "operations",
  tags: ["Claude Code", "GitHub MCP", "Vercel", "DevOps", "Agentic"],
  complexity: "complex",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "PR Åbnet",
        type: "webhook",
        description: "Ny eller opdateret pull request",
        plainLanguage: "En udvikler åbner en pull request.",
        tool: "GitHub Webhook",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Hent Diff & Kontekst",
        type: "api",
        description: "Ændringer, berørte filer og relateret kode",
        plainLanguage:
          "Vi henter hele ændringen plus den omkringliggende kode, AI'en skal forstå.",
        tool: "GitHub MCP",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Claude Code Review",
        type: "llm",
        description: "Korrekthed, sikkerhed, tests og konventioner",
        plainLanguage:
          "Claude Code læser ændringen som en erfaren reviewer og finder fejl og risici.",
        tool: "Claude Opus 4.8",
        config: {
          checks: "correctness, security, tests, style",
          mode: "agentic + repo-aware",
        },
      },
    },
    {
      id: "condition-1",
      data: {
        label: "Blokerende Issues?",
        type: "condition",
        description: "Findes der fejl, der bør stoppe merge?",
        plainLanguage: "Er der noget alvorligt galt? Så stopper vi her.",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Post Inline-Kommentarer",
        type: "action",
        description: "Konkret feedback direkte på de relevante linjer",
        plainLanguage:
          "Udvikleren får præcis feedback på de linjer, der skal rettes.",
        tool: "GitHub MCP",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Auto-godkend & Merge",
        type: "action",
        description: "Squash-merge når alle checks er grønne",
        plainLanguage: "Rene PR'er merges automatisk uden ventetid.",
        tool: "GitHub MCP",
      },
    },
    {
      id: "api-2",
      data: {
        label: "Vercel Preview Deploy",
        type: "api",
        description: "Byg og deploy preview-miljø",
        plainLanguage: "Ændringen deployes til et preview-miljø med det samme.",
        tool: "Vercel",
      },
    },
    {
      id: "action-3",
      data: {
        label: "Slack-notifikation",
        type: "action",
        description: "Status og preview-link til teamet",
        plainLanguage: "Teamet får besked om resultatet med et klikbart link.",
        tool: "Slack",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "condition-1" },
    {
      id: "e4",
      source: "condition-1",
      target: "action-1",
      label: "Issues",
    },
    { id: "e5", source: "condition-1", target: "action-2", label: "Ren" },
    { id: "e6", source: "action-2", target: "api-2" },
    { id: "e7", source: "api-2", target: "action-3" },
    { id: "e8", source: "action-1", target: "action-3" },
  ],
};
