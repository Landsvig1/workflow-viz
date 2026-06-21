import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkflowStage } from "./WorkflowStage";
import type { Workflow } from "@/types/workflow";

// Isolate the header logic — the viewer relies on React Flow + elk, covered elsewhere.
vi.mock("@/components/WorkflowViewer", () => ({
  WorkflowViewer: () => <div data-testid="viewer" />,
}));

const base: Workflow = {
  id: "demo",
  title: "Demo Flow",
  description: "desc",
  summary: "A plain summary",
  category: "operations",
  tags: [],
  complexity: "simple",
  nodes: [{ id: "n1", data: { label: "Start", type: "trigger" } }],
  edges: [],
};

describe("WorkflowStage", () => {
  it("renders the title and summary", () => {
    render(<WorkflowStage workflow={base} />);
    expect(screen.getByText("Demo Flow")).toBeInTheDocument();
    expect(screen.getByText("A plain summary")).toBeInTheDocument();
  });

  it("renders the category chip", () => {
    render(<WorkflowStage workflow={base} />);
    expect(screen.getByText("Operations")).toBeInTheDocument();
  });

  it("omits the summary line when no summary is present", () => {
    render(<WorkflowStage workflow={{ ...base, summary: undefined }} />);
    expect(screen.queryByText("A plain summary")).not.toBeInTheDocument();
  });

  it("renders the viewer region", () => {
    render(<WorkflowStage workflow={base} />);
    expect(screen.getByTestId("viewer")).toBeInTheDocument();
  });
});
