import { describe, it, expect } from "vitest";
import { layoutWorkflow } from "./layout";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const node = (id: string): WorkflowNode => ({
  id,
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
});
