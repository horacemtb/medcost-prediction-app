import { useState, useEffect, useRef, useCallback, type InputHTMLAttributes } from "react";
import { medcostApi, type DadataSuggestion } from "../../api/medcost-api";

type AddressSuggestInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export function AddressSuggestInput({ value, onChange, className = "", placeholder, ...props }: AddressSuggestInputProps) {
  const [suggestions, setSuggestions] = useState<DadataSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback((query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    medcostApi.suggestAddress(query).then(
      (res) => {
        if (res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
          setOpen(true);
          setHighlight(-1);
        } else {
          setSuggestions([]);
          setOpen(false);
        }
      },
      () => {
        setSuggestions([]);
        setOpen(false);
      },
    );
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(value), 300);
    return () => clearTimeout(timerRef.current);
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const select = (suggestion: DadataSuggestion) => {
    onChange(suggestion.value);
    setOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      select(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        className={`h-8 w-full rounded-xl border border-line/70 bg-transparent px-3 text-ui-sm text-txt outline-none transition placeholder:[color:var(--placeholder)] focus:border-accent/70 focus:ring-2 focus:ring-accent/25 ${className}`.trim()}
        {...props}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-60 overflow-auto rounded-xl border border-line/50 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={() => select(s)}
              onMouseEnter={() => setHighlight(i)}
              className={`cursor-pointer px-3 py-2 text-ui-sm text-txt ${
                i === highlight ? "bg-accent/15" : "hover:bg-accent/10"
              }`}
            >
              {s.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}