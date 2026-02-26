import { TrendingDown, TrendingUp, Droplets, Flame } from "lucide-react";
import { FuelRecord } from "@/types/fuel";
import { GlassCard } from "./ui/GlassCard";
import { useMemo } from "react";

interface StatsCardsProps {
  data: FuelRecord[];
}

export default function StatsCards({ data }: StatsCardsProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const avgEtanol = data.reduce((s, r) => s + r.etanol, 0) / data.length;
    const avgGasolina = data.reduce((s, r) => s + r.gasolina, 0) / data.length;
    const avgParidade = data.reduce((s, r) => s + r.paridade, 0) / data.length;
    const favCount = data.filter(r => r.paridade <= 70).length;
    const favPct = (favCount / data.length) * 100;
    return { avgEtanol, avgGasolina, avgParidade, favPct };
  }, [data]);

  if (!stats) return null;

  const cards = [
    {
      label: "Etanol Médio",
      value: `R$ ${stats.avgEtanol.toFixed(2).replace(".", ",")}`,
      icon: Droplets,
      accent: "text-primary",
    },
    {
      label: "Gasolina Média",
      value: `R$ ${stats.avgGasolina.toFixed(2).replace(".", ",")}`,
      icon: Flame,
      accent: "text-warning",
    },
    {
      label: "Paridade Média",
      value: `${stats.avgParidade.toFixed(1).replace(".", ",")}%`,
      icon: stats.avgParidade <= 70 ? TrendingDown : TrendingUp,
      accent: stats.avgParidade <= 70 ? "text-favorable" : "text-unfavorable",
    },
    {
      label: "Favorável ao Etanol",
      value: `${stats.favPct.toFixed(0)}%`,
      icon: TrendingDown,
      accent: "text-favorable",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(c => (
        <GlassCard key={c.label} className="flex items-center gap-3 p-4" hoverEffect>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ${c.accent} ring-1 ring-white/10 shadow-inner`}>
            <c.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{c.label}</p>
            <p className={`text-xl font-bold ${c.accent} drop-shadow-sm`}>{c.value}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
