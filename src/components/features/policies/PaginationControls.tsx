import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const MAX_PAGE_BUTTONS = 5;

interface PaginationControlsProps {
  total: number;
  totalPages: number;
}

function getPageButtons(current: number, totalPages: number): number[] {
  const half = Math.floor(MAX_PAGE_BUTTONS / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);
  start = Math.max(1, end - MAX_PAGE_BUTTONS + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function PaginationControls({ total, totalPages }: PaginationControlsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");

  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  const setPage = (next: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", String(next));
      return params;
    });
  };

  const setLimit = (next: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("limit", next);
      params.set("page", "1");
      return params;
    });
  };

  const pageButtons = getPageButtons(page, totalPages);

  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>Rows per page:</span>
        <Select value={String(limit)} onValueChange={setLimit}>
          <SelectTrigger size="sm" className="w-16" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">
          {rangeStart}–{rangeEnd} of {total}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </Button>

          {pageButtons.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={cn(p === page && "rounded-full")}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaginationControls;
