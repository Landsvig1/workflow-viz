import { Workflow } from "@/types/workflow";

export const dra: Workflow = {
  id: "dra",
  title: "Deep Research Agent (DRA)",
  description:
    "Brugerforespørgsel → Dekomponering → Generér Research-plan → Godkend Retning → Vælg Provider (Exa/Firecrawl) → Faktabekræftelse (Retry ved <0.7) → Syntese → Gem Rapport",
  summary:
    "Dekomponerer et emne, skaber en research-plan til din godkendelse, indhenter data via Exa/Firecrawl med intelligent gensøgning ved lav tillid, og gemmer en tæt rapport.",
  category: "operations",
  tags: ["Skill", "Research", "Exa", "Firecrawl", "Verification"],
  complexity: "complex",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Brugerforespørgsel",
        type: "trigger",
        description: "En dybdegående researchopgave startes via /DRA",
        plainLanguage: "Du indtaster et emne eller spørgsmål, du vil have undersøgt.",
        tool: "User Input",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Dekomponering",
        type: "llm",
        description: "Opdeler emnet i 3-7 konkrete delspørgsmål",
        plainLanguage: "Modellen bryder dit spørgsmål ned i mindre, fokuserede delspørgsmål, så intet overses.",
        tool: "Gemini 1.5 Pro",
      },
    },
    {
      id: "llm-2",
      data: {
        label: "Generér Research-plan",
        type: "llm",
        description: "Skaber en kilde- og spørgsmålsplan",
        plainLanguage: "Der oprettes en research-plan tilpasset opgavens kompleksitet med de mest optimale kilder.",
        tool: "Gemini 1.5 Pro",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Godkend Retning",
        type: "human",
        description: "Pause for brugergodkendelse af planen",
        plainLanguage: "Arbejdet pauses kort, indtil du har godkendt kilderne og retningen.",
        tool: "User Console",
      },
    },
    {
      id: "condition-1",
      data: {
        label: "Vælg Provider",
        type: "condition",
        description: "Vælger det mest effektive søgeværktøj for hvert spørgsmål",
        plainLanguage: "Hvert delspørgsmål sendes til den mest relevante kilde for at spare tid og API-omkostninger.",
        tool: "Router Logic",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Exa Semantisk Søgning",
        type: "api",
        description: "Foretager semantiske søgninger i specifikke databaser",
        plainLanguage: "Exa søger efter specifikke dokumenter, teams, rapporter og videnskabelige artikler.",
        tool: "Exa API",
      },
    },
    {
      id: "api-2",
      data: {
        label: "Firecrawl Scraping",
        type: "api",
        description: "Henter renset markdown fra komplekse eller JS-tunge sider",
        plainLanguage: "Firecrawl læser komplekse hjemmesider og trækker det rene indhold ud som tekst.",
        tool: "Firecrawl API / CLI",
      },
    },
    {
      id: "api-3",
      data: {
        label: "Direkte Web Fetch",
        type: "api",
        description: "Native indlæsning af simple websider uden ekstra omkostninger",
        plainLanguage: "Hurtig indlæsning af almindelige hjemmesider for at minimere API-omkostninger.",
        tool: "read_url_content",
      },
    },
    {
      id: "llm-3",
      data: {
        label: "Faktabekræftelse & Evaluering",
        type: "llm",
        description: "Vurderer troværdighed og fuldstændighed",
        plainLanguage: "Modellen tjekker de fundne oplysninger. Hvis troværdigheden (Confidence Score) er under 0.7, prøver den igen.",
        tool: "Gemini 1.5 Pro",
      },
    },
    {
      id: "condition-2",
      data: {
        label: "Skal der gensøges?",
        type: "condition",
        description: "Beslutter om der skal foretages en ny søgning med justerede parametre",
        plainLanguage: "Hvis kvaliteten er for lav, genstartes søgningen med nye søgeord og filtre.",
        tool: "Retry Logic",
      },
    },
    {
      id: "llm-4",
      data: {
        label: "Rapport-syntese",
        type: "llm",
        description: "Samler de validerede fakta til en struktureret rapport uden AI-fluff",
        plainLanguage: "De godkendte svar samles til en tæt, faktabaseret rapport.",
        tool: "Gemini 1.5 Pro",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Gem Rapport",
        type: "action",
        description: "Gemmer rapporten som markdown i Gem-CLI Outputs",
        plainLanguage: "Rapporten gemmes direkte i din 'Outputs/Research' mappe, klar til brug.",
        tool: "Filesystem",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "llm-1", animated: true },
    { id: "e2", source: "llm-1", target: "llm-2", animated: true },
    { id: "e3", source: "llm-2", target: "human-1", animated: true },
    { id: "e4", source: "human-1", target: "condition-1", label: "Godkendt", animated: true },
    { id: "e5", source: "condition-1", target: "api-1", label: "Semantic/Entity" },
    { id: "e6", source: "condition-1", target: "api-2", label: "Dynamic/Complex Web" },
    { id: "e7", source: "condition-1", target: "api-3", label: "Static/Basic Web" },
    { id: "e8", source: "api-1", target: "llm-3" },
    { id: "e9", source: "api-2", target: "llm-3" },
    { id: "e10", source: "api-3", target: "llm-3" },
    { id: "e11", source: "llm-3", target: "condition-2", animated: true },
    { id: "e12", source: "condition-2", target: "condition-1", label: "Lav tillid (<0.7)", animated: true },
    { id: "e13", source: "condition-2", target: "llm-4", label: "Høj tillid (>=0.7)", animated: true },
    { id: "e14", source: "llm-4", target: "action-1", animated: true },
  ],
};
