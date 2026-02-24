import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, X } from 'lucide-react';
import { DatePickerWithRange } from '../components/DateRangePicker';
import { MunicipalityMultiSelect } from '../components/MunicipalityMultiSelect';
import { StateMultiSelect } from '../components/StateMultiSelect';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import AppNavbar from '../components/AppNavbar';
import { GlassCard } from '../components/ui/GlassCard';

// Types
interface MunicipalityRecord {
    id: number;
    data_final: string;
    data_inicial: string;
    estado: string;
    municipio: string;
    regiao: string;
    produto: string;
    preco_medio_revenda: number;
    preco_min_revenda: number;
    preco_max_revenda: number;
}

const PRODUCTS = [
    "OLEO DIESEL S10",
    "OLEO DIESEL",
    "GASOLINA COMUM",
    "GASOLINA ADITIVADA",
    "ETANOL HIDRATADO"
];

export default function Licitacoes() {
    // State
    const [selectedProduct, setSelectedProduct] = useState("OLEO DIESEL S10");
    const [selectedRegion, setSelectedRegion] = useState("TODAS");
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [selectedMunicipalityKeys, setSelectedMunicipalityKeys] = useState<string[]>([]); // Keys: "Municipality - UF"
    const [dbLastUpdated, setDbLastUpdated] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subMonths(new Date(), 6),
        to: new Date(),
    });

    // Fetch DB Last Update
    useState(() => {
        fetch("/api/last-update")
            .then(res => res.json())
            .then(data => {
                if (data.last_updated) {
                    const [y, m, d] = data.last_updated.split("-");
                    setDbLastUpdated(`${d}/${m}/${y}`);
                }
            })
            .catch(err => console.error("Failed to fetch last update:", err));
    });

    // Validated Date Strings for API
    const queryParams = useMemo(() => {
        const start = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
        const end = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';
        return { start, end };
    }, [dateRange]);

    // Data Fetching
    const { data: records, isLoading } = useQuery({
        queryKey: ['municipalities', selectedProduct, queryParams.start, queryParams.end],
        queryFn: async () => {
            const params = new URLSearchParams({
                product: selectedProduct,
                start_date: queryParams.start,
                end_date: queryParams.end
            });
            const res = await fetch(`/api/history/municipalities?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch data');
            return res.json() as Promise<MunicipalityRecord[]>;
        },
        enabled: !!queryParams.start
    });

    // Unique Lists for Dropdowns
    const regions = useMemo(() => [...new Set(records?.map(r => r.regiao) || [])].sort(), [records]);
    const statesOptions = useMemo(() => {
        let filtered = records || [];
        if (selectedRegion !== "TODAS") filtered = filtered.filter(r => r.regiao === selectedRegion);
        return [...new Set(filtered.map(r => r.estado))].sort().map(s => ({ value: s, label: s }));
    }, [records, selectedRegion]);

    // Generate Combobox Options (Unique "Municipality - UF")
    const municipalityOptions = useMemo(() => {
        if (!records) return [];
        let filtered = records;

        // Apply pre-filters if selected (Region/State)
        if (selectedRegion !== "TODAS") filtered = filtered.filter(r => r.regiao === selectedRegion);
        if (selectedStates.length > 0) filtered = filtered.filter(r => selectedStates.includes(r.estado));

        const uniqueKeys = new Set<string>();
        filtered.forEach(r => uniqueKeys.add(`${r.municipio} - ${r.estado}`));

        return Array.from(uniqueKeys).sort().map(key => ({
            value: key,
            label: key
        }));
    }, [records, selectedRegion, selectedStates]);


    // Filter Logic
    const filteredRecords = useMemo(() => {
        if (!records) return [];
        const filtered = records.filter(r => {
            if (selectedRegion !== "TODAS" && r.regiao !== selectedRegion) return false;
            if (selectedStates.length > 0 && !selectedStates.includes(r.estado)) return false;

            // Strict precise filtering based on composite key "Municipality - UF"
            const recordKey = `${r.municipio} - ${r.estado}`;
            if (selectedMunicipalityKeys.length > 0 && !selectedMunicipalityKeys.includes(recordKey)) return false;

            return true;
        });
        // Sort: Date DESC, then Municipality ASC
        return filtered.sort((a, b) => {
            const dateDiff = new Date(b.data_final).getTime() - new Date(a.data_final).getTime();
            if (dateDiff !== 0) return dateDiff;
            return a.municipio.localeCompare(b.municipio);
        });
    }, [records, selectedRegion, selectedStates, selectedMunicipalityKeys]);

    // HELPER: Aggregates data for a specific set of records (single city or total)
    const getChartData = (sourceRecords: MunicipalityRecord[]) => {
        const grouped = new Map<string, { date: string, avg: number, count: number }>();

        sourceRecords.forEach(r => {
            if (!grouped.has(r.data_final)) {
                grouped.set(r.data_final, { date: r.data_final, avg: 0, count: 0 });
            }
            const entry = grouped.get(r.data_final)!;
            entry.avg += r.preco_medio_revenda;
            entry.count += 1;
        });

        return Array.from(grouped.values())
            .map(e => ({
                date: e.date,
                price: e.avg / e.count
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    // Main Chart Data (Aggregate of current view)
    const mainChartData = useMemo(() => getChartData(filteredRecords), [filteredRecords]);

    return (
        <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
                <div className="absolute bottom-[10%] left-[10%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col flex-1">
                <AppNavbar />

                {/* Main Content */}
                <main className="pt-6 pb-12 px-6 max-w-[1600px] mx-auto space-y-6 w-full">

                    {/* Header Section with Filters */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard de Licitações</h2>
                                <p className="text-sm text-slate-400">Acompanhamento de preço dos combustíveis.</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="flex h-2 w-2 rounded-full bg-cyan-500/50 animate-pulse" />
                                    Atualizado em {new Date().toLocaleTimeString()}
                                </div>
                                {dbLastUpdated && (
                                    <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                                        Dados até: <span className="text-cyan-400">{dbLastUpdated}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <GlassCard className="p-4">
                            <div className="flex flex-col gap-4">

                                {/* Top Filters: Product + Region + State */}
                                <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
                                    {/* Product Tabs */}
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 shrink-0 transition-colors duration-300 overflow-x-auto max-w-full">
                                        {PRODUCTS.map(prod => (
                                            <button
                                                key={prod}
                                                onClick={() => setSelectedProduct(prod)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${selectedProduct === prod
                                                    ? 'bg-white dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-cyan-500/20'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {prod.replace("OLEO DIESEL", "DIESEL").replace("GASOLINA", "GAS.").replace("COMUM", "").replace("ADITIVADA", "AD.")}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Region & State Selects */}
                                    <div className="flex flex-wrap gap-2">
                                        <select
                                            value={selectedRegion}
                                            onChange={(e) => { setSelectedRegion(e.target.value); setSelectedStates([]); setSelectedMunicipalityKeys([]); }}
                                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500/50"
                                        >
                                            <option value="TODAS">Região: Todas</option>
                                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>

                                        <StateMultiSelect
                                            options={statesOptions}
                                            value={selectedStates}
                                            onChange={(val) => { setSelectedStates(val); setSelectedMunicipalityKeys([]); }}
                                        />
                                    </div>
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
                                                setSelectedProduct("OLEO DIESEL S10");
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

                    {/* Dashboard Split View */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">

                        {/* Left: Data Table (2/3) */}
                        <GlassCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col h-full border-t-4 border-t-cyan-500">
                            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-cyan-500" />
                                    Histórico Detalhado (Semanas)
                                </h3>
                                <span className="text-xs text-slate-500 font-mono">
                                    {filteredRecords.length} Registros
                                </span>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 shadow-sm">
                                        <tr className="border-b border-slate-200 dark:border-white/10">
                                            <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Município / UF</th>
                                            <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data Ref.</th>
                                            <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Média</th>
                                            <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right text-emerald-600 dark:text-emerald-400">Mínimo</th>
                                            <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right text-rose-600 dark:text-rose-400">Máximo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                        {isLoading ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Carregando dados...</td></tr>
                                        ) : filteredRecords.length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum registro no período.</td></tr>
                                        ) : filteredRecords.map((row) => (
                                            <tr key={`${row.municipio}-${row.estado}-${row.data_final}`} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0 group">
                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                            {row.municipio}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">{row.estado}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                                                    {row.data_inicial ? (
                                                        <>
                                                            {format(new Date(row.data_inicial), 'dd/MM/yyyy')} <span className="text-slate-300 mx-1">à</span> {format(new Date(row.data_final), 'dd/MM/yyyy')}
                                                        </>
                                                    ) : (
                                                        format(new Date(row.data_final), 'dd/MM/yyyy')
                                                    )}
                                                </td>
                                                <td className="p-3 text-right font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                                                    R$ {row.preco_medio_revenda.toFixed(3)}
                                                </td>
                                                <td className="p-3 text-right font-mono text-emerald-600/80 dark:text-emerald-400/80 text-xs">
                                                    {row.preco_min_revenda?.toFixed(3) || '-'}
                                                </td>
                                                <td className="p-3 text-right font-mono text-rose-600/80 dark:text-rose-400/80 text-xs">
                                                    {row.preco_max_revenda?.toFixed(3) || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>

                        {/* Right: Trend Chart (1/3) */}
                        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-y-auto pr-1">
                            {/* If multiple cities selected, show one chart per city */}
                            {selectedMunicipalityKeys.length > 1 ? (
                                selectedMunicipalityKeys.map(key => {
                                    const cityData = getChartData(filteredRecords.filter(r => `${r.municipio} - ${r.estado}` === key));
                                    return (
                                        <GlassCard key={key} className="p-4 flex flex-col border-t-4 border-t-purple-500 overflow-hidden min-h-[250px]">
                                            <div className="mb-2">
                                                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider truncate" title={key}>{key}</h3>
                                                <p className="text-[10px] text-slate-500">Evolução da média</p>
                                            </div>
                                            <div className="flex-1 w-full min-h-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={cityData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                                        <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), 'dd/MM')} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={20} />
                                                        <YAxis domain={['auto', 'auto']} tickFormatter={(value) => value.toFixed(2)} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#94a3b8' }} labelFormatter={(val) => format(new Date(val), 'dd/MM/yyyy')} formatter={(value: number) => [`R$ ${value.toFixed(3)}`, 'Média']} />
                                                        <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#06b6d4', stroke: '#fff' }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </GlassCard>
                                    );
                                })
                            ) : (
                                /* Default Single Chart (Aggregate) */
                                <GlassCard className="flex-1 p-4 flex flex-col border-t-4 border-t-cyan-500 overflow-hidden">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Tendência de Preço</h3>
                                        <p className="text-xs text-slate-500">
                                            {selectedMunicipalityKeys.length === 1 ? selectedMunicipalityKeys[0] : "Evolução da média no período"}
                                        </p>
                                    </div>
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={mainChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                                <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), 'dd/MM')} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={30} />
                                                <YAxis domain={['auto', 'auto']} tickFormatter={(value) => value.toFixed(2)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#94a3b8' }} labelFormatter={(val) => format(new Date(val), 'dd/MM/yyyy')} formatter={(value: number) => [`R$ ${value.toFixed(3)}`, 'Média']} />
                                                <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#06b6d4', stroke: '#fff' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
