import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { FuelRecord, ALL_STATES, parseShortDate } from "@/data/sampleData";
import AppNavbar from "@/components/AppNavbar";
import FilterBar from "@/components/FilterBar";
import StatsCards from "@/components/StatsCards";
import FuelTable from "@/components/FuelTable";
import ParityChart from "@/components/ParityChart";
import DashboardTicker from "@/components/DashboardTicker";
import ComparisonChart from "@/components/ComparisonChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { LayoutDashboard } from "lucide-react";

export default function Suprimentos() {
  const [data, setData] = useState<FuelRecord[]>([]);
  console.log("Index rendering, data length:", data?.length);
  const [selectedStates, setSelectedStates] = useState<string[]>(ALL_STATES);
  const [weekCount, setWeekCount] = useState(13);
  const [mainChartMode, setMainChartMode] = useState<"parity" | "comparison">("parity");
  const [comparisonMode, setComparisonMode] = useState<"mom" | "yoy">("mom");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dbLastUpdated, setDbLastUpdated] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allStates = useMemo(() => {
    return [...new Set(data.map(r => r.estado))].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let filtered = data.filter(r => selectedStates.includes(r.estado));

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(r => {
        const d = parseShortDate(r.datas);
        if (dateRange.from && d < dateRange.from) return false;
        if (dateRange.to && d > dateRange.to) return false;
        return true;
      });
    } else {
      const allDates = [...new Set(data.map(r => r.datas))]
        .sort((a, b) => parseShortDate(b).getTime() - parseShortDate(a).getTime());
      const recentDates = weekCount >= 999 ? allDates : allDates.slice(0, weekCount);
      const dateSet = new Set(recentDates);
      filtered = filtered.filter(r => dateSet.has(r.datas));
    }

    return filtered.sort((a, b) => parseShortDate(a.datas).getTime() - parseShortDate(b.datas).getTime());
    return filtered.sort((a, b) => parseShortDate(a.datas).getTime() - parseShortDate(b.datas).getTime());
  }, [data, selectedStates, weekCount, dateRange]);

  const latestDataDate = useMemo(() => {
    if (data.length === 0) return null;
    return data.reduce((max, r) => {
      const d = parseShortDate(r.datas);
      return d > max ? d : max;
    }, new Date(0));
  }, [data]);

  // Fetch from Python API (FastAPI)
  const fetchFromAPI = useCallback(async (startDate?: string) => {
    setIsRefreshing(true);
    console.log("Fetching from API...", { startDate });
    try {
      let url = "/api/history?limit=50000";
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      console.log("Request URL:", url);

      const res = await fetch(url);
      console.log("Response Status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("API Error Body:", text);
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const records: FuelRecord[] = await res.json();
      console.log("Records received:", records.length);

      if (records.length > 0) {
        setData(prev => {
          // Merge with existing data to avoid duplicates
          const existingSigs = new Set(prev.map(r => `${r.estado}-${r.datas}`));
          const newRecords = records.filter(r => !existingSigs.has(`${r.estado}-${r.datas}`));
          console.log("New records merged:", newRecords.length);
          return [...prev, ...newRecords];
        });

        const newStates = [...new Set(records.map(r => r.estado))].sort();
        setSelectedStates(prev => {
          // If user hasn't selected anything yet, select all. otherwise keep selection
          return prev.length === ALL_STATES.length ? newStates : prev;
        });
        setLastUpdated(new Date());
      } else {
        console.warn("API returned 0 records.");
      }
    } catch (err) {
      console.error("Failed to fetch from API:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Check if we need to load more data based on filters
  useEffect(() => {
    if (dateRange.from) {
      // Check if we have data for this start date
      const minDateLoaded = data.length > 0
        ? data.reduce((min, r) => {
          const d = parseShortDate(r.datas).getTime();
          return d < min ? d : min;
        }, Infinity)
        : Infinity;

      const neededStart = dateRange.from.getTime();
      // Buffer: If we need data before the minimum we have (plus 7 days buffer), fetch it
      if (neededStart < minDateLoaded) {
        console.log("Fetching older data...", dateRange.from);
        const yyyy = dateRange.from.getFullYear();
        const mm = String(dateRange.from.getMonth() + 1).padStart(2, '0');
        const dd = String(dateRange.from.getDate()).padStart(2, '0');
        // Fetch from requested start date
        fetchFromAPI(`${yyyy}-${mm}-${dd}`);
      }
    }
  }, [dateRange, data, fetchFromAPI]);

  // Initial Fetch on Mount (Default to 2022)
  useEffect(() => {
    // Always fetch initial data (2023+) to replace/augment sample data
    console.log("Initial fetch: 2023+");
    fetchFromAPI("2023-01-01");

    // Fetch DB Last Update
    fetch("/api/last-update")
      .then(res => res.json())
      .then(data => {
        if (data.last_updated) {
          // Format from YYYY-MM-DD to DD/MM/YYYY
          const [y, m, d] = data.last_updated.split("-");
          setDbLastUpdated(`${d}/${m}/${y}`);
        }
      })
      .catch(err => console.error("Failed to fetch last update:", err));
  }, [fetchFromAPI]);



  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <AppNavbar />
        {/* Ticker below navbar */}
        <div className="mt-4">
          <DashboardTicker data={data} />
        </div>

        <main className="flex-1 flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">

          {/* Header Section with Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard de Suprimentos</h2>
                <p className="text-sm text-slate-400">Acompanhamento e paridade de combustíveis.</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex h-2 w-2 rounded-full bg-green-500/50 animate-pulse" />
                  Atualizado em {lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}
                </div>
                {dbLastUpdated && (
                  <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                    Dados até: <span className="text-blue-400">{dbLastUpdated}</span>
                  </div>
                )}
              </div>
            </div>

            <FilterBar
              selectedStates={selectedStates}
              onStatesChange={setSelectedStates}
              weekCount={weekCount}
              onWeekCountChange={setWeekCount}
              allStates={allStates}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>

          <StatsCards data={filteredData} />

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Data Table - Always Visible (2/3 width on large screens) */}
            <GlassCard className="lg:col-span-2 h-[800px] p-0 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-blue-400" />
                  Dados Detalhados
                </h3>
              </div>
              <div className="flex-1 overflow-hidden p-2">
                <FuelTable data={filteredData} />
              </div>
            </GlassCard>

            {/* Chart Section (1/3 width) - Toggled View */}
            <div className="flex flex-col gap-4 h-[800px]">

              {/* Chart Toggle Controls */}
              <GlassCard className="p-2 flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider pl-2">
                  VISUALIZAÇÃO
                </span>
                <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                  <button
                    onClick={() => setMainChartMode("parity")}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono uppercase rounded-md transition-all ${mainChartMode === "parity"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    PARIDADE
                  </button>
                  <button
                    onClick={() => setMainChartMode("comparison")}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono uppercase rounded-md transition-all ${mainChartMode === "comparison"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    COMPARATIVO
                  </button>
                </div>
              </GlassCard>

              <GlassCard className="flex-1 p-4 overflow-hidden flex flex-col">
                {/* Parity Charts View */}
                {mainChartMode === "parity" && (
                  <div className="grid gap-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
                    {selectedStates.map(estado => (
                      <ParityChart key={estado} data={filteredData} estado={estado} />
                    ))}
                  </div>
                )}

                {/* Comparison Charts View */}
                {mainChartMode === "comparison" && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setComparisonMode("mom")}
                        className={`text-[10px] uppercase font-mono px-2 py-1 rounded border border-white/10 transition-colors ${comparisonMode === "mom" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                          }`}
                      >
                        MoM
                      </button>
                      <button
                        onClick={() => setComparisonMode("yoy")}
                        className={`text-[10px] uppercase font-mono px-2 py-1 rounded border border-white/10 transition-colors ${comparisonMode === "yoy" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                          }`}
                      >
                        YoY
                      </button>
                    </div>
                    <div className="grid gap-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
                      {selectedStates.map(estado => (
                        <ComparisonChart
                          key={estado}
                          data={data}
                          filteredData={filteredData}
                          estado={estado}
                          mode={comparisonMode}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
