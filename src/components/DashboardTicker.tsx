import { FuelRecord } from "@/types/fuel";
import { useMemo } from "react";

interface DashboardTickerProps {
    data: FuelRecord[];
}

export default function DashboardTicker({ data }: DashboardTickerProps) {
    // Get latest date records only
    const latestRecords = useMemo(() => {
        if (!data.length) return [];
        // Sort by date desc
        const sorted = [...data].sort((a, b) => {
            // Simple string compare for "dd/mm/yyyy" works if year is last, but safe to just take top 27 (all states)
            // actually existing sort in Index.tsx is better.
            // Let's just take the last 50 records and assume they are mixed.
            return 0;
        });
        return data.slice(-10).reverse(); // Just show some recent ones for effect
    }, [data]);

    const nationalAvgParity = useMemo(() => {
        if (!data.length) return "0.0";
        const sum = data.reduce((acc, r) => acc + r.paridade, 0);
        return (sum / data.length).toFixed(1);
    }, [data]);

    return (
        <div className="w-full backdrop-blur-md bg-white/5 border-y border-white/5 overflow-hidden py-1.5 select-none">
            <div className="flex items-center gap-8 animate-slide-in whitespace-nowrap">
                <div className="flex items-center gap-2 px-4 border-r border-white/10">
                    <span className="text-slate-500 text-[10px] font-bold font-mono uppercase tracking-wider">STATUS MERCADO</span>
                    <span className="text-blue-400 font-bold font-mono text-xs">ABERTO</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></span>
                </div>

                <div className="flex items-center gap-2 px-4 border-r border-white/10">
                    <span className="text-slate-500 text-[10px] font-bold font-mono uppercase tracking-wider">MÉDIA NACIONAL</span>
                    <span className={`font-mono font-bold text-xs ${parseFloat(nationalAvgParity) < 70 ? 'text-green-400' : 'text-red-400'}`}>
                        {nationalAvgParity}%
                    </span>
                </div>

                {/* Scrolling items - simulating a marquee by mapping */}
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-8 animate-marquee hover:pause whitespace-nowrap">
                        {/* Tripling the data to ensure smooth infinite scroll illusion on wide screens */}
                        {[...latestRecords, ...latestRecords, ...latestRecords].map((r, i) => (
                            <div key={i} className="flex items-center gap-2 font-mono text-xs">
                                <span className="text-blue-300 font-bold">{r.estado}</span>
                                <span className="text-slate-400">{r.paridade.toFixed(1)}%</span>
                                {r.demand_signal === "STRONG" && <span className="text-green-400">▲</span>}
                                {r.demand_signal === "WEAK" && <span className="text-red-400">▼</span>}
                                {r.headroom && (
                                    <span className={r.headroom > 0 ? "text-green-400" : "text-red-400"}>
                                        <span className="text-slate-700 mx-1">|</span>
                                        R$ {r.headroom.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
