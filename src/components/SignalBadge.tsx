import { Badge } from "@/components/ui/badge";

interface SignalBadgeProps {
    signal?: string;
    paridade?: number;
}

export default function SignalBadge({ signal, paridade }: SignalBadgeProps) {
    if (!signal) return <span className="text-muted-foreground">-</span>;

    let colorClass = "bg-muted text-muted-foreground";
    let label = signal;

    if (signal === "STRONG") {
        colorClass = "bg-favorable/20 text-favorable border-favorable/50";
        label = "COMPRA (FORTE)";
    } else if (signal === "WEAK") {
        colorClass = "bg-unfavorable/20 text-unfavorable border-unfavorable/50";
        label = "VENDA (FRACA)";
    } else {
        colorClass = "bg-warning/20 text-warning border-warning/50";
        label = "MANTER (NEUTRO)";
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <Badge variant="outline" className={`font-mono text-xs font-bold ${colorClass}`}>
                {label}
            </Badge>
            {paridade && (
                <span className="text-[10px] text-muted-foreground font-mono">
                    {paridade.toFixed(1)}%
                </span>
            )}
        </div>
    );
}
