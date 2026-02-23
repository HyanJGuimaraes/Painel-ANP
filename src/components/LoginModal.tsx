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
import { Droplet, UserCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const loginSchema = z.object({
    email: z.string().email("E-mail inválido").or(z.string().min(1, "Obrigatório")), // Allow 'Admin' logic since it's not a real email sometimes, or just stick to string if the user literal asks for "Admin"
    password: z.string().min(1, "A senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginModal() {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
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
                email: data.email, // using 'Admin' as email to match backend request
                password: data.password,
            });

            const { access_token, user } = response.data;

            // Store globally in context
            login(access_token, user);

            toast.success("Login realizado com sucesso!");
            setOpen(false);
            navigate("/admin"); // Push user to protected route

        } catch (error: any) {
            console.error("Login failed:", error);
            toast.error(
                error.response?.data?.detail || "Erro ao conectar com o servidor. Verifique suas credenciais."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-cyan-400 font-mono tracking-widest uppercase text-xs">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Login
                </Button>
            </DialogTrigger>

            {/* Black background overlay naturally handled by Dialog component but let's give the content dark theme */}
            <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 text-white shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)]">
                <DialogHeader className="flex flex-col items-center space-y-2 mt-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 mb-2">
                        <Droplet className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-2xl font-display font-bold tracking-tight text-white">
                        Painel<span className="text-cyan-400">ANP</span>
                    </DialogTitle>
                    <DialogDescription className="text-neutral-400 text-center">
                        Acesso Restrito - Dashboard Corporativo
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-neutral-300">Usuário</Label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="nome@riobranco.com.br ou Admin"
                                className="bg-white/[0.02] border-white/10 text-white focus-visible:ring-cyan-500"
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
                                className="bg-white/[0.02] border-white/10 text-white focus-visible:ring-cyan-500"
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
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? "Autenticando..." : "Entrar"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
