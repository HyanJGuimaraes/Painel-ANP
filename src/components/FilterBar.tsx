import { Check, ChevronDown, X, CalendarIcon, RotateCcw, MapPin, Map } from "lucide-react";
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
  allStates?: string[];

  viewLevel?: "estado" | "municipio";
  onViewLevelChange?: (level: "estado" | "municipio") => void;

  selectedCities?: string[];
  onCitiesChange?: (cities: string[]) => void;
  allCities?: string[];

  weekCount: number;
  onWeekCountChange: (n: number) => void;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const PERIOD_OPTIONS = [
  { label: "Mês", value: 4 },
  { label: "Trimestre", value: 13 },
  { label: "Semestre", value: 26 },
  { label: "Ano", value: 52 },
];

export default function FilterBar({
  selectedStates, onStatesChange, allStates,
  viewLevel = "estado", onViewLevelChange,
  selectedCities = [], onCitiesChange, allCities = [],
  weekCount, onWeekCountChange,
  dateRange, onDateRangeChange
}: FilterBarProps) {
  const states = allStates || ALL_STATES;
  const cities = allCities;
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateOpen(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
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

  const toggleCity = (c: string) => {
    if (onCitiesChange) {
      if (selectedCities.includes(c)) {
        if (selectedCities.length > 1) onCitiesChange(selectedCities.filter(x => x !== c));
      } else {
        onCitiesChange([...selectedCities, c]);
      }
    }
  };

  const clearAllFilters = () => {
    onStatesChange(states);
    if (onCitiesChange) onCitiesChange(cities);
    onWeekCountChange(13);
    onDateRangeChange?.({ from: undefined, to: undefined });
  };

  const hasActiveFilters =
    selectedStates.length !== states.length ||
    (selectedCities.length > 0 && selectedCities.length !== cities.length) ||
    weekCount !== 13 ||
    (dateRange?.from !== undefined || dateRange?.to !== undefined);

  return (
    <div className="relative z-50 flex flex-wrap items-center gap-3 px-6 py-4 backdrop-blur-md bg-[#0f172a]/80 border border-white/10 mx-6 rounded-2xl mt-4 shadow-xl">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Filtros</span>

      {/* View Level Toggle (Estado vs Municipio) */}
      {onViewLevelChange && (
        <div className="flex bg-black/30 rounded-xl p-1 border border-white/5 mr-2">
          <button
            onClick={() => onViewLevelChange("estado")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              viewLevel === "estado" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Map className="w-3.5 h-3.5" />
            Estado
          </button>
          <button
            onClick={() => onViewLevelChange("municipio")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              viewLevel === "municipio" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            Município
          </button>
        </div>
      )}

      {/* State selector */}
      <div className="relative" ref={stateRef}>
        <button
          onClick={() => setStateOpen(!stateOpen)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
        >
          <span className="max-w-[150px] truncate">
            {selectedStates.length === states.length
              ? "Todos os estados"
              : selectedStates.map(s => STATE_ABBREVIATIONS[s] || s).join(", ")}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
        {stateOpen && (
          <div className="absolute left-0 top-full z-[60] mt-2 w-72 rounded-xl border border-white/10 bg-[#0f172a] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Select all / Deselect all */}
            <div className="flex gap-1 mb-2 p-2 pb-0">
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
                  <div className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border ${selectedStates.includes(s)
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-600"
                    }`}>
                    {selectedStates.includes(s) && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <span className="truncate">{STATE_ABBREVIATIONS[s] || s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* City selector (Only visible in municipio mode) */}
      {viewLevel === "municipio" && onCitiesChange && (
        <div className="relative" ref={cityRef}>
          <button
            onClick={() => setCityOpen(!cityOpen)}
            className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-200 transition-all hover:bg-purple-500/20 hover:border-purple-500/50 active:scale-95"
          >
            <span className="max-w-[200px] truncate">
              {cities.length === 0 ? "Nenhuma cidade"
                : selectedCities.length === cities.length ? "Todas as cidades"
                  : `${selectedCities.length} cidade(s)`}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-purple-400" />
          </button>

          {cityOpen && (
            <div className="absolute left-0 top-full z-[60] mt-2 w-80 rounded-xl border border-purple-500/20 bg-[#0f172a] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex gap-1 mb-2 p-2 pb-0">
                <button
                  onClick={() => onCitiesChange(cities)}
                  disabled={selectedCities.length === cities.length || cities.length === 0}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  Todas
                </button>
                <button
                  onClick={() => cities.length > 0 && onCitiesChange([cities[0]])}
                  disabled={selectedCities.length <= 1}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Nenhuma
                </button>
              </div>
              <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                {cities.length === 0 ? (
                  <div className="text-center p-4 text-sm text-slate-500">Selecione um estado com cidades.</div>
                ) : (
                  cities.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCity(c)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${selectedCities.includes(c)
                        ? "bg-purple-500/20 text-purple-200"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        }`}
                    >
                      <div className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border ${selectedCities.includes(c)
                        ? "border-purple-500 bg-purple-500"
                        : "border-slate-600"
                        }`}>
                        {selectedCities.includes(c) && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className="truncate">{c}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
              "gap-2 text-xs rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 h-[34px]",
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
            className="p-3 pointer-events-auto bg-slate-900 text-slate-200 border-white/10 shadow-2xl rounded-xl"
          />
        </PopoverContent>
      </Popover>

      {/* Clear all filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 ml-auto h-[34px]"
        >
          <RotateCcw className="h-3 w-3" />
          Limpar
        </button>
      )}
    </div>
  );
}

