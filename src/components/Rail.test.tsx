import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Rail, type RailItem } from "./Rail";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

const items: RailItem[] = [
  { id: "lead-enrichment", title: "Lead Enrichment", category: "sales" },
  { id: "ai-sdr-outreach", title: "AI SDR", category: "sales" },
  { id: "figma-to-code", title: "Figma to Code", category: "operations" },
];

const FEATURED = "figma-to-code";

beforeEach(() => {
  mockPathname = "/";
  localStorage.clear();
});

describe("Rail", () => {
  it("renders every item grouped under its category heading", () => {
    render(<Rail items={items} featuredId={FEATURED} />);
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Operations")).toBeInTheDocument();
    expect(screen.getByText("Lead Enrichment")).toBeInTheDocument();
    expect(screen.getByText("AI SDR")).toBeInTheDocument();
    expect(screen.getByText("Figma to Code")).toBeInTheDocument();
  });

  it("marks the item matching /workflow/<id> as active", () => {
    mockPathname = "/workflow/ai-sdr-outreach";
    render(<Rail items={items} featuredId={FEATURED} />);
    expect(screen.getByText("AI SDR").closest("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByText("Lead Enrichment").closest("a")).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("marks the featured item active on the root path", () => {
    mockPathname = "/";
    render(<Rail items={items} featuredId={FEATURED} />);
    expect(screen.getByText("Figma to Code").closest("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("collapses and hides item labels on toggle", () => {
    render(<Rail items={items} featuredId={FEATURED} />);
    expect(screen.getByText("Lead Enrichment")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Skjul menu"));
    expect(screen.queryByText("Lead Enrichment")).not.toBeInTheDocument();
  });

  it("renders an Import link to /import", () => {
    render(<Rail items={items} featuredId={FEATURED} />);
    expect(screen.getByText("Importér JSON").closest("a")).toHaveAttribute(
      "href",
      "/import"
    );
  });

  it("starts collapsed when localStorage has the collapsed flag", async () => {
    localStorage.setItem("wv-rail-collapsed", "1");
    render(<Rail items={items} featuredId={FEATURED} />);
    await waitFor(() =>
      expect(screen.queryByText("Lead Enrichment")).not.toBeInTheDocument()
    );
  });

  it("links the featured item to / and others to /workflow/<id>", () => {
    render(<Rail items={items} featuredId={FEATURED} />);
    expect(screen.getByText("Figma to Code").closest("a")).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByText("Lead Enrichment").closest("a")).toHaveAttribute(
      "href",
      "/workflow/lead-enrichment"
    );
  });
});
