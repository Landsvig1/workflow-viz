import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NodeInspector } from "./NodeInspector";
import type { WorkflowNodeData } from "@/types/workflow";

const full: WorkflowNodeData = {
  label: "AI Scoring",
  type: "llm",
  plainLanguage: "PLAINTEXT explains it simply",
  description: "TECHTEXT model call",
  tool: "GPT-4o",
  config: { model: "gpt-4o", temperature: "0.2" },
};

describe("NodeInspector", () => {
  it("renders nothing when no node is selected", () => {
    const { container } = render(
      <NodeInspector node={null} onClose={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows plain-language before technical detail", () => {
    const { container } = render(
      <NodeInspector node={full} onClose={() => {}} />
    );
    const text = container.textContent ?? "";
    expect(text.indexOf("PLAINTEXT")).toBeGreaterThanOrEqual(0);
    expect(text.indexOf("PLAINTEXT")).toBeLessThan(text.indexOf("TECHTEXT"));
  });

  it("renders one row per config entry", () => {
    render(<NodeInspector node={full} onClose={() => {}} />);
    expect(screen.getByText("model")).toBeInTheDocument();
    expect(screen.getByText("gpt-4o")).toBeInTheDocument();
    expect(screen.getByText("temperature")).toBeInTheDocument();
    expect(screen.getByText("0.2")).toBeInTheDocument();
  });

  it("omits sections that have no data (no empty headers)", () => {
    const minimal: WorkflowNodeData = {
      label: "Start",
      type: "trigger",
      plainLanguage: "kicks off",
    };
    render(<NodeInspector node={minimal} onClose={() => {}} />);
    expect(screen.queryByText("Teknisk")).not.toBeInTheDocument();
    expect(screen.queryByText("Værktøj")).not.toBeInTheDocument();
    expect(screen.queryByText("Konfiguration")).not.toBeInTheDocument();
  });

  it("fires onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<NodeInspector node={full} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Luk"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fires onClose on Escape", () => {
    const onClose = vi.fn();
    render(<NodeInspector node={full} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
