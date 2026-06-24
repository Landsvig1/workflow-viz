import { describe, it, expect } from "vitest";
import { EDGE_KIND_STYLE, isReferenceKind } from "./edge-style";
import type { EdgeKind } from "@/types/workflow";

const REFERENCE_KINDS = [
  "modifies",
  "refines",
  "authorizes",
  "duplicates",
  "shares-data",
] as const;

describe("isReferenceKind", () => {
  it("treats undefined and sequence as non-reference (process flow)", () => {
    expect(isReferenceKind(undefined)).toBe(false);
    expect(isReferenceKind("sequence")).toBe(false);
  });

  it("treats every relationship kind as a reference", () => {
    REFERENCE_KINDS.forEach((k) => {
      expect(isReferenceKind(k)).toBe(true);
    });
  });
});

describe("EDGE_KIND_STYLE", () => {
  it("has a hex color and a non-empty legend for every reference kind", () => {
    REFERENCE_KINDS.forEach((k) => {
      const style = EDGE_KIND_STYLE[k];
      expect(style).toBeDefined();
      expect(style.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(style.legend.length).toBeGreaterThan(0);
    });
  });

  it("does not define a style for the sequence kind", () => {
    expect(
      (EDGE_KIND_STYLE as Record<EdgeKind, unknown>).sequence
    ).toBeUndefined();
  });
});
