import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PendingReviewsField, { type ReviewEntry, toReviewEntry } from "./PendingReviewsField";

const SAMPLE: ReviewEntry = toReviewEntry({
  type: "License",
  dueDate: "2026-06-01",
  severity: "high",
});

describe("PendingReviewsField", () => {
  it("renders empty state when list is empty", () => {
    render(<PendingReviewsField value={[]} onChange={vi.fn()} />);
    expect(screen.getByText(/no pending reviews/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add review/i })).toBeInTheDocument();
  });

  it("renders existing reviews", () => {
    render(<PendingReviewsField value={[SAMPLE]} onChange={vi.fn()} />);
    expect(screen.getByRole("group", { name: /pending review 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove review 1/i })).toBeInTheDocument();
  });

  it("calls onChange with new item when Add review is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PendingReviewsField value={[]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /add review/i }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ type: "License", severity: "low", dueDate: "" }),
    ]);
  });

  it("calls onChange without the removed item when Remove is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const second = toReviewEntry({ type: "Care Plan", dueDate: "2026-07-01", severity: "medium" });
    const reviews: ReviewEntry[] = [SAMPLE, second];
    render(<PendingReviewsField value={reviews} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /remove review 1/i }));

    expect(onChange).toHaveBeenCalledWith([second]);
  });

  it("empty list is valid — Add review button always visible", () => {
    render(<PendingReviewsField value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add review/i })).toBeEnabled();
  });

  it("renders multiple reviews", () => {
    const second = toReviewEntry({
      type: "Staff Training",
      dueDate: "2026-07-15",
      severity: "critical",
    });
    render(<PendingReviewsField value={[SAMPLE, second]} onChange={vi.fn()} />);
    expect(screen.getByRole("group", { name: /pending review 1/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /pending review 2/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /remove review/i })).toHaveLength(2);
  });
});
