import { Workflow } from "@/types/workflow";

export const aiReleaseNotes: Workflow = {
  id: "ai-release-notes",
  title: "AI Release Notes fra Merged PRs",
  description:
    "Git-tag pushet → hent merged PRs via GitHub MCP → AI skriver release notes → maintainer godkender → changelog + Discord + email",
  summary:
    "Ved hver release samler AI'en de merged pull requests til læsbare release notes, der publiceres til changelog, Discord og nyhedsbrev.",
  category: "operations",
  tags: ["GitHub MCP", "Changelog", "Discord", "Resend", "DevRel"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Git-tag Pushet",
        type: "trigger",
        description: "Ny version tagget (semver)",
        plainLanguage: "En ny version af produktet er klar til release.",
        tool: "GitHub Webhook",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Hent Merged PRs",
        type: "api",
        description: "Alle PRs siden forrige tag, med labels",
        plainLanguage:
          "Vi samler alle ændringer, der er kommet med siden sidste udgivelse.",
        tool: "GitHub MCP",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Skriv Release Notes",
        type: "llm",
        description: "Grupperet i Nyt / Forbedret / Rettet, brugersprog",
        plainLanguage:
          "AI'en oversætter tekniske ændringer til noget, brugere forstår.",
        tool: "Claude Sonnet 4.6",
        config: { sections: "Added, Improved, Fixed", tone: "user-facing" },
      },
    },
    {
      id: "human-1",
      data: {
        label: "Maintainer Godkender",
        type: "human",
        description: "Hurtigt review før publicering",
        plainLanguage: "En vedligeholder tjekker, før det går ud.",
        tool: "Slack",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Publicer Changelog",
        type: "action",
        description: "Opdater offentlig changelog-side",
        plainLanguage: "Release notes lægges på den offentlige changelog.",
        tool: "Changelog API",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Post i Discord",
        type: "action",
        description: "Annoncér i #releases",
        plainLanguage: "Communityet får besked i Discord.",
        tool: "Discord",
      },
    },
    {
      id: "action-3",
      data: {
        label: "Email til Subscribers",
        type: "action",
        description: "Udsend til produktnyhedsbrev",
        plainLanguage: "Abonnenter får de nye features i indbakken.",
        tool: "Resend",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "human-1" },
    { id: "e4", source: "human-1", target: "action-1", label: "Godkendt" },
    { id: "e5", source: "human-1", target: "action-2", label: "Godkendt" },
    { id: "e6", source: "human-1", target: "action-3", label: "Godkendt" },
  ],
};
