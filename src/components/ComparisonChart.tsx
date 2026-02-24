import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { FuelRecord, STATE_ABBREVIATIONS, parseShortDate } from "@/data/sampleData";
import { useMemo } from "react";

type Mode = "mom" | "yoy";

interface ComparisonChartProps {
  data: FuelRecord[];
  filteredData?: FuelRecord[];
  estado?: string;
  municipio?: string;
  mode: Mode;
}

export default function ComparisonChart({ data, filteredData, estado, municipio, mode }: ComparisonChartProps) {
  const isCity = !!municipio;
  const labelText = isCity ? municipio : estado;
  const abbr = isCity ? municipio?.slice(0, 15) : (estado ? (STATE_ABBREVIATIONS[estado] || estado.slice(0, 2)) : "");

  const chartData = useMemo(() => {
    // Full history for the key (needed for lookups)
    const stateFullData = data
      .filter(r => isCity ? r.municipio === municipio : r.estado === estado)
      .sort((a, b) => parseShortDate(a.datas).getTime() - parseShortDate(b.datas).getTime());

    // Target weeks to display
    const targetWeeks = filteredData
      ? filteredData.filter(r => isCity ? r.municipio === municipio : r.estado === estado).map(r => r.datas)
      : stateFullData.map(r => r.datas);

    const targetSet = new Set(targetWeeks);

    if (stateFullData.length < 2) return [];

    const results: { label: string; variation: number; current: number; previous: number; datas: string }[] = [];

    // Helper to find closest record X days ago
    const findPrevious = (current: FuelRecord, daysAgo: number) => {
      const currentDate = parseShortDate(current.datas);
      const targetDate = new Date(currentDate);
      targetDate.setDate(targetDate.getDate() - daysAgo);

      let closest: FuelRecord | null = null;
      let closestDiff = Infinity;

      // Optimization: Search backwards from current index? 
      // For small dataset (600 rows), simple iteration is fine.
      for (const prev of stateFullData) {
        const prevDate = parseShortDate(prev.datas);
        const diff = Math.abs(prevDate.getTime() - targetDate.getTime());
        // Allow match if within 1 week of target date
        if (diff < closestDiff && diff < 7 * 24 * 60 * 60 * 1000) {
          closest = prev;
          closestDiff = diff;
        }
      }
      return closest;
    };

    if (mode === "mom") {
      // Month-over-Month (Rolling): Compare vs ~30 days ago (4 weeks)
      for (const r of stateFullData) {
        const prev = findPrevious(r, 30);
        if (prev) {
          const variation = r.paridade - prev.paridade;
          const d = parseShortDate(r.datas);
          results.push({
            label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
            variation: parseFloat(variation.toFixed(2)),
            current: r.paridade,
            previous: prev.paridade,
            datas: r.datas
          });
        }
      }
    } else {
      // YoY: Compare vs ~365 days ago (52 weeks)
      for (const r of stateFullData) {
        const prev = findPrevious(r, 364);
        if (prev) {
          const variation = r.paridade - prev.paridade;
          const d = parseShortDate(r.datas);
          results.push({
            label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
            variation: parseFloat(variation.toFixed(2)),
            current: r.paridade,
            previous: prev.paridade,
            datas: r.datas
          });
        }
      }
    }

    // Filter results to only show what the user selected in the main filter
    return results.filter(r => targetSet.has(r.datas));

  }, [data, filteredData, estado, municipio, isCity, mode]);

  if (chartData.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center p-4 animate-fade-in" style={{ minHeight: 280 }}>
        <p className="text-sm text-muted-foreground">
          {mode === "yoy"
            ? `${abbr} — Sem dados suficientes para comparação anual`
            : `${abbr} — Sem dados suficientes`}
        </p>
      </div>
    );
  }

  const maxAbs = Math.max(...chartData.map(d => Math.abs(d.variation)), 1);
  const domain = [-Math.ceil(maxAbs + 1), Math.ceil(maxAbs + 1)];

  return (
    <div className="h-full w-full p-2 animate-fade-in">
      <h3 className="mb-2 text-center text-xs font-bold uppercase tracking-wider">
        <span className={isCity ? "text-purple-400" : "text-blue-400"}>{labelText}</span>{" "}
        <span className="text-slate-500 font-normal">
          {mode === "mom" ? "Variação Semanal (pp)" : "Variação Anual (pp)"}
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            domain={domain}
            tick={{ fill: "#94a3b8", fontSize: 9 }}
            tickFormatter={v => `${v > 0 ? "+" : ""}${v}`}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "0.5rem",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)",
            }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            formatter={(value: number, _name: string, props: any) => {
              const { current, previous } = props.payload;
              return [
                <span key="val" className="font-mono font-bold text-slate-200">
                  {value > 0 ? "+" : ""}{value.toFixed(2).replace(".", ",")} pp
                  <span className="ml-1 text-[10px] text-slate-500 font-normal">
                    ({current.toFixed(1)}% ← {previous.toFixed(1)}%)
                  </span>
                </span>,
                <span key="label" className="text-slate-500 text-xs uppercase">Variação</span>
              ];
            }}
          />
          <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
          <Bar dataKey="variation" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.variation <= 0 ? "#22c55e" : "#ef4444"}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
