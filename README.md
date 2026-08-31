# Workflow Viz

Interactive node-graph visualizer for AI automation workflows, LLM pipelines, and multi-agent systems — designed so technical and non-technical stakeholders understand architectures equally well.

Workflows are authored as **position-free data**. Graph layout, layering, orthogonal edge routing, and swimlanes are computed automatically via [ELK](https://github.com/kieler/elkjs).

---

## Features

- **Data-driven auto-layout** — Author workflows purely as JSON/TypeScript data without hardcoded coordinates. Layout is generated dynamically via layered ELK routing.
- **2D Swimlanes** — Group nodes into horizontal functional swimlane bands (`lanes`) with automatic sub-row packing to eliminate overlaps.
- **Typed semantic edges** — Differentiate process sequence flow from non-sequential relationships (`modifies`, `refines`, `authorizes`, `duplicates`, `shares-data`) with distinct colors, dash patterns, and a dynamic legend.
- **Subgraph focus & isolation** — Click any node to isolate its dependency subgraph (direct upstream and downstream connections) while dimming the rest of the canvas.
- **Progressive disclosure inspector** — Click any node to open a slide-over panel displaying a plain-language summary first, followed by technical configurations, tools, and I/O contracts.
- **In-session import sandbox** — Visit `/import` to paste or upload arbitrary workflow JSON and inspect it immediately with zero persistence.
- **Strict schema validation** — Runtime validation powered by Zod ensures all nodes, edge sources/targets, and lane IDs are structurally sound before rendering.
- **Static pre-rendering** — All built-in workflow routes are statically pre-rendered at build time with Next.js App Router SSG.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run test suite (Vitest)
npm test

# Build for production (SSG)
npm run build
```

---

## Authoring a Workflow

To add a workflow to the built-in library, create a file in `src/data/workflows/` and register it in `src/data/index.ts`.

### Standard Workflow Example

```ts
import { Workflow } from "@/types/workflow";

export const customerSupportWorkflow: Workflow = {
  id: "customer-support",
  title: "AI Customer Support Triage",
  description: "Automated ticket categorization, sentiment analysis, and smart escalation",
  summary: "Routes incoming customer tickets to automated LLM responses or human agents.",
  category: "customer-support", // sales | finance | customer-support | operations | hr | marketing
  tags: ["LLM", "Zendesk", "Slack", "Triage"],
  complexity: "medium", // simple | medium | complex
  nodes: [
    {
      id: "webhook-trigger",
      data: {
        label: "Incoming Ticket",
        type: "webhook", // trigger | llm | api | erp | condition | action | human | transform | webhook
        plainLanguage: "Fires whenever a customer submits a support ticket.",
        description: "Zendesk webhook listener receiving raw ticket payload.",
        tool: "Zendesk Webhook",
      },
    },
    {
      id: "sentiment-llm",
      data: {
        label: "Analyze Sentiment & Intent",
        type: "llm",
        plainLanguage: "Reads the ticket to gauge urgency and identify the user issue.",
        description: "Extracts intent classification and urgency score.",
        tool: "Claude 3.5 Sonnet",
        config: { temperature: "0.2", max_tokens: "500" },
        io: {
          inputs: ["ticket_text"],
          outputs: ["intent", "urgency_score"],
        },
      },
    },
  ],
  edges: [
    {
      id: "e1",
      source: "webhook-trigger",
      target: "sentiment-llm",
      animated: true,
    },
  ],
};
```

### Swimlane & Relationship Example

```ts
export const regulationWorkflow: Workflow = {
  id: "regulatory-chain",
  title: "Regulatory Compliance Pipeline",
  description: "Cross-jurisdiction legal rule mapping",
  category: "operations",
  tags: ["Compliance", "Legal", "Graph"],
  complexity: "complex",
  lanes: [
    { id: "eu-law", label: "EU Regulations" },
    { id: "national-law", label: "National Legislation" },
    { id: "inspection", label: "Field Operations" },
  ],
  nodes: [
    {
      id: "eu-reg",
      lane: "eu-law",
      data: { label: "CFP Basic Reg 1380/2013", type: "erp" },
    },
    {
      id: "nat-order",
      lane: "national-law",
      data: { label: "Executive Order §4", type: "condition" },
    },
  ],
  edges: [
    {
      id: "e1",
      source: "eu-reg",
      target: "nat-order",
      label: "authorizes",
      kind: "authorizes", // modifies | refines | authorizes | duplicates | shares-data | sequence
    },
  ],
};
```

---

## Architecture

| Layer | Path | Responsibility |
|---|---|---|
| **Schema & Validation** | [`src/lib/schema.ts`](src/lib/schema.ts) | Zod schema definition, referential integrity check |
| **Auto-Layout Engine** | [`src/lib/layout.ts`](src/lib/layout.ts) | ELK layered layout, swimlane coordinate mapping & row-packing |
| **Edge Routing & Styling** | [`src/lib/edge-path.ts`](src/lib/edge-path.ts), [`src/lib/edge-style.ts`](src/lib/edge-style.ts) | Orthogonal bend points, smooth-step paths, relationship semantics |
| **Canvas & Interactive UI** | [`src/components/FlowCanvas.tsx`](src/components/FlowCanvas.tsx) | React Flow canvas wrapper, focus dimming, minimap, controls |
| **Inspector Panel** | [`src/components/NodeInspector.tsx`](src/components/NodeInspector.tsx) | Slide-over inspector for plain-language + technical details |
| **Navigation Rail** | [`src/components/Rail.tsx`](src/components/Rail.tsx) | Categorized, collapsible sidebar navigation |
| **Data Registry** | [`src/data/`](src/data/) | Authored workflow library (19 production examples) |

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, SSG)
- **UI & Graph**: [React 19](https://react.dev/), [@xyflow/react](https://reactflow.dev/) (React Flow)
- **Layout**: [elkjs](https://github.com/kieler/elkjs) (Eclipse Layout Kernel in JavaScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/), Testing Library, JSDOM

---

## License

This project is licensed under the [MIT License](LICENSE).
