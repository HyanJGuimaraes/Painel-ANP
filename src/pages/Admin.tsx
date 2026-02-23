import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Admin() {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6">
            <div className="max-w-md w-full p-8 border border-neutral-800 rounded-xl bg-neutral-900/50 backdrop-blur-md">
                <h1 className="text-2xl font-bold mb-4">Área Restrita (Admin)</h1>
                <p className="text-neutral-400 mb-6">
                    Bem-vindo, <span className="text-blue-400 font-semibold">{user?.email}</span>!
                    <br />
                    Seu nível de acesso é: <span className="uppercase text-green-400">{user?.role}</span>
                </p>

                <div className="space-y-4 mb-8">
                    <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                        <h3 className="text-sm font-semibold mb-2">Dados Sensíveis da Empresa:</h3>
                        <ul className="text-sm text-neutral-400 space-y-1">
                            <li>- Faturamento Mensal Média: R$ 4.5M</li>
                            <li>- Margem de Revenda (Oculta): 12%</li>
                            <li>- Projeções Q3 Bloqueadas.</li>
                        </ul>
                    </div>
                </div>

                <Button onClick={logout} variant="destructive" className="w-full">
                    Sair do Sistema
                </Button>
            </div>
        </div>
    );
}
