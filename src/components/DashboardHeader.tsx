import { Fuel } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface DashboardHeaderProps {
  recordCount: number;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  dataDate: Date | null;
}

export default function DashboardHeader({ recordCount, isRefreshing, lastUpdated, dataDate }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
          <Fuel className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Visão Suprimentos — Combustíveis
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>{recordCount} registros</span>
            <span className="text-muted-foreground/50">·</span>
            <span>Etanol x Gasolina</span>
            {dataDate && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="font-semibold text-primary">
                  Dados de {dataDate.toLocaleDateString("pt-BR")}
                </span>
              </>
            )}
            {lastUpdated && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="text-muted-foreground/70">
                  Atualizado {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
