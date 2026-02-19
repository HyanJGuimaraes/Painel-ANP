
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, className, hoverEffect = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "backdrop-blur-xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300",
                    hoverEffect && "hover:bg-white/80 dark:hover:bg-slate-900/60 hover:scale-[1.01] hover:shadow-2xl hover:border-blue-500/30",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = "GlassCard";
