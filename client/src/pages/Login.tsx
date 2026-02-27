import React, { useState, useEffect } from 'react';
import { BackgroundGradientAnimation } from '../components/ui/background-gradient-animation';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { InputWithIcon } from '@/components/InputWithIcon';
import { Mail, Lock, ArrowRight, CheckCircle2, XCircle, Loader2,ShieldUser} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from "@/context/Authcontext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import logo from '@/assets/logo.jpg';
import { message } from "antd";

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

//login button with states
const LoginButton = ({ state }: { state: ButtonState }) => {
  const config = {
    idle:    { label: 'Entrar',           icon: <ShieldUser   size={16} />, cls: 'btn--idle'    },
    loading: { label: 'Autenticando...',  icon: <Loader2      size={16} />, cls: 'btn--loading' },
    success: { label: 'Bem-vindo!',       icon: <CheckCircle2 size={16} />, cls: 'btn--success' },
    error:   { label: 'Tente novamente',  icon: <XCircle      size={16} />, cls: 'btn--error'   },
  }[state];

  return (
    <>
      <button
        type="submit"
        disabled={state === 'loading' || state === 'success'}
        className={`login-btn ${config.cls}`}
      >
        <span className="btn-glow" />
        <span className="btn-content">
          <span className={`btn-icon ${state === 'loading' ? 'spin' : ''}`}>
            {config.icon}
          </span>
          <span className="btn-label">{config.label}</span>
        </span>
      </button>

      <style>{`
        .login-btn {
          position: relative;
          width: 100%;
          padding: 13px 20px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #fff;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.35s ease;
          outline: none;
        }

        /* ── idle: primary blue from design system ── */
        .btn--idle {
          background: hsl(217, 95%, 50%);
          box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
        }
        .btn--idle:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37, 99, 235, 0.5);
          background: hsl(217, 95%, 54%);
        }
        .btn--idle:active { transform: translateY(0); }

        /* ── loading ── */
        .btn--loading {
          background: hsl(217, 95%, 46%);
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.2);
          cursor: not-allowed;
        }

        /* ── success: green ── */
        .btn--success {
          background: hsl(142, 72%, 40%);
          box-shadow: 0 6px 24px rgba(22, 163, 74, 0.45);
          cursor: default;
          animation: btn-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* ── error: red ── */
        .btn--error {
          background: hsl(0, 72%, 48%);
          box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
          animation: btn-shake 0.4s ease;
        }
        .btn--error:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(220, 38, 38, 0.5);
          background: hsl(0, 72%, 52%);
        }

        /* glow sweep on idle hover + loading pulse */
        .btn-glow {
          position: absolute; inset: 0;
          background: linear-gradient(
            105deg,
            transparent 35%,
            rgba(255,255,255,0.16) 50%,
            transparent 65%
          );
          background-size: 250% 100%;
          background-position: -250% 0;
        }
        .btn--idle:hover .btn-glow { animation: glow-sweep 1.6s ease infinite; }
        .btn--loading .btn-glow    { animation: glow-sweep 1.2s ease infinite; }

        @keyframes glow-sweep {
          0%   { background-position: -250% 0; }
          100% { background-position:  250% 0; }
        }

        .btn-content {
          position: relative;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-icon { display: flex; align-items: center; }

        /* arrow nudge on hover */
        .btn--idle:hover .btn-icon { animation: nudge 0.25s ease forwards; }
        @keyframes nudge {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(4px); }
          100% { transform: translateX(2px); }
        }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes btn-pop {
          0%  { transform: scale(0.97); }
          60% { transform: scale(1.03); }
          100%{ transform: scale(1); }
        }
        @keyframes btn-shake {
          0%,100%{ transform: translateX(0); }
          20%    { transform: translateX(-5px); }
          40%    { transform: translateX(5px); }
          60%    { transform: translateX(-3px); }
          80%    { transform: translateX(3px); }
        }
      `}</style>
    </>
  );
};

//background animation blobs
const DotGrid = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
      backgroundSize: '26px 26px',
      maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)',
    }}
  />
);

const LoginPage = () => {
  const { login }           = useAuth();
  const navigate            = useNavigate();
  const { theme, setTheme } = useTheme();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [btnState, setBtnState] = useState<ButtonState>('idle');
  const [mounted, setMounted]   = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    setTheme('light');
    const t = setTimeout(() => setMounted(true), 60);
    return () => { clearTimeout(t); setTheme(theme); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (btnState === 'loading' || btnState === 'success') return;
    setBtnState('loading');

    try {
      await login(email, password);
      setBtnState('success');
      messageApi.success('Login realizado com sucesso! ufa!');
      setTimeout(() => navigate('/services'), 1000);
    } catch (err: any) {
      setBtnState('error');
      const status = err?.response?.status;
      let msg = 'Ocorreu um erro inesperado.';
      if (status === 401)                     msg = 'Usuário ou senha inválidos.';
      else if (status === 500)                msg = 'Erro no servidor. Tente novamente.';
      else if (err?.response?.data?.message)  msg = err.response.data.message;
      messageApi.error(`Erro ao fazer login: ${msg}`);
      setTimeout(() => setBtnState('idle'), 2500);
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100%', overflow: 'hidden',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {contextHolder}

      <div style={{ width: '60%', position: 'relative', overflow: 'hidden' }}>
        <BackgroundGradientAnimation>
          <div style={{ margin: '2.5rem', marginTop: '5rem' }}>
            <LayoutTextFlip
              words={['Agendamentos', 'Serviços', 'Controle', 'Relatórios', 'Clientes', ]}
              text="Bem vindo ao seu sistema de"
            />
          </div>
        </BackgroundGradientAnimation>
      </div>

      <div style={{
        width: '40%',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        background: 'hsl(215, 30%, 8%)',
        overflow: 'hidden',
      }}>

        <DotGrid />

        <div style={{
          position: 'absolute', top: -100, right: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.16), transparent 70%)',
          filter: 'blur(55px)', pointerEvents: 'none',
          animation: 'orbDrift 11s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.1), transparent 70%)',
          filter: 'blur(45px)', pointerEvents: 'none',
          animation: 'orbDrift 15s ease-in-out infinite alternate-reverse',
        }} />

        <div style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 400,
          borderRadius: 20,
          background: 'hsl(215, 28%, 12%)',
          border: '1px solid hsl(215, 20%, 20%)',
          padding: '36px 32px 32px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.55)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.985)',
          transition: 'opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1)',
        }}>

          <div style={{
            position: 'absolute', inset: -1, borderRadius: 21,
            background: 'conic-gradient(from var(--sa, 0deg), transparent 72%, hsl(217,95%,60%) 84%, hsl(214,95%,75%) 91%, transparent 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: 1,
            animation: 'borderSpin 5s linear infinite',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{
              background: 'hsl(217, 95%, 50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 8px 24px rgba(37,99,235,0.45)',
              fontSize: 24, color: '#fff',
            }}>
              <img src={logo} alt="Logo" style={{width:180,height:100}} />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <h1 style={{
              fontSize: 21, fontWeight: 700,
              color: 'hsl(215, 10%, 95%)',
              letterSpacing: '-0.02em', margin: 0,
            }}>
              Acesse sua conta
            </h1>
            <p style={{ fontSize: 13, color: 'hsl(215, 10%, 50%)', marginTop: 6 }}>
              Informe suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label htmlFor="email" style={labelStyle}>E-mail</Label>
              <InputWithIcon
                id="email"
                placeholder="Digite seu e-mail"
                icon={<Mail className="h-4 w-4" style={{ color: 'hsl(215,10%,45%)' }} />}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label htmlFor="password" style={labelStyle}>Senha</Label>
              </div>
              <InputWithIcon
                id="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" style={{ color: 'hsl(215,10%,45%)' }} />}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>

            {/* Divider */}
            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, hsl(215,20%,22%), transparent)',
              margin: '4px 0',
            }} />

            <LoginButton state={btnState} />
          </form>

        </div>

        <style>{`
          @property --sa {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes borderSpin { to { --sa: 360deg; } }
          @keyframes orbDrift {
            0%   { transform: translate(0, 0); }
            100% { transform: translate(14px, 22px); }
          }

          .login-input {
            background: hsl(215, 28%, 9%) !important;
            border: 1px solid hsl(215, 20%, 21%) !important;
            border-radius: 10px !important;
            color: hsl(215, 10%, 92%) !important;
            font-size: 14px !important;
            transition: border-color 0.2s, box-shadow 0.2s !important;
          }
          .login-input:focus-within {
            border-color: hsl(217, 95%, 55%) !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
          }
          .login-input input::placeholder { color: hsl(215,10%,35%) !important; }
        `}</style>

      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'hsl(215, 10%, 52%)',
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
};

export default LoginPage;