import { describe, it, expect } from "vitest";
import { workflows, FEATURED_WORKFLOW_ID, getFeaturedWorkflow } from "./index";

describe("featured workflow", () => {
  it("FEATURED_WORKFLOW_ID matches a real workflow", () => {
    expect(workflows.some((w) => w.id === FEATURED_WORKFLOW_ID)).toBe(true);
  });

  it("getFeaturedWorkflow returns the featured workflow", () => {
    expect(getFeaturedWorkflow().id).toBe(FEATURED_WORKFLOW_ID);
  });
});
