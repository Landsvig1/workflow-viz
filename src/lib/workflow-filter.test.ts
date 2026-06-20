import { describe, it, expect } from "vitest";
import { filterWorkflows } from "./workflow-filter";
import type { Workflow } from "@/types/workflow";

const wf = (over: Partial<Workflow>): Workflow => ({
  id: over.id ?? "id",
  title: over.title ?? "Title",
  description: over.description ?? "Description",
  summary: over.summary,
  category: over.category ?? "sales",
  tags: over.tags ?? [],
  complexity: over.complexity ?? "simple",
  nodes: over.nodes ?? [{ id: "n1", data: { label: "L", type: "trigger" } }],
  edges: over.edges ?? [],
});

const lib: Workflow[] = [
  wf({
    id: "a",
    title: "Lead Enrichment",
    category: "sales",
    complexity: "medium",
    tags: ["CRM"],
    nodes: [
      { id: "n1", data: { label: "x", type: "trigger" } },
      { id: "n2", data: { label: "y", type: "llm" } },
    ],
  }),
  wf({
    id: "b",
    title: "Invoice Processing",
    category: "finance",
    complexity: "complex",
    tags: ["OCR"],
    nodes: [{ id: "n1", data: { label: "x", type: "erp" } }],
  }),
];

describe("filterWorkflows", () => {
  it("returns all with empty filters", () => {
    expect(filterWorkflows(lib, {})).toHaveLength(2);
  });

  it("matches a title case-insensitively", () => {
    const r = filterWorkflows(lib, { query: "invoice" });
    expect(r.map((w) => w.id)).toEqual(["b"]);
  });

  it("matches a tag", () => {
    const r = filterWorkflows(lib, { query: "crm" });
    expect(r.map((w) => w.id)).toEqual(["a"]);
  });

  it("filters by category", () => {
    const r = filterWorkflows(lib, { category: "finance" });
    expect(r.map((w) => w.id)).toEqual(["b"]);
  });

  it("filters by complexity", () => {
    const r = filterWorkflows(lib, { complexity: "medium" });
    expect(r.map((w) => w.id)).toEqual(["a"]);
  });

  it("filters by node type presence", () => {
    const r = filterWorkflows(lib, { nodeType: "llm" });
    expect(r.map((w) => w.id)).toEqual(["a"]);
  });

  it("ANDs filters together", () => {
    expect(filterWorkflows(lib, { category: "sales", complexity: "complex" }))
      .toHaveLength(0);
    expect(
      filterWorkflows(lib, { category: "sales", complexity: "medium" }).map(
        (w) => w.id
      )
    ).toEqual(["a"]);
  });

  it("returns empty array on no match", () => {
    expect(filterWorkflows(lib, { query: "zzz-nothing" })).toEqual([]);
  });
});
