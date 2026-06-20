import { Workflow } from "@/types/workflow";

export const stripeDunningRecovery: Workflow = {
  id: "stripe-dunning-recovery",
  title: "Stripe Dunning & Win-back",
  description:
    "Betaling fejlede → hent kunde via Stripe MCP → AI skriver win-back → send → smart retry → stadig ubetalt? → eskaler til finance",
  summary:
    "Når en betaling fejler, sættes en venlig, AI-skrevet inddrivelse i gang med smart genforsøg — og kun de hårde sager når et menneske.",
  category: "finance",
  tags: ["MCP", "Stripe", "Resend", "Revenue", "Dunning"],
  complexity: "medium",
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Betaling Fejlede",
        type: "webhook",
        description: "invoice.payment_failed event",
        plainLanguage: "Et abonnement kunne ikke trækkes.",
        tool: "Stripe Webhook",
      },
    },
    {
      id: "api-1",
      data: {
        label: "Hent Kunde & Plan",
        type: "api",
        description: "Abonnement, historik og fejlårsag",
        plainLanguage:
          "Vi henfinder kundens situation, så beskeden bliver relevant.",
        tool: "Stripe MCP",
      },
    },
    {
      id: "llm-1",
      data: {
        label: "Skriv Win-back",
        type: "llm",
        description: "Tone tilpasset kundens værdi og fejlårsag",
        plainLanguage:
          "AI'en skriver en venlig påmindelse, der passer til netop denne kunde.",
        tool: "Claude Sonnet 4.6",
      },
    },
    {
      id: "action-1",
      data: {
        label: "Send Påmindelse",
        type: "action",
        description: "Email med opdateringslink til betalingskort",
        plainLanguage: "Kunden får en mail med et nemt link til at betale.",
        tool: "Resend",
      },
    },
    {
      id: "action-2",
      data: {
        label: "Smart Retry",
        type: "action",
        description: "Genforsøg på optimalt tidspunkt",
        plainLanguage:
          "Stripe prøver at trække betalingen igen på et smart tidspunkt.",
        tool: "Stripe",
      },
    },
    {
      id: "condition-1",
      data: {
        label: "Stadig Ubetalt?",
        type: "condition",
        description: "Efter sidste retry-forsøg",
        plainLanguage: "Lykkedes det stadig ikke at få betaling?",
      },
    },
    {
      id: "human-1",
      data: {
        label: "Eskaler til Finance",
        type: "human",
        description: "Manuel håndtering før churn",
        plainLanguage:
          "De sidste hårde sager tager en kollega sig personligt af.",
        tool: "Slack",
      },
    },
  ],
  edges: [
    { id: "e1", source: "trigger-1", target: "api-1", animated: true },
    { id: "e2", source: "api-1", target: "llm-1" },
    { id: "e3", source: "llm-1", target: "action-1" },
    { id: "e4", source: "action-1", target: "action-2" },
    { id: "e5", source: "action-2", target: "condition-1" },
    { id: "e6", source: "condition-1", target: "human-1", label: "Ja" },
  ],
};
