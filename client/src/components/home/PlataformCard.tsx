import { useState, useRef, useEffect } from "react";
import {
  ArrowUpRight, Lock, Unlock, Copy, Check,
  ChevronDown, Users, Eye, EyeOff,
} from "lucide-react";
import type { PlatformTheme } from "../../utils/plataformThemes";

interface PlatformCardProps {
  theme: PlatformTheme;
  onMultipleCredentials?: (platform: PlatformTheme) => void;
}

interface CredentialFieldProps {
  label: string;
  value: string;
  isCopied: boolean;
  onCopy: () => void;
  theme: PlatformTheme;
  children?: React.ReactNode;
}

function CredentialField({ label, value, isCopied, onCopy, theme, children }: CredentialFieldProps) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-all duration-200 ${theme.fieldBg}`}>
      <div className="min-w-0 flex-1">
        <span className={`block text-[10px] font-semibold uppercase tracking-widest ${theme.labelText}`}>
          {label}
        </span>
        <span className="mt-0.5 block truncate font-mono text-sm text-zinc-800 dark:text-zinc-200">
          {value}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        {children}
        <button
          onClick={onCopy}
          title={`Copiar ${label}`}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 ${theme.iconActionBg} active:scale-90`}
        >
          {isCopied
            ? <Check className={`h-3.5 w-3.5 ${theme.accentText}`} />
            : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
        </button>
      </div>
    </div>
  );
}

export default function PlatformCard({ theme, onMultipleCredentials }: PlatformCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const Icon = theme.icon;


  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setContentHeight(el.scrollHeight));
    observer.observe(el);
    setContentHeight(el.scrollHeight);
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    if (theme.hasMultipleCredentials) { onMultipleCredentials?.(theme); return; }
    setIsOpen(p => !p);
    setShowPassword(false);
    setCopiedField(null);
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { console.error("Falha ao copiar"); }
  };

  const handleOpen = () => {
    setIsLaunching(true);
    setTimeout(() => {
      window.open(theme.url, "_blank", "noopener,noreferrer");
      setIsLaunching(false);
    }, 400);
  };

  // Botão de credencial só aparece quando o tema tem credencial ou múltiplas credenciais
  const hasCredentialButton = theme.hasMultipleCredentials || !!theme.credential;

  return (
    <div className="group relative">
      <div className={`
        relative overflow-hidden rounded-xl border shadow-sm
        transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg
        ${theme.cardBg} ${theme.cardBorder}
      `}>

        {/* Barra lateral temática */}
        <div className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b ${theme.barColor}`} />

        {/* Glow sutil no canto superior */}
        <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${theme.gradient} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

        {/* Overlay no hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

        {/* Padrão de pontos sutil no canto */}
        <div
          className="absolute bottom-0 right-0 h-24 w-24 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "8px 8px",
          }}
        />

        <div className="relative px-5 py-4">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col justify-center pt-0.5">
           
              <h3 className="mt-0.5 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {theme.name}
              </h3>
            </div>

            <div className={`
              relative flex h-12 w-12 flex-shrink-0 items-center justify-center
              rounded-xl ${theme.iconPastelBg}
              ring-1 ${theme.iconPastelRing}
              transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm
            `}>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${theme.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-60`} />
              <Icon className={`relative h-7 w-7 ${theme.iconColor} transition-transform duration-300 group-hover:rotate-[-8deg]`} strokeWidth={1.8} />
            </div>
          </div>

          {/* Divisor */}
          <div className={`my-4 h-px bg-gradient-to-r from-transparent ${theme.dividerColor} to-transparent transition-opacity duration-300 group-hover:opacity-70`} />

          {/* Ações */}
          <div className="flex items-center gap-2">

            {/* Botão Acessar — ocupa largura total se não houver botão de credencial */}
            <button
              onClick={handleOpen}
              disabled={isLaunching}
              className={`
                group/btn relative inline-flex items-center justify-between overflow-hidden
                rounded-lg border px-4 py-2.5
                text-sm font-medium
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-offset-2
                dark:focus:ring-offset-zinc-900 focus:ring-offset-white
                disabled:cursor-wait
                ${hasCredentialButton ? "flex-1" : "w-full"}
                ${theme.accessBtnBg} ${theme.accessBtnBorder}
                ${theme.accessBtnText} ${theme.accessBtnHover}
                ${theme.ringColor}
              `}
            >
              {/* Shimmer sweep no hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />

              {/* Fill animado ao clicar */}
              <span className={`absolute inset-0 scale-x-0 origin-left bg-gradient-to-r ${theme.barColor} opacity-10 transition-transform duration-300 ${isLaunching ? "scale-x-100" : ""}`} />

              <span className="relative">Acessar {theme.name}</span>
              <span className="relative flex items-center">
                <ArrowUpRight className={`
                  h-4 w-4 transition-all duration-300
                  ${isLaunching
                    ? `translate-x-4 -translate-y-4 opacity-    0 ${theme.accentText}`
                    : `group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 ${theme.accentText}`
                  }
                `} />
                <ArrowUpRight className={`
                  absolute h-4 w-4 ${theme.accentText} transition-all duration-300
                  ${isLaunching ? "opacity-100" : "-translate-x-4 translate-y-4 opacity-0"}
                `} />
              </span>
            </button>

            {/* Botão credencial — condicional: só aparece se o tema tiver credenciais */}
            {hasCredentialButton && (
              <button
                onClick={handleToggle}
                title={theme.hasMultipleCredentials ? "Ver credenciais" : "Ver credencial"}
                className={`
                  flex items-center gap-1.5 rounded-lg border px-3 py-2.5
                  text-xs font-medium transition-all duration-200 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  dark:focus:ring-offset-zinc-900 focus:ring-offset-white
                  ${theme.credBtnBg} ${theme.credBtnBorder} ${theme.credBtnText}
                  ${theme.credBtnHover} ${theme.ringColor}
                  ${isOpen ? theme.credBtnActive : ""}
                `}
              >
                {theme.hasMultipleCredentials
                  ? <Users className="h-3.5 w-3.5" />
                  : isOpen
                    ? <Unlock className={`h-3.5 w-3.5 ${theme.accentText} transition-transform duration-200`} />
                    : <Lock className="h-3.5 w-3.5 transition-transform duration-200" />}
              </button>
            )}
          </div>
        </div>

        {/* Painel de credencial */}
        <div
          className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ maxHeight: isOpen ? `${contentHeight}px` : "0px", opacity: isOpen ? 1 : 0 }}
        >
          <div ref={contentRef}>
            <div className={`mx-5 h-px bg-gradient-to-r from-transparent ${theme.barColor} to-transparent opacity-20`} />
            <div className="space-y-2 px-5 pb-4 pt-3">
              <span className={`block text-[10px] font-semibold uppercase tracking-widest ${theme.labelText}`}>
                Credenciais de Acesso
              </span>
              {theme.credential && (
                <>
                  <CredentialField
                    label="Login"
                    value={theme.credential.login}
                    isCopied={copiedField === "login"}
                    onCopy={() => handleCopy(theme.credential!.login, "login")}
                    theme={theme}
                  />
                  <CredentialField
                    label="Senha"
                    value={showPassword ? theme.credential.password : "••••••••••••"}
                    isCopied={copiedField === "password"}
                    onCopy={() => handleCopy(theme.credential!.password, "password")}
                    theme={theme}
                  >
                    <button
                      onClick={() => setShowPassword(p => !p)}
                      title={showPassword ? "Ocultar" : "Mostrar"}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 ${theme.iconActionBg} active:scale-90`}
                    >
                      {showPassword
                        ? <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
                        : <Eye className="h-3.5 w-3.5 text-zinc-400" />}
                    </button>
                  </CredentialField>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}