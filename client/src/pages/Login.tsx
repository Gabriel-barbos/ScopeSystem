import React, { useState } from 'react';
import { BackgroundGradientAnimation } from '../components/ui/background-gradient-animation';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { ShineBorder } from '@/components/ui/shine-border';
import { InputWithIcon } from '@/components/InputWithIcon';
import { Mail, Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { useAuth } from "@/context/Authcontext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useTheme } from "next-themes";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      navigate("/appointments");
    }
    catch (err: any) {
  const status = err?.response?.status;
  let message = "Ocorreu um erro inesperado.";

  if (status === 401) {
    message = "Usuário ou senha inválidos.";
  } else if (status === 500) {
    message = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
  } else if (err?.response?.data?.message) {
    message = err.response.data.message;
  }

  toast({
    variant: "destructive",
    title: "Erro ao fazer login",
    description: message,
  });
}finally {
    setIsLoading(false); 
  }
  }

  const { theme, setTheme } = useTheme();

useEffect(() => {
  // Remove dark mode ao entrar na página de login
  document.documentElement.classList.remove("dark");
  setTheme("light");

  // Quando sair do login, volta ao tema 
  return () => setTheme(theme);
}, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Lado esquerdo */}
      <div className="w-[60%] relative overflow-hidden">
        <BackgroundGradientAnimation>
          <div className='m-10 mt-20'>
            <LayoutTextFlip
              words={["Agendamentos", "Estoque", "Controle", "Envios"]}
              text="Bem vindo ao seu sistema de"
            />
          </div>
        </BackgroundGradientAnimation>
      </div>

      {/* Lado direito - Login Form */}
      <div className="w-[40%] bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="relative overflow-hidden rounded-2xl bg-white">
            <ShineBorder
              borderWidth={3}
              duration={2}
              shineColor={["#06b6d4", "#3b82f6", "#a855f7"]}
            />

            <div className="relative p-8">

              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className='text-2xl font-normal text-center'>Login</h2>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <InputWithIcon
                    id="email"
                    placeholder="exemplo@email.com"
                    icon={<Mail className="h-5 w-5" />}
                    type="email"
                    className='bg-white'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <InputWithIcon
                    id="password"
                    placeholder="Digite a senha"
                    icon={<Lock className="h-5 w-5" />}
                    type="password"
                    className='bg-white'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                </div>

                <RainbowButton
                  size="lg"
                  className="w-full text-base"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </RainbowButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
