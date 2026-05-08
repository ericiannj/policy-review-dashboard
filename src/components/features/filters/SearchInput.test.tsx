import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchInput from "./SearchInput";

function ParamsDisplay() {
  const [params] = useSearchParams();
  return <output data-testid="params">{params.toString()}</output>;
}

function Wrapper({ initialPath = "/" }: { initialPath?: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <SearchInput />
      <ParamsDisplay />
    </MemoryRouter>
  );
}

describe("SearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with placeholder text", () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText("Search accounts by name...")).toBeInTheDocument();
  });

  it("initializes input value from URL search param", () => {
    render(<Wrapper initialPath="/?search=care" />);
    expect(screen.getByRole("searchbox")).toHaveValue("care");
  });

  it("does not update URL param before 300ms", () => {
    render(<Wrapper />);
    act(() => {
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "care" } });
    });
    vi.advanceTimersByTime(299);
    expect(screen.getByTestId("params").textContent).toBe("");
  });

  it("updates URL search param after 300ms debounce", () => {
    render(<Wrapper />);
    act(() => {
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "care" } });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("params").textContent).toContain("search=care");
  });

  it("resets page to 1 when search changes", () => {
    render(<Wrapper initialPath="/?page=3" />);
    act(() => {
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "care" } });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("params").textContent).toContain("page=1");
  });

  it("removes search param when input is cleared", () => {
    render(<Wrapper initialPath="/?search=care" />);
    act(() => {
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId("params").textContent).not.toContain("search=");
  });

  it("does not reset page when PaginationControls navigates to a new page", () => {
    // PageNavigator simulates what PaginationControls does when user clicks a page.
    // When it sets ?page=2, searchParams changes → setSearchParams gets a new reference
    // → the debounce effect MUST NOT fire just because of that reference change.
    function PageNavigator() {
      const [, setSearchParams] = useSearchParams();
      return (
        <button
          type="button"
          data-testid="go-page-2"
          onClick={() =>
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set("page", "2");
              return next;
            })
          }
        >
          page 2
        </button>
      );
    }

    render(
      <MemoryRouter initialEntries={["/?page=1"]}>
        <SearchInput />
        <PageNavigator />
        <ParamsDisplay />
      </MemoryRouter>,
    );

    act(() => {
      screen.getByTestId("go-page-2").click();
    });

    expect(screen.getByTestId("params").textContent).toContain("page=2");

    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Page must remain 2 — the debounce must NOT have fired
    expect(screen.getByTestId("params").textContent).toContain("page=2");
  });
});
