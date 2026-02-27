import { useState, useMemo, useCallback, useEffect } from "react";
import { FuelRecord } from "@/types/fuel";
import { ALL_STATES, parseShortDate, calculateRecord } from "@/lib/fuel";
import AppNavbar from "@/components/AppNavbar";
import StatsCards from "@/components/StatsCards";
import FuelTable from "@/components/FuelTable";
import ParityChart from "@/components/ParityChart";
import DashboardTicker from "@/components/DashboardTicker";
import ComparisonChart from "@/components/ComparisonChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { LayoutDashboard, X } from "lucide-react";
import { DatePickerWithRange } from '../components/DateRangePicker';
import { MunicipalityMultiSelect } from '../components/MunicipalityMultiSelect';
import { StateMultiSelect } from '../components/StateMultiSelect';
import { DateRange } from 'react-day-picker';
import { subMonths } from 'date-fns';

const STATE_REGIONS: Record<string, string> = {
  "AC": "NORTE", "AL": "NORDESTE", "AM": "NORTE", "AP": "NORTE", "BA": "NORDESTE", "CE": "NORDESTE",
  "DF": "CENTRO OESTE", "ES": "SUDESTE", "GO": "CENTRO OESTE", "MA": "NORDESTE", "MG": "SUDESTE",
  "MS": "CENTRO OESTE", "MT": "CENTRO OESTE", "PA": "NORTE", "PB": "NORDESTE", "PE": "NORDESTE",
  "PI": "NORDESTE", "PR": "SUL", "RJ": "SUDESTE", "RN": "NORDESTE", "RO": "NORTE", "RR": "NORTE",
  "RS": "SUL", "SC": "SUL", "SE": "NORDESTE", "SP": "SUDESTE", "TO": "NORTE"
};
const REGIONS = ["CENTRO OESTE", "NORDESTE", "NORTE", "SUDESTE", "SUL"];

export default function Suprimentos() {
  const [data, setData] = useState<FuelRecord[]>([]);
  const [cityData, setCityData] = useState<FuelRecord[]>([]);

  const [selectedRegion, setSelectedRegion] = useState("TODAS");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedMunicipalityKeys, setSelectedMunicipalityKeys] = useState<string[]>([]);
  const viewLevel: "estado" | "municipio" = selectedMunicipalityKeys.length > 0 ? "municipio" : "estado";

  const [mainChartMode, setMainChartMode] = useState<"parity" | "comparison">("parity");
  const [comparisonMode, setComparisonMode] = useState<"mom" | "yoy">("mom");

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dbLastUpdated, setDbLastUpdated] = useState<string | null>(null);

  const activeData = viewLevel === "estado" ? data : cityData;

  const allStates = useMemo(() => {
    let states = [...new Set(data.map(r => r.estado))].sort();
    if (selectedRegion !== "TODAS") {
      states = states.filter(s => STATE_REGIONS[s] === selectedRegion);
    }
    return states;
  }, [data, selectedRegion]);

  const statesOptions = useMemo(() => {
    return allStates.map(s => ({ value: s, label: s }));
  }, [allStates]);

  const municipalityOptions = useMemo(() => {
    let filtered = cityData;
    if (selectedRegion !== "TODAS") filtered = filtered.filter(r => STATE_REGIONS[r.estado] === selectedRegion);
    if (selectedStates.length > 0) filtered = filtered.filter(r => selectedStates.includes(r.estado));

    const uniqueKeys = new Set<string>();
    filtered.forEach(r => {
      if (r.municipio) uniqueKeys.add(`${r.municipio} - ${r.estado}`);
    });

    return Array.from(uniqueKeys).sort().map(key => ({
      value: key,
      label: key
    }));
  }, [cityData, selectedRegion, selectedStates]);

  const filteredData = useMemo(() => {
    let filtered = activeData;

    // Apply geographic filters
    if (viewLevel === "estado") {
      if (selectedStates.length > 0) {
        filtered = filtered.filter(r => selectedStates.includes(r.estado));
      } else if (selectedRegion !== "TODAS") {
        filtered = filtered.filter(r => STATE_REGIONS[r.estado] === selectedRegion);
      }
    } else {
      // viewLevel === "municipio"
      if (selectedMunicipalityKeys.length > 0) {
        filtered = filtered.filter(r => r.municipio && selectedMunicipalityKeys.includes(`${r.municipio} - ${r.estado}`));
      } else {
        // Just enforce region and state level first, showing ALL municipalities inside them
        if (selectedStates.length > 0) {
          filtered = filtered.filter(r => selectedStates.includes(r.estado));
        } else if (selectedRegion !== "TODAS") {
          filtered = filtered.filter(r => STATE_REGIONS[r.estado] === selectedRegion);
        }
      }
    }

    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter(r => {
        const d = parseShortDate(r.datas);
        if (dateRange.from && d < dateRange.from) return false;
        if (dateRange.to && d > dateRange.to) return false;
        return true;
      });
    }

    return filtered.sort((a, b) => parseShortDate(a.datas).getTime() - parseShortDate(b.datas).getTime());
  }, [activeData, selectedRegion, selectedStates, selectedMunicipalityKeys, viewLevel, dateRange]);

  const latestDataDate = useMemo(() => {
    if (activeData.length === 0) return null;
    return activeData.reduce((max, r) => {
      const d = parseShortDate(r.datas);
      return d > max ? d : max;
    }, new Date(0));
  }, [activeData]);

  // Fetch from Python API (FastAPI)
  const fetchFromAPI = useCallback(async (startDate?: string) => {
    setIsRefreshing(true);
    try {
      let stateUrl = "/api/history?limit=50000";
      let cityUrl = "/api/history/municipalities?";
      if (startDate) {
        stateUrl += `&start_date=${startDate}`;
        cityUrl += `start_date=${startDate}`;
      }

      const [stateRes, cityRes] = await Promise.all([
        fetch(stateUrl),
        fetch(cityUrl)
      ]);

      if (stateRes.ok) {
        const records: FuelRecord[] = await stateRes.json();
        if (records.length > 0) {
          setData(prev => {
            const existingSigs = new Set(prev.map(r => `${r.estado}-${r.datas}`));
            const newRecords = records.filter(r => !existingSigs.has(`${r.estado}-${r.datas}`));
            return [...prev, ...newRecords];
          });
        }
      }

      if (cityRes.ok) {
        const cityRows: { estado: string, municipio: string, produto: string, preco_medio_revenda: number, data_inicial: string, data_final: string }[] = await cityRes.json();

        // Pivot city data: (municipio + datas) -> { etanol, gasolina }
        const map = new Map<string, { estado: string, municipio: string, datas: string, etanol?: number, gasolina?: number }>();

        for (const row of cityRows) {
          // Data is already handled in backend but just in case it is a string like 2024-01-01
          const dataFinalObj = row.data_final;
          const dataInicialObj = row.data_inicial;

          let dateStrFinal = "";
          let dateStrInicial = "";

          if (typeof dataFinalObj === 'string') {
            const dtParts = dataFinalObj.split("-");
            if (dtParts.length === 3) dateStrFinal = `${dtParts[2]}/${dtParts[1]}/${dtParts[0]}`;
            else dateStrFinal = new Date(dataFinalObj).toLocaleDateString('pt-BR');
          } else {
            dateStrFinal = new Date(dataFinalObj).toLocaleDateString('pt-BR');
          }

          if (typeof dataInicialObj === 'string') {
            const dtParts = dataInicialObj.split("-");
            if (dtParts.length === 3) dateStrInicial = `${dtParts[2]}/${dtParts[1]}/${dtParts[0]}`;
            else dateStrInicial = new Date(dataInicialObj).toLocaleDateString('pt-BR');
          } else {
            // handle if it is missing
            dateStrInicial = dateStrFinal;
          }

          const datas = `${dateStrInicial} - ${dateStrFinal}`;
          const key = `${row.municipio}-${datas}`;

          if (!map.has(key)) {
            map.set(key, { estado: row.estado, municipio: row.municipio, datas });
          }

          const entry = map.get(key)!;
          const prod = row.produto.toUpperCase();
          if (prod.includes("ETANOL")) entry.etanol = row.preco_medio_revenda;
          if (prod.includes("GASOLINA")) entry.gasolina = row.preco_medio_revenda;
        }

        const newCityRecords: FuelRecord[] = [];
        for (const entry of map.values()) {
          if (entry.etanol != null && entry.gasolina != null) {
            const rec = calculateRecord(entry.estado, entry.datas, entry.etanol, entry.gasolina);
            rec.municipio = entry.municipio;
            newCityRecords.push(rec);
          }
        }

        if (newCityRecords.length > 0) {
          setCityData(prev => {
            const existingSigs = new Set(prev.map(r => `${r.municipio}-${r.datas}`));
            const newRecords = newCityRecords.filter(r => !existingSigs.has(`${r.municipio}-${r.datas}`));
            return [...prev, ...newRecords];
          });
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch from API:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Check if we need to load more data based on filters
  useEffect(() => {
    if (dateRange?.from) {
      // Check if we have data for this start date
      const minDateLoaded = activeData.length > 0
        ? activeData.reduce((min, r) => {
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
  }, [dateRange, activeData, fetchFromAPI]);

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

  // Grouping labels for charts depending on viewLevel
  const getChartGroups = () => {
    if (viewLevel === "estado") {
      let statesList: string[] = [];
      if (selectedStates.length > 0) statesList = selectedStates;
      else if (selectedRegion !== "TODAS") statesList = allStates.filter(s => STATE_REGIONS[s] === selectedRegion);
      else statesList = [...new Set(filteredData.map(r => r.estado))].sort();

      return statesList.map(s => ({ estado: s, municipio: undefined }));
    }

    // Municipio
    return selectedMunicipalityKeys.slice(0, 20).map(k => {
      const [mun, est] = k.split(" - ");
      return { estado: est, municipio: mun };
    });
  };


  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block">
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
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard de Suprimentos</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhamento e paridade de combustíveis.</p>
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

            <GlassCard className="p-4">
              <div className="flex flex-col gap-4">

                {/* Top Filters: Region + State */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedRegion}
                    onChange={(e) => { setSelectedRegion(e.target.value); setSelectedStates([]); setSelectedMunicipalityKeys([]); }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="TODAS">Região: Todas</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  <StateMultiSelect
                    options={statesOptions}
                    value={selectedStates}
                    onChange={(val) => { setSelectedStates(val); setSelectedMunicipalityKeys([]); }}
                  />
                </div>

                <div className="h-px bg-slate-200 dark:bg-white/5 w-full" />

                {/* Bottom Filters: Searchable Municipality + Date Picker */}
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    Município:
                  </label>
                  <MunicipalityMultiSelect
                    options={municipalityOptions}
                    value={selectedMunicipalityKeys}
                    onChange={setSelectedMunicipalityKeys}
                  />
                </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      Período:
                    </label>
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex items-center w-full md:w-auto mt-2 lg:mt-0 lg:ml-auto">
                    <button
                      onClick={() => {
                        setSelectedRegion("TODAS");
                        setSelectedStates([]);
                        setSelectedMunicipalityKeys([]);
                        setDateRange({
                          from: subMonths(new Date(), 6),
                          to: new Date()
                        });
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors w-full md:w-auto"
                    >
                      <X className="w-4 h-4" />
                      Limpar
                    </button>
                  </div>
                </div>

              </div>
            </GlassCard>
          </div>

          <StatsCards data={filteredData} />

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Data Table - Always Visible (2/3 width on large screens) */}
            <GlassCard className="lg:col-span-2 h-[800px] p-0 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Dados Detalhados {viewLevel === "municipio" && <span className="text-purple-400 text-xs ml-2">(Por Município)</span>}
                </h3>
              </div>
              <div className="flex-1 overflow-hidden p-2">
                <FuelTable data={filteredData} viewLevel={viewLevel} />
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
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
                      }`}
                  >
                    PARIDADE
                  </button>
                  <button
                    onClick={() => setMainChartMode("comparison")}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono uppercase rounded-md transition-all ${mainChartMode === "comparison"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
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
                    {getChartGroups().map(group => (
                      <ParityChart
                        key={group.municipio ? `${group.municipio}-${group.estado}` : group.estado}
                        data={filteredData}
                        estado={group.estado}
                        municipio={group.municipio}
                      />
                    ))}
                  </div>
                )}

                {/* Comparison Charts View */}
                {mainChartMode === "comparison" && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setComparisonMode("mom")}
                        className={`text-[10px] uppercase font-mono px-2 py-1 rounded border transition-colors ${comparisonMode === "mom" ? "bg-slate-800 text-white border-slate-700 dark:bg-white/10 dark:border-white/10" : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-white/10 dark:hover:text-slate-300 dark:hover:bg-transparent"
                          }`}
                      >
                        MoM
                      </button>
                      <button
                        onClick={() => setComparisonMode("yoy")}
                        className={`text-[10px] uppercase font-mono px-2 py-1 rounded border transition-colors ${comparisonMode === "yoy" ? "bg-slate-800 text-white border-slate-700 dark:bg-white/10 dark:border-white/10" : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-white/10 dark:hover:text-slate-300 dark:hover:bg-transparent"
                          }`}
                      >
                        YoY
                      </button>
                    </div>
                    <div className="grid gap-4 overflow-y-auto pr-1 custom-scrollbar flex-1">
                      {getChartGroups().map(group => (
                        <ComparisonChart
                          key={group.municipio ? `${group.municipio}-${group.estado}` : group.estado}
                          data={activeData}
                          filteredData={filteredData}
                          estado={group.estado}
                          municipio={group.municipio}
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
