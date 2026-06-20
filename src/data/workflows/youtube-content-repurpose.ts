import { Workflow } from "@/types/workflow";

export const youtubeContentRepurpose: Workflow = {
  id: "youtube-content-repurpose",
  title: "YouTube → Multi-Kanal Repurposing",
  description:
    "Ny video → transskribér → AI-skill genererer X-tråd, LinkedIn & blog → marketing review → planlæg i Typefully → publicer",
  summary:
    "Én video bliver automatisk til en X-tråd, et LinkedIn-opslag og en blogartikel — klar til planlægning efter ét review.",
  category: "marketing",
  tags: ["Skill", "Typefully", "AssemblyAI", "Content", "Repurposing"],
  complexity: "complex",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Ny YouTube-video",
        type: "trigger",
        description: "Video publiceret på kanalen",
        plainLanguage: "Der er lagt en ny video op.",
        tool: "YouTube Data API",
      },
    },
    {
      id: "transform-1",
      data: {
        label: "Transskribér",
        type: "transform",
        description: "Tekst med tidsstempler og kapitler",
        plainLanguage: "Videoens tale bliver til søgbar tekst.",
        tool: "AssemblyAI",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Generér Formater",
        type: "llm",
        description: "X-tråd, LinkedIn-post og SEO-blog fra samme kilde",
        plainLanguage:
          "AI'en skriver flere versioner — én pr. kanal — ud fra videoen.",
        tool: "Claude Sonnet 4.6 · skill: repurpose",
        config: {
          formats: "x-thread, linkedin, blog",
          voice: "brand-guide",
        },
      },
    },
    {
      id: "human-1",
      data: {
        label: "Marketing Review",
        type: "human",
        description: "Godkend eller finpuds udkast",
        plainLanguage: "Marketing tjekker tonen, før noget planlægges.",
        tool: "Notion",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Planlæg X-tråd",
        type: "action",
        description: "Sæt i kø på optimalt tidspunkt",
        plainLanguage: "Tråden planlægges automatisk til bedste tidspunkt.",
        tool: "Typefully",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Post LinkedIn",
        type: "action",
        description: "Publicér via API",
        plainLanguage: "LinkedIn-opslaget lægges op automatisk.",
        tool: "LinkedIn API",
      },
    },
    {
      id: "action-3",
      data: {
        label: "Publicer Blog",
        type: "action",
        description: "Push til headless CMS",
        plainLanguage: "Blogartiklen går live på hjemmesiden.",
        tool: "Sanity CMS",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "transform-1", animated: true },
    { id: "e2", source: "transform-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "human-1" },
    { id: "e4", source: "human-1", target: "action-1", label: "Godkendt" },
    { id: "e5", source: "human-1", target: "action-2", label: "Godkendt" },
    { id: "e6", source: "human-1", target: "action-3", label: "Godkendt" },
  ],
};
