import { useState } from "react";
import PlatformCard from "./PlataformCard";
import { platformThemes } from "../../utils/plataformThemes";
import type { PlatformTheme } from "../../utils/plataformThemes";
import { X, Copy, Check, Eye, EyeOff } from "lucide-react";

// Tipo para credenciais múltiplas (virá de API/config futuramente)
interface MultiCredential {
  id: string;
  label: string;
  login: string;
  password: string;
}

// Mock de credenciais múltiplas
const multipleCredentialsMap: Record<string, MultiCredential[]> = {
  "mzone-admin": [
    { id: "1", label: "Admin Master", login: "admin@mzone.com", password: "master123" },
    { id: "2", label: "Operador SP", login: "sp@mzone.com", password: "opsp456" },
    { id: "3", label: "Operador RJ", login: "rj@mzone.com", password: "oprj789" },
  ],
  "sistema-nota": [
    { id: "1", label: "Financeiro", login: "fin@notas.com", password: "fin2024" },
    { id: "2", label: "Comercial", login: "com@notas.com", password: "com2024" },
  ],
};

export default function PlatformCardGrid() {
  const [modalPlatform, setModalPlatform] = useState<PlatformTheme | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const handleMultipleCredentials = (platform: PlatformTheme) => {
    setModalPlatform(platform);
    setCopiedField(null);
    setVisiblePasswords(new Set());
  };

  const handleCloseModal = () => {
    setModalPlatform(null);
    setCopiedField(null);
    setVisiblePasswords(new Set());
  };

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      console.error("Falha ao copiar");
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const credentials = modalPlatform
    ? multipleCredentialsMap[modalPlatform.id] || []
    : [];

  return (
    <>
  

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platformThemes.map((theme, index) => (
          <div
            key={theme.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
          >
            <PlatformCard
              theme={theme}
              onMultipleCredentials={handleMultipleCredentials}
            />
          </div>
        ))}
      </div>

      {/* Modal de Credenciais Múltiplas */}
      {modalPlatform && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

          {/* Modal Content */}
          <div
            className="
              relative w-full max-w-lg
              rounded-2xl bg-white dark:bg-zinc-900
              border border-zinc-200 dark:border-zinc-800
              shadow-2xl
              animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-xl
                    bg-gradient-to-br ${modalPlatform.iconBg}
                  `}
                >
                  <modalPlatform.icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {modalPlatform.name}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {credentials.length} credenciais disponíveis
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="
                  flex h-8 w-8 items-center justify-center rounded-lg
                  text-zinc-400 transition-colors
                  hover:bg-zinc-100 dark:hover:bg-zinc-800
                  hover:text-zinc-600 dark:hover:text-zinc-200
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lista de Credenciais */}
            <div className="max-h-96 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="
                      rounded-xl border border-zinc-100 dark:border-zinc-800
                      bg-zinc-50 dark:bg-zinc-800/50
                      p-4 transition-colors duration-200
                      hover:bg-zinc-100 dark:hover:bg-zinc-800
                    "
                  >
                    {/* Label */}
                    <div className="mb-3 flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full bg-gradient-to-r ${modalPlatform.iconBg}`}
                      />
                      <span className={`text-sm font-semibold ${modalPlatform.accentText}`}>
                        {cred.label}
                      </span>
                    </div>

                    {/* Login */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Login
                        </span>
                        <span className="block truncate font-mono text-sm text-zinc-700 dark:text-zinc-200">
                          {cred.login}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(cred.login, `login-${cred.id}`)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-90 transition-all"
                      >
                        {copiedField === `login-${cred.id}` ? (
                          <Check className={`h-3.5 w-3.5 ${modalPlatform.accentText}`} />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Senha */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Senha
                        </span>
                        <span className="block truncate font-mono text-sm text-zinc-700 dark:text-zinc-200">
                          {visiblePasswords.has(cred.id) ? cred.password : "••••••••"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => togglePasswordVisibility(cred.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-90 transition-all"
                        >
                          {visiblePasswords.has(cred.id) ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(cred.password, `pass-${cred.id}`)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-90 transition-all"
                        >
                          {copiedField === `pass-${cred.id}` ? (
                            <Check className={`h-3.5 w-3.5 ${modalPlatform.accentText}`} />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}