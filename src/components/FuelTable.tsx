import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { FuelRecord } from "@/types/fuel";
import { parseShortDate } from "@/lib/fuel";
import SignalBadge from "./SignalBadge";

interface FuelTableProps {
  data: FuelRecord[];
  viewLevel?: "estado" | "municipio";
}

type SortKey = keyof FuelRecord | 'dates' | 'localidade';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export default function FuelTable({ data, viewLevel = "estado" }: FuelTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'headroom', direction: 'desc' });

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    const { key, direction } = sortConfig;
    let comparison = 0;

    if (key === 'dates') {
      const dateA = parseShortDate(a.datas).getTime();
      const dateB = parseShortDate(b.datas).getTime();
      comparison = dateA - dateB;
    } else if (key === 'localidade') {
      const valA = viewLevel === "municipio" ? (a.municipio || a.estado) : a.estado;
      const valB = viewLevel === "municipio" ? (b.municipio || b.estado) : b.estado;
      comparison = valA.localeCompare(valB);
    } else {
      // Numeric sort or string
      const valA: any = a[key as keyof FuelRecord] || 0;
      const valB: any = b[key as keyof FuelRecord] || 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else {
        comparison = (valA as number) - (valB as number);
      }
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1 text-primary" />
      : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  const HeaderCell = ({
    label,
    sortKey,
    align = "left",
    colorClass = "",
    tooltip
  }: {
    label: React.ReactNode,
    sortKey: SortKey,
    align?: "left" | "right" | "center",
    colorClass?: string,
    tooltip?: React.ReactNode
  }) => (
    <TableHead
      className={`font-mono text-xs uppercase text-muted-foreground bg-card cursor-pointer select-none group hover:bg-muted/50 transition-colors text-${align} ${colorClass}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
        {label}
        {tooltip}
        <SortIcon columnKey={sortKey} />
      </div>
    </TableHead>
  );

  return (
    <div className="flex flex-col h-full rounded-none border-none bg-transparent overflow-hidden">
      <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0 rounded-t-xl">
        <h3 className="font-mono text-sm font-bold uppercase text-blue-400 tracking-wider">
          PROFUNDIDADE DE MERCADO (TRADER)
        </h3>
        <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
          ORDEM: {sortConfig.key.toString().toUpperCase()} ({sortConfig.direction === 'asc' ? 'ASC' : 'DESC'})
        </span>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <TooltipProvider delayDuration={100}>
          <Table>
            <TableHeader className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-white/10">
              <TableRow className="hover:bg-transparent border-white/10">
                <HeaderCell label={viewLevel === "estado" ? "Estado" : "Município"} sortKey="localidade" />
                <HeaderCell label="Data" sortKey="dates" />
                <HeaderCell label="Etanol" sortKey="etanol" align="right" colorClass="text-cyan-400" />
                <HeaderCell label="Gasolina" sortKey="gasolina" align="right" colorClass="text-yellow-500" />

                <HeaderCell
                  label="Dif. Nom."
                  sortKey="difNom"
                  align="right"
                  tooltip={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Info className="h-3 w-3 text-muted-foreground/50 hover:text-primary transition-colors ml-1" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border-border text-xs font-mono max-w-[200px]">
                        <p className="font-bold text-primary mb-1">Diferença Nominal</p>
                        Preço Gasolina - Preço Etanol.
                        <br /><span className="text-muted-foreground opacity-70">Quanto economiza na bomba, sem considerar rendimento.</span>
                      </TooltipContent>
                    </Tooltip>
                  }
                />

                <HeaderCell label="Paridade" sortKey="paridade" align="right" />

                <HeaderCell
                  label="Headroom"
                  sortKey="headroom"
                  align="right"
                  tooltip={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Info className="h-3 w-3 text-muted-foreground/50 hover:text-primary transition-colors ml-1" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border-border text-xs font-mono max-w-[200px]">
                        <p className="font-bold text-primary mb-1">Headroom (Teto)</p>
                        (Gasolina x 0.70) - Etanol.
                        <br /><span className="text-muted-foreground opacity-70">Margem real de competitividade. Positivo = Etanol Barato.</span>
                      </TooltipContent>
                    </Tooltip>
                  }
                />

                <HeaderCell label="Sinal" sortKey="demand_signal" align="center" />
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-xs">
              {sortedData.map((record, i) => (
                <TableRow key={i} className="hover:bg-primary/5 border-border/50 transition-colors">
                  <TableCell className="font-bold text-foreground max-w-[150px] truncate">
                    {viewLevel === "estado" ? record.estado : record.municipio}
                    {viewLevel === "municipio" && <span className="text-[10px] text-slate-500 ml-1 block">{record.estado}</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{record.datas}</TableCell>
                  <TableCell className="text-right text-cyan-300 font-medium">
                    R$ {record.etanol.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-yellow-300 font-medium">
                    R$ {record.gasolina.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-muted-foreground">
                    R$ {record.difNom.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <span className={record.paridade < 70 ? "text-favorable" : "text-unfavorable"}>
                      {record.paridade.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <span className={(record.headroom || 0) > 0 ? "text-favorable" : "text-unfavorable"}>
                      R$ {(record.headroom || 0).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <SignalBadge signal={record.demand_signal} paridade={record.paridade} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  );
}
