import { Workflow } from "@/types/workflow";

export const contentGeneration: Workflow = {
  id: "content-generation",
  title: "Multi-Platform Indholdsproduktion",
  description:
    "Ét emne → research → generer LinkedIn, nyhedsbrev og blogartikel → godkend → publicer automatisk",
  category: "marketing",
  tags: ["Content", "AI", "LinkedIn", "Marketing", "Multi-channel"],
  complexity: "complex",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Nyt Emne / Brief",
        type: "trigger",
        description: "Manuelt input eller Notion task",
        tool: "Notion",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Web Research",
        type: "api",
        description: "Søg og udtræk relevante kilder",
        tool: "Perplexity API",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "LinkedIn Post",
        type: "llm",
        description: "Kort, engagerende LinkedIn-format",
        tool: "Claude 3.5 Sonnet",
      },
    },
    {
      id: "llm-2",
      data: {
        label: "Nyhedsbrev",
        type: "llm",
        description: "Email-format med personlig tone",
        tool: "GPT-4o",
      },
    },
    {
      id: "llm-3",
      data: {
        label: "Blogartikel",
        type: "llm",
        description: "Lang SEO-optimeret artikel",
        tool: "GPT-4o",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Review & Rediger",
        type: "human",
        description: "Godkend eller tilret indhold",
        tool: "Notion / Email",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Publicer LinkedIn",
        type: "action",
        description: "Post via LinkedIn API",
        tool: "LinkedIn API",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Send Nyhedsbrev",
        type: "action",
        description: "Udsend til subscriber liste",
        tool: "Resend",
      },
    },
    {
      id: "action-3",
      data: {
        label: "Publicer Blog",
        type: "action",
        description: "Push til hjemmeside via CMS",
        tool: "Sanity CMS",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "api-1", target: "llm-2" },
    { id: "e4", source: "api-1", target: "llm-3" },
    { id: "e5", source: "llm-1", target: "human-1" },
    { id: "e6", source: "llm-2", target: "human-1" },
    { id: "e7", source: "llm-3", target: "human-1" },
    { id: "e8", source: "human-1", target: "action-1", label: "Godkendt" },
    { id: "e9", source: "human-1", target: "action-2", label: "Godkendt" },
    { id: "e10", source: "human-1", target: "action-3", label: "Godkendt" },
  ],
};
