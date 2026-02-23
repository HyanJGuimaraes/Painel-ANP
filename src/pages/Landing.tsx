import { useNavigate } from "react-router-dom";
import { Fuel, Gavel, TrendingUp, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import LoginModal from "@/components/LoginModal";

export default function Landing() {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState<"suprimentos" | "licitacoes" | null>(null);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-x-hidden font-sans selection:bg-primary/30 py-12">

            {/* Top Right Actions */}
            <div className="absolute top-6 right-6 z-50">
                <LoginModal />
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[80px]" />

                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}>
                </div>
            </div>

            <div className="z-10 text-center mb-12 animate-fade-in-down">
                <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-secondary/30 border border-white/10 backdrop-blur-md">
                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest px-3">Portal de Inteligência</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                    Painel ANP
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto font-light leading-relaxed">
                    Selecione o módulo de inteligência para acessar os dados estratégicos.
                </p>
            </div>

            <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-6">

                {/* Card Suprimentos */}
                <div
                    className={`group relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden
            ${hoveredCard === "suprimentos"
                            ? "bg-white/[0.03] border-cyan-500/50 shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] scale-[1.02]"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        }`}
                    onMouseEnter={() => setHoveredCard("suprimentos")}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => navigate("/suprimentos")}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className={`p-4 rounded-2xl transition-colors duration-500 ${hoveredCard === "suprimentos" ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-muted-foreground"}`}>
                            <TrendingUp className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-cyan-400 transition-colors">Visão Suprimentos</h2>
                            <p className="text-sm text-muted-foreground group-hover:text-gray-300 transition-colors leading-relaxed">
                                Monitoramento de preços ANP, paridade Etanol/Gasolina, oportunidades de arbitragem e indicadores de mercado.
                            </p>
                        </div>

                        <div className="pt-4 w-full">
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-cyan-500/50 transition-all duration-500" />
                            <div className="mt-4 flex justify-between items-center text-xs font-mono text-muted-foreground">
                                <span className="group-hover:text-cyan-300 transition-colors">DADOS: ONLINE</span>
                                <span className="group-hover:text-cyan-400">ACESSAR &rarr;</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Licitações */}
                <div
                    className={`group relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden
            ${hoveredCard === "licitacoes"
                            ? "bg-white/[0.03] border-purple-500/50 shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)] scale-[1.02]"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        }`}
                    onMouseEnter={() => setHoveredCard("licitacoes")}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => navigate("/licitacoes")}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className={`p-4 rounded-2xl transition-colors duration-500 ${hoveredCard === "licitacoes" ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-muted-foreground"}`}>
                            <Gavel className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-400 transition-colors">Visão Licitações</h2>
                            <p className="text-sm text-muted-foreground group-hover:text-gray-300 transition-colors leading-relaxed">
                                Gestão de editais, comparação de preços de referência, histórico de vencedores e análise de competitividade.
                            </p>
                        </div>

                        <div className="pt-4 w-full">
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-purple-500/50 transition-all duration-500" />
                            <div className="mt-4 flex justify-between items-center text-xs font-mono text-muted-foreground">
                                <span className="group-hover:text-purple-300 transition-colors">DADOS: ONLINE</span>
                                <span className="group-hover:text-purple-400">ACESSAR &rarr;</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <footer className="mt-16 text-center z-10 flex flex-col gap-2 relative">
                <p className="text-[10px] text-muted-foreground/60 font-mono tracking-widest uppercase hover:text-white/80 transition-colors cursor-default">
                    Rio Branco Petróleo · Intelligence Division
                </p>
                <p className="text-[10px] text-cyan-500/40 font-mono tracking-widest uppercase hover:text-cyan-400 transition-colors cursor-default">
                    Developed by Hyan
                </p>
            </footer>

        </div>
    );
}
