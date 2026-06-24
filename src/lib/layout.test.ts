import { describe, it, expect } from "vitest";
import { layoutWorkflow } from "./layout";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const node = (id: string): WorkflowNode => ({
  id,
  data: { label: id, type: "action" },
});

const lnode = (id: string, lane?: string): WorkflowNode => ({
  id,
  lane,
  data: { label: id, type: "action" },
});

describe("layoutWorkflow", () => {
  it("positions a linear chain left-to-right with increasing x", async () => {
    const nodes = [node("a"), node("b"), node("c")];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "a", target: "b" },
      { id: "e2", source: "b", target: "c" },
    ];
    const { nodes: out } = await layoutWorkflow(nodes, edges);
    const x = Object.fromEntries(out.map((n) => [n.id, n.position.x]));
    expect(x.a).toBeLessThan(x.b);
    expect(x.b).toBeLessThan(x.c);
    out.forEach((n) => {
      expect(Number.isNaN(n.position.x)).toBe(false);
      expect(Number.isNaN(n.position.y)).toBe(false);
    });
  });

  it("separates branch targets onto different rows", async () => {
    const nodes = [node("cond"), node("a"), node("b")];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "cond", target: "a" },
      { id: "e2", source: "cond", target: "b" },
    ];
    const { nodes: out } = await layoutWorkflow(nodes, edges);
    const a = out.find((n) => n.id === "a")!;
    const b = out.find((n) => n.id === "b")!;
    expect(a.position.y).not.toBe(b.position.y);
  });

  it("positions every node when there are multiple triggers", async () => {
    const nodes = [node("t1"), node("t2"), node("merge")];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "t1", target: "merge" },
      { id: "e2", source: "t2", target: "merge" },
    ];
    const { nodes: out } = await layoutWorkflow(nodes, edges);
    expect(out).toHaveLength(3);
    expect(new Set(out.map((n) => n.id))).toEqual(
      new Set(["t1", "t2", "merge"])
    );
  });

  it("handles a single node", async () => {
    const { nodes: out } = await layoutWorkflow([node("solo")], []);
    expect(out).toHaveLength(1);
    expect(typeof out[0].position.x).toBe("number");
    expect(typeof out[0].position.y).toBe("number");
  });

  it("returns each input node exactly once with numeric coordinates", async () => {
    const nodes = [node("a"), node("b"), node("c")];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "a", target: "b" }];
    const { nodes: out } = await layoutWorkflow(nodes, edges);
    expect(out.map((n) => n.id).sort()).toEqual(["a", "b", "c"]);
    out.forEach((n) => {
      expect(typeof n.position.x).toBe("number");
      expect(typeof n.position.y).toBe("number");
      expect(n.type).toBe("workflowNode");
    });
  });

  it("returns a routed edge for every input edge, exactly once", async () => {
    const nodes = [node("a"), node("b"), node("c")];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "a", target: "b" },
      { id: "e2", source: "b", target: "c" },
    ];
    const { edges: out } = await layoutWorkflow(nodes, edges);
    expect(out.map((e) => e.id).sort()).toEqual(["e1", "e2"]);
  });

  it("gives each routed edge bend points with numeric coordinates", async () => {
    const nodes = [node("a"), node("b")];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "a", target: "b" }];
    const { edges: out } = await layoutWorkflow(nodes, edges);
    expect(Array.isArray(out[0].bendPoints)).toBe(true);
    out[0].bendPoints.forEach((p) => {
      expect(typeof p.x).toBe("number");
      expect(typeof p.y).toBe("number");
      expect(Number.isNaN(p.x)).toBe(false);
    });
  });

  it("routes a branch edge with interior bend points", async () => {
    // a fan-out forces at least one edge to bend around a sibling node
    const nodes = [node("src"), node("a"), node("b"), node("c")];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "src", target: "a" },
      { id: "e2", source: "src", target: "b" },
      { id: "e3", source: "src", target: "c" },
    ];
    const { edges: out } = await layoutWorkflow(nodes, edges);
    const totalBends = out.reduce((sum, e) => sum + e.bendPoints.length, 0);
    expect(totalBends).toBeGreaterThan(0);
  });

  it("returns no lane bands when the workflow has no lanes", async () => {
    const { lanes } = await layoutWorkflow([node("a")], []);
    expect(lanes).toEqual([]);
  });
});

describe("layoutWorkflow — swimlanes", () => {
  const lanes = [
    { id: "top", label: "Top" },
    { id: "bottom", label: "Bottom" },
  ];

  it("returns one band per lane with positive, numeric geometry", async () => {
    const nodes = [lnode("a", "top"), lnode("b", "bottom")];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "a", target: "b" }];
    const { lanes: bands } = await layoutWorkflow(nodes, edges, lanes);
    expect(bands.map((b) => b.id)).toEqual(["top", "bottom"]);
    bands.forEach((b) => {
      [b.x, b.y, b.width, b.height].forEach((v) => {
        expect(Number.isNaN(v)).toBe(false);
      });
      expect(b.width).toBeGreaterThan(0);
      expect(b.height).toBeGreaterThan(0);
    });
  });

  it("places a node in its lane's band (declared order = top to bottom)", async () => {
    const nodes = [lnode("a", "top"), lnode("b", "bottom")];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "a", target: "b" }];
    const { nodes: out } = await layoutWorkflow(nodes, edges, lanes);
    const a = out.find((n) => n.id === "a")!;
    const b = out.find((n) => n.id === "b")!;
    expect(a.position.y).toBeLessThan(b.position.y);
  });

  it("stacks bands top-to-bottom without overlapping", async () => {
    const nodes = [lnode("a", "top"), lnode("b", "bottom")];
    const { lanes: bands } = await layoutWorkflow(nodes, [], lanes);
    const top = bands.find((b) => b.id === "top")!;
    const bottom = bands.find((b) => b.id === "bottom")!;
    expect(top.y + top.height).toBeLessThanOrEqual(bottom.y);
  });

  it("keeps x driven by the process sequence within a lane", async () => {
    const nodes = [lnode("a", "top"), lnode("b", "top"), lnode("c", "top")];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "a", target: "b" },
      { id: "e2", source: "b", target: "c" },
    ];
    const { nodes: out } = await layoutWorkflow(nodes, edges, lanes);
    const x = Object.fromEntries(out.map((n) => [n.id, n.position.x]));
    expect(x.a).toBeLessThan(x.b);
    expect(x.b).toBeLessThan(x.c);
  });

  it("stacks two same-lane nodes that share a layer onto different rows", async () => {
    const nodes = [
      lnode("cond", "top"),
      lnode("a", "bottom"),
      lnode("b", "bottom"),
    ];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "cond", target: "a" },
      { id: "e2", source: "cond", target: "b" },
    ];
    const { nodes: out } = await layoutWorkflow(nodes, edges, lanes);
    const a = out.find((n) => n.id === "a")!;
    const b = out.find((n) => n.id === "b")!;
    expect(a.position.y).not.toBe(b.position.y);
  });

  it("drops elk bend points in lane mode (straight connectors)", async () => {
    const nodes = [lnode("a", "top"), lnode("b", "bottom")];
    const edges: WorkflowEdge[] = [{ id: "e1", source: "a", target: "b" }];
    const { edges: out } = await layoutWorkflow(nodes, edges, lanes);
    expect(out[0].bendPoints).toEqual([]);
  });

  it("excludes reference edges from layering but positions every node", async () => {
    const nodes = [lnode("a", "top"), lnode("b", "bottom")];
    const edges: WorkflowEdge[] = [
      { id: "seq", source: "a", target: "b" },
      { id: "ref", source: "b", target: "a", kind: "duplicates" },
    ];
    const { nodes: out, edges: outEdges } = await layoutWorkflow(
      nodes,
      edges,
      lanes
    );
    expect(out).toHaveLength(2);
    expect(outEdges.map((e) => e.id).sort()).toEqual(["ref", "seq"]);
  });

  it("routes a node with an unknown lane to the last declared lane", async () => {
    const nodes = [lnode("a", "top"), lnode("x", "does-not-exist")];
    const { nodes: out, lanes: bands } = await layoutWorkflow(
      nodes,
      [],
      lanes
    );
    const x = out.find((n) => n.id === "x")!;
    const bottom = bands.find((b) => b.id === "bottom")!;
    expect(x.position.y).toBeGreaterThanOrEqual(bottom.y);
  });
});

describe("layoutWorkflow — spacing overrides", () => {
  it("widens the horizontal span when layerSpacing grows", async () => {
    const nodes = [node("a"), node("b"), node("c")];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "a", target: "b" },
      { id: "e2", source: "b", target: "c" },
    ];
    const span = async (layerSpacing: number) => {
      const { nodes: out } = await layoutWorkflow(nodes, edges, undefined, {
        layerSpacing,
      });
      const xs = out.map((n) => n.position.x);
      return Math.max(...xs) - Math.min(...xs);
    };
    expect(await span(200)).toBeGreaterThan(await span(40));
  });

  it("increases the gap between stacked rows when rowPitch grows", async () => {
    const lanes = [{ id: "l", label: "L" }];
    const nodes = [lnode("cond", "l"), lnode("a", "l"), lnode("b", "l")];
    const edges: WorkflowEdge[] = [
      { id: "e1", source: "cond", target: "a" },
      { id: "e2", source: "cond", target: "b" },
    ];
    const gap = async (rowPitch: number) => {
      const { nodes: out } = await layoutWorkflow(nodes, edges, lanes, {
        rowPitch,
      });
      const a = out.find((n) => n.id === "a")!;
      const b = out.find((n) => n.id === "b")!;
      return Math.abs(a.position.y - b.position.y);
    };
    expect(await gap(220)).toBeGreaterThan(await gap(130));
  });
});
