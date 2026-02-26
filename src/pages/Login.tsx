import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Droplet } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            setIsLoading(true);

            const response = await api.post("/api/auth/login", {
                email: data.email,
                password: data.password,
            });

            const { access_token, user } = response.data;

            // Store globally in context
            login(access_token, user);

            toast.success("Login realizado com sucesso!");
            navigate("/admin"); // Push user to protected route

        } catch (error: unknown) {
            console.error("Login failed:", error);
            const err = error as { response?: { data?: { detail?: string } } };
            toast.error(
                err.response?.data?.detail || "Erro ao conectar com o servidor. Verifique suas credenciais."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>

            <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-black/50 p-10 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 mb-2">
                        <Droplet className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-white">
                        Painel<span className="text-blue-500">ANP</span>
                    </h1>
                    <p className="text-sm text-neutral-400">
                        Acesso Restrito - Dashboard Corporativo
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-neutral-300">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@riobranco.com.br"
                                className="bg-neutral-900/50 border-neutral-800 text-white focus-visible:ring-blue-500"
                                {...register("email")}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-neutral-300">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-neutral-900/50 border-neutral-800 text-white focus-visible:ring-blue-500"
                                {...register("password")}
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? "Autenticando..." : "Entrar"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
