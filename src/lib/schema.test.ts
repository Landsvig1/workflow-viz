import { describe, it, expect } from "vitest";
import { validateWorkflow } from "./schema";

const valid = {
  id: "demo",
  title: "Demo Workflow",
  description: "A demo",
  category: "sales",
  tags: ["a", "b"],
  complexity: "medium",
  nodes: [
    { id: "n1", data: { label: "Start", type: "trigger" } },
    { id: "n2", data: { label: "Do", type: "action", tool: "Slack" } },
  ],
  edges: [{ id: "e1", source: "n1", target: "n2" }],
};

describe("validateWorkflow", () => {
  it("accepts a valid workflow", () => {
    const result = validateWorkflow(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.workflow.id).toBe("demo");
      expect(result.workflow.nodes).toHaveLength(2);
    }
  });

  it("accepts nodes without a position field", () => {
    // positions are computed, not authored
    expect(validateWorkflow(valid).ok).toBe(true);
  });

  it("accepts a workflow with optional fields absent", () => {
    expect(validateWorkflow(valid).ok).toBe(true);
  });

  it("accepts optional fields when present", () => {
    const withOptionals = {
      ...valid,
      summary: "plain summary",
      nodes: [
        {
          id: "n1",
          data: {
            label: "Start",
            type: "trigger",
            plainLanguage: "kicks things off",
            config: { url: "https://x" },
            io: { inputs: ["form"], outputs: ["lead"] },
          },
        },
        { id: "n2", data: { label: "Do", type: "action" } },
      ],
    };
    expect(validateWorkflow(withOptionals).ok).toBe(true);
  });

  it("rejects a missing required field (node label)", () => {
    const broken = {
      ...valid,
      nodes: [{ id: "n1", data: { type: "trigger" } }, valid.nodes[1]],
    };
    const result = validateWorkflow(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path.includes("label"))).toBe(true);
    }
  });

  it("rejects an unknown node type", () => {
    const broken = {
      ...valid,
      nodes: [{ id: "n1", data: { label: "x", type: "foo" } }, valid.nodes[1]],
    };
    const result = validateWorkflow(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path.includes("type"))).toBe(true);
    }
  });

  it("rejects an edge referencing a non-existent source node", () => {
    const broken = {
      ...valid,
      edges: [{ id: "eX", source: "ghost", target: "n2" }],
    };
    const result = validateWorkflow(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.message.includes("ghost"))
      ).toBe(true);
    }
  });

  it("rejects an edge with a missing target reference", () => {
    const broken = {
      ...valid,
      edges: [{ id: "eX", source: "n1", target: "nowhere" }],
    };
    const result = validateWorkflow(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.message.includes("nowhere"))
      ).toBe(true);
    }
  });

  it("rejects an empty node list", () => {
    expect(validateWorkflow({ ...valid, nodes: [] }).ok).toBe(false);
  });
});

describe("validateWorkflow — lanes, edge kinds, layout", () => {
  const withLanes = {
    ...valid,
    lanes: [
      { id: "l1", label: "One" },
      { id: "l2", label: "Two" },
    ],
    layout: { layerSpacing: 64, rowPitch: 150, laneGap: 44 },
    nodes: [
      { id: "n1", lane: "l1", data: { label: "Start", type: "trigger" } },
      { id: "n2", lane: "l2", data: { label: "Do", type: "action" } },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", kind: "refines" }],
  };

  it("accepts lanes, node.lane, edge.kind and layout together", () => {
    expect(validateWorkflow(withLanes).ok).toBe(true);
  });

  it("rejects a node.lane referencing an unknown lane", () => {
    const broken = {
      ...withLanes,
      nodes: [
        { id: "n1", lane: "ghost", data: { label: "Start", type: "trigger" } },
        withLanes.nodes[1],
      ],
    };
    const result = validateWorkflow(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.message.includes("ghost"))).toBe(true);
    }
  });

  it("rejects a node.lane when the workflow declares no lanes", () => {
    const broken = {
      ...valid,
      nodes: [
        { id: "n1", lane: "l1", data: { label: "Start", type: "trigger" } },
        valid.nodes[1],
      ],
    };
    expect(validateWorkflow(broken).ok).toBe(false);
  });

  it("rejects an unknown edge kind", () => {
    const broken = {
      ...withLanes,
      edges: [{ id: "e1", source: "n1", target: "n2", kind: "bogus" }],
    };
    expect(validateWorkflow(broken).ok).toBe(false);
  });

  it("rejects a non-positive spacing override", () => {
    const broken = { ...withLanes, layout: { layerSpacing: -5 } };
    expect(validateWorkflow(broken).ok).toBe(false);
  });
});
