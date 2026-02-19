
import { Fuel, LayoutDashboard, ScrollText } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function AppNavbar() {
    const location = useLocation();

    return (
        <header className="sticky top-0 z-50 w-full px-6 py-4 pointer-events-none">
            <div className="mx-auto max-w-7xl backdrop-blur-xl bg-white/70 dark:bg-[#0a0a0a]/60 border border-white/20 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-2xl flex items-center justify-between p-2 pointer-events-auto transition-all duration-300">

                {/* Brand */}
                <div className="flex items-center gap-3 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
                        <Fuel className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-wider text-slate-800 dark:text-white uppercase">
                            Painel ANP
                        </h1>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-widest">
                            Monitoramento de Preços
                        </p>
                    </div>
                </div>

                {/* Navigation Pucks */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5">
                    <NavLink
                        to="/suprimentos"
                        className={({ isActive }) => cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                                ? "bg-white dark:bg-white/10 text-blue-600 dark:text-cyan-400 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                        )}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Suprimentos</span>
                    </NavLink>

                    <NavLink
                        to="/licitacoes"
                        className={({ isActive }) => cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                                ? "bg-white dark:bg-white/10 text-blue-600 dark:text-cyan-400 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                        )}
                    >
                        <ScrollText className="h-4 w-4" />
                        <span>Licitações</span>
                    </NavLink>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 px-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
