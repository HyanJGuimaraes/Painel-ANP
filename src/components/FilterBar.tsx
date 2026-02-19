import { Check, ChevronDown, X, CalendarIcon, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ALL_STATES, STATE_ABBREVIATIONS } from "@/data/sampleData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  selectedStates: string[];
  onStatesChange: (states: string[]) => void;
  weekCount: number;
  onWeekCountChange: (n: number) => void;
  allStates?: string[];
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const PERIOD_OPTIONS = [
  { label: "Mês", value: 4 },
  { label: "Trimestre", value: 13 },
  { label: "Semestre", value: 26 },
  { label: "Ano", value: 52 },
];

export default function FilterBar({ selectedStates, onStatesChange, weekCount, onWeekCountChange, allStates, dateRange, onDateRangeChange }: FilterBarProps) {
  const states = allStates || ALL_STATES;
  const [stateOpen, setStateOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setStateOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleState = (s: string) => {
    if (selectedStates.includes(s)) {
      if (selectedStates.length > 1) onStatesChange(selectedStates.filter(x => x !== s));
    } else {
      onStatesChange([...selectedStates, s]);
    }
  };

  const clearStates = () => {
    onStatesChange(states);
  };

  const clearAllFilters = () => {
    onStatesChange(states);
    onWeekCountChange(13);
    onDateRangeChange?.({ from: undefined, to: undefined });
  };

  const hasActiveFilters =
    selectedStates.length !== states.length ||
    weekCount !== 13 ||
    (dateRange?.from !== undefined || dateRange?.to !== undefined);

  return (
    <div className="relative z-50 flex flex-wrap items-center gap-3 px-6 py-4 backdrop-blur-md bg-[#0f172a]/80 border border-white/10 mx-6 rounded-2xl mt-4 shadow-xl">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Filtros</span>

      {/* State selector */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setStateOpen(!stateOpen)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
        >
          <span>
            {selectedStates.length === states.length
              ? "Todos os estados"
              : selectedStates.map(s => STATE_ABBREVIATIONS[s] || s).join(", ")}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
        {stateOpen && (
          <div className="absolute left-0 top-full z-[60] mt-2 w-72 rounded-xl border border-white/10 bg-[#0f172a] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Select all / Deselect all */}
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => onStatesChange(states)}
                disabled={selectedStates.length === states.length}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
              >
                <Check className="h-3 w-3" />
                Todos
              </button>
              <button
                onClick={() => onStatesChange([states[0]])}
                disabled={selectedStates.length === 1}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
              >
                <X className="h-3 w-3" />
                Nenhum
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto custom-scrollbar p-2">
              {states.map(s => (
                <button
                  key={s}
                  onClick={() => toggleState(s)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${selectedStates.includes(s)
                    ? "bg-blue-500/20 text-blue-200"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                >
                  <div className={`flex h-3 w-3 items-center justify-center rounded-[3px] border ${selectedStates.includes(s)
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-600"
                    }`}>
                    {selectedStates.includes(s) && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  {STATE_ABBREVIATIONS[s] || s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Period selector */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onWeekCountChange(opt.value)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${weekCount === opt.value
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Date range picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 text-xs rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20",
              dateRange?.from && "text-blue-300 border-blue-500/30 bg-blue-500/10"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} – {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yy", { locale: ptBR })
              )
            ) : (
              "Período"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-white/10 bg-slate-900/90 backdrop-blur-xl" align="start">
          <Calendar
            mode="range"
            selected={dateRange?.from ? { from: dateRange.from, to: dateRange.to } : undefined}
            onSelect={(range) => {
              onDateRangeChange?.({
                from: range?.from,
                to: range?.to,
              });
            }}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Clear all filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
          Limpar
        </button>
      )}
    </div>
  );
}
