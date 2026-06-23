import { describe, it, expect } from "vitest";
import { buildEdgePath, edgeMidpoint, type Point } from "./edge-path";

describe("buildEdgePath", () => {
  it("returns an empty string for no points", () => {
    expect(buildEdgePath([])).toBe("");
  });

  it("returns a move-only path for a single point", () => {
    expect(buildEdgePath([{ x: 5, y: 7 }])).toBe("M 5 7");
  });

  it("draws a straight line for two points (no curves)", () => {
    const d = buildEdgePath([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]);
    expect(d).toBe("M 0 0 L 100 0");
    expect(d).not.toContain("Q");
  });

  it("rounds an interior corner with a quadratic curve", () => {
    const d = buildEdgePath([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ]);
    expect(d).toContain("Q 100 0"); // curve through the bend vertex
    expect(d.startsWith("M 0 0")).toBe(true);
    expect(d.trim().endsWith("100 100")).toBe(true);
  });

  it("traverses every bend in a multi-point path", () => {
    const pts: Point[] = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 },
      { x: 120, y: 50 },
    ];
    const d = buildEdgePath(pts);
    // two interior corners → two quadratic segments
    expect((d.match(/Q/g) ?? []).length).toBe(2);
  });

  it("produces no NaN coordinates", () => {
    const d = buildEdgePath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
    ]);
    expect(d).not.toContain("NaN");
  });
});

describe("edgeMidpoint", () => {
  it("returns the arc-length midpoint of a straight line", () => {
    expect(edgeMidpoint([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ])).toEqual({ x: 50, y: 0 });
  });

  it("follows the polyline, not the source→target straight line", () => {
    // L-shape: total length 200, midpoint at the corner (100,0)
    const mid = edgeMidpoint([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ]);
    expect(mid).toEqual({ x: 100, y: 0 });
  });

  it("handles a single point", () => {
    expect(edgeMidpoint([{ x: 3, y: 4 }])).toEqual({ x: 3, y: 4 });
  });
});
