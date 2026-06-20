# Workflow Viz

Interactive node-graph visualizations of AI automation workflows, automations, and agents — built so non-technical and technical readers understand them equally well.

- **Progressive disclosure** — the graph reads clean by default; click any node to reveal a plain-language explanation, the tool used, and its config.
- **Run playback** — press play to watch the workflow execute step by step.
- **Data-driven** — workflows are position-free JSON; positions are computed by auto-layout (elkjs). Adding a workflow is writing one file.

## Getting Started

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (prerenders every workflow)
npm test         # run the Vitest suite
```

## Adding a workflow

A workflow is **just data** — no coordinates, no manual layout. Create a file in `src/data/workflows/` and register it in `src/data/index.ts`.

```ts
import { Workflow } from "@/types/workflow";

export const myWorkflow: Workflow = {
  id: "my-workflow",
  title: "My Workflow",
  description: "One-line technical description",
  summary: "Plain-language summary for non-technical readers",
  category: "operations", // sales | finance | customer-support | operations | hr | marketing
  tags: ["Example"],
  complexity: "simple", // simple | medium | complex
  nodes: [
    {
      id: "trigger-1",
      data: {
        label: "Start",
        type: "trigger", // trigger | llm | api | erp | condition | action | human | transform | webhook
        plainLanguage: "What this step does, in human terms",
        description: "Technical detail (shown in the inspector)",
        tool: "Webhook",
        config: { key: "value" }, // optional, shown in the inspector
      },
    },
    // ...more nodes (no position field — it's computed)
  ],
  edges: [{ id: "e1", source: "trigger-1", target: "...", animated: true }],
};
```

Every workflow is validated against the schema (`src/lib/schema.ts`) at load time — a malformed workflow fails the build with a readable error (e.g. an edge referencing a missing node).

### Import without committing

Visit `/import` to paste or upload a workflow JSON and visualize it in-session. Nothing is persisted — the in-repo files remain the canonical library.

## Architecture

| Concern | Location |
|---------|----------|
| Schema + validation | `src/lib/schema.ts` (zod) |
| Auto-layout | `src/lib/layout.ts` (elkjs, left-to-right layered) |
| Run playback (topological) | `src/lib/playback.ts` |
| Library search/filter | `src/lib/workflow-filter.ts` |
| Canvas + inspector + playback | `src/components/WorkflowViewer.tsx` |
| Workflow data | `src/data/workflows/` |

Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, React Flow (`@xyflow/react`).
