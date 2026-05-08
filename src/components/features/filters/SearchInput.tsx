import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

function SearchInput() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("search") ?? "");
  const isInitialMount = useRef(true);

  // React Router recreates setSearchParams on every URL change (it depends on
  // searchParams in its useCallback). Storing it in a ref keeps the debounce
  // effect's dependency array stable so it only fires when the user types.
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setSearchParamsRef.current((prev) => {
        const next = new URLSearchParams(prev);
        if (inputValue) {
          next.set("search", inputValue);
        } else {
          next.delete("search");
        }
        next.set("page", "1");
        return next;
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputValue]); // setSearchParams excluded intentionally — see ref above

  return (
    <div className="relative">
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search accounts by name..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-8"
        aria-label="Search accounts"
      />
    </div>
  );
}

export default SearchInput;
