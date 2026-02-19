import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area,
} from "recharts";
import { FuelRecord, STATE_ABBREVIATIONS, STATE_COLORS, parseShortDate } from "@/data/sampleData";
import { useMemo } from "react";

interface ParityChartProps {
  data: FuelRecord[];
  estado: string;
}

export default function ParityChart({ data, estado }: ParityChartProps) {
  const abbr = STATE_ABBREVIATIONS[estado] || estado.slice(0, 2);
  const color = STATE_COLORS[estado] || "hsl(199, 89%, 48%)";

  const chartData = useMemo(() => {
    return data
      .filter(r => r.estado === estado)
      .sort((a, b) => parseShortDate(a.datas).getTime() - parseShortDate(b.datas).getTime())
      .map(r => {
        const d = parseShortDate(r.datas);
        return {
          label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
          paridade: r.paridade,
          etanol: r.etanol,
          gasolina: r.gasolina,
          difNom: r.difNom,
          favorable: r.paridade <= 70,
        };
      });
  }, [data, estado]);

  const minY = Math.min(...chartData.map(d => d.paridade), 70) - 3;
  const maxY = Math.max(...chartData.map(d => d.paridade), 70) + 3;

  return (
    <div className="h-full w-full p-2 animate-fade-in">
      <h3 className="mb-2 text-center text-xs font-bold uppercase tracking-wider">
        <span style={{ color }}>{abbr}</span>{" "}
        <span className="text-slate-500 font-normal">Paridade %</span>
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`grad-${abbr}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            domain={[minY, maxY]}
            tick={{ fill: "#94a3b8", fontSize: 9 }}
            tickFormatter={v => `${v}%`}
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
            cursor={{ stroke: "#64748b", strokeWidth: 1, strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              const d = payload[0]?.payload;
              if (!d) return null;
              return (
                <div className="rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl">
                  <p className="mb-1 text-xs font-bold text-slate-200">{label}</p>
                  <p className="text-xs text-slate-300">Paridade: <span style={{ color }}>{d.paridade.toFixed(2).replace(".", ",")}%</span></p>
                  <p className="text-xs text-slate-300">Etanol: <span className="text-blue-400">R$ {d.etanol.toFixed(2).replace(".", ",")}</span></p>
                  <p className="text-xs text-slate-300">Gasolina: <span className="text-yellow-500">R$ {d.gasolina.toFixed(2).replace(".", ",")}</span></p>
                  <p className="text-xs text-slate-500">Diferença: R$ {d.difNom.toFixed(2).replace(".", ",")}</p>
                </div>
              );
            }}
          />
          <ReferenceLine
            y={70}
            stroke="#ef4444"
            strokeDasharray="4 2"
            strokeWidth={1}
            label={{
              value: "70%",
              fill: "#ef4444",
              fontSize: 9,
              fontWeight: 700,
              position: "right",
            }}
          />
          <Area
            type="monotone"
            dataKey="paridade"
            stroke="none"
            fill={`url(#grad-${abbr})`}
          />
          <Line
            type="monotone"
            dataKey="paridade"
            stroke={color}
            strokeWidth={2}
            dot={({ cx, cy, payload }) => {
              const fav = payload.paridade <= 70;
              const fill = fav ? "#22c55e" : "#ef4444";
              return (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={2}
                  fill={fill}
                  stroke={fill}
                  strokeWidth={0}
                />
              );
            }}
            activeDot={{ r: 4, strokeWidth: 0, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
