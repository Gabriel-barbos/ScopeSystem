// src/config/platformThemes.ts
import {
  Car, Server, ShieldCheck, ScanLine, FileText, SearchCode , LucideIcon, MapPinned, ShieldUser 
} from "lucide-react";

export interface PlatformTheme {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
  // Layout
  gradient: string;
  barColor: string;
  dividerColor: string;
  cardBg: string;
  cardBorder: string;

  // Ícone — fundo pastel + cor forte
  iconPastelBg: string;   // fundo suave pastel
  iconPastelRing: string; // ring translúcido
  iconColor: string;      // cor do SVG (forte, da paleta)

  // Botão "Acessar" — outline temático
  accessBtnBg: string;
  accessBtnBorder: string;
  accessBtnText: string;
  accessBtnHover: string;

  // Botão Credencial
  credBtnBg: string;
  credBtnBorder: string;
  credBtnText: string;
  credBtnHover: string;
  credBtnActive: string;
  ringColor: string;

  // Campos
  fieldBg: string;
  iconActionBg: string;
  labelText: string;
  accentText: string;

  credential?: { login: string; password: string } | null;
  hasMultipleCredentials?: boolean;
}

export const platformThemes: PlatformTheme[] = [
  // ─── Quantigo — Âmbar ──────────────────────────────────────────────────
  {
    id: "quantigo",
    name: "Quantigo",
    description: "Plataforma de gestão e rastreamento veicular",
    url: "https://quantigo.example.com",
    icon: Car,

    gradient: "from-amber-500/5 via-yellow-400/5 to-transparent",
    barColor: "from-amber-400 via-yellow-500 to-orange-400",
    dividerColor: "via-amber-200/60 dark:via-amber-700/30",
    cardBg: "bg-white dark:bg-zinc-900",
    cardBorder: "border-zinc-200 dark:border-zinc-800 hover:border-amber-300/60 dark:hover:border-amber-700/40",

    iconPastelBg: "bg-amber-100 dark:bg-amber-500/15",
    iconPastelRing: "ring-amber-200/80 dark:ring-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",

    accessBtnBg: "bg-transparent",
    accessBtnBorder: "border-zinc-200 dark:border-zinc-700",
    accessBtnText: "text-zinc-700 dark:text-zinc-200",
    accessBtnHover: "hover:border-amber-400/60 hover:bg-amber-50 dark:hover:border-amber-600/40 dark:hover:bg-amber-950/30",

    credBtnBg: "bg-transparent",
    credBtnBorder: "border-zinc-200 dark:border-zinc-700",
    credBtnText: "text-zinc-500 dark:text-zinc-400",
    credBtnHover: "hover:bg-zinc-50 dark:hover:bg-zinc-800",
    credBtnActive: "ring-2 ring-amber-400/30 border-amber-300 dark:border-amber-700",
    ringColor: "ring-amber-400/30",

    fieldBg: "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
    iconActionBg: "hover:bg-zinc-200 dark:hover:bg-zinc-700",
    labelText: "text-amber-600 dark:text-amber-500",
    accentText: "text-amber-600 dark:text-amber-400",

    credential: { login: "admin@quantigo.com", password: "senha123" },
  },

  // ─── Mzone — Azul ──────────────────────────────────────────────────────
  {
    id: "mzone",
    name: "Mzone",
    description: "Sistema de monitoramento e controle de frotas",
    url: "https://live.mzoneweb.net/mzonex/",
    icon: MapPinned,
    hasMultipleCredentials: true,

    gradient: "from-blue-500/5 via-indigo-400/5 to-transparent",
    barColor: "from-blue-400 via-blue-500 to-indigo-600",
    dividerColor: "via-blue-200/60 dark:via-blue-700/30",
    cardBg: "bg-white dark:bg-zinc-900",
    cardBorder: "border-zinc-200 dark:border-zinc-800 hover:border-blue-300/60 dark:hover:border-blue-700/40",

    iconPastelBg: "bg-blue-100 dark:bg-blue-500/15",
    iconPastelRing: "ring-blue-200/80 dark:ring-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",

    accessBtnBg: "bg-transparent",
    accessBtnBorder: "border-zinc-200 dark:border-zinc-700",
    accessBtnText: "text-zinc-700 dark:text-zinc-200",
    accessBtnHover: "hover:border-blue-400/60 hover:bg-blue-50 dark:hover:border-blue-600/40 dark:hover:bg-blue-950/30",

    credBtnBg: "bg-transparent",
    credBtnBorder: "border-zinc-200 dark:border-zinc-700",
    credBtnText: "text-zinc-500 dark:text-zinc-400",
    credBtnHover: "hover:bg-zinc-50 dark:hover:bg-zinc-800",
    credBtnActive: "ring-2 ring-blue-400/30 border-blue-300 dark:border-blue-700",
    ringColor: "ring-blue-400/30",

    fieldBg: "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
    iconActionBg: "hover:bg-zinc-200 dark:hover:bg-zinc-700",
    labelText: "text-blue-600 dark:text-blue-500",
    accentText: "text-blue-600 dark:text-blue-400",

    credential: { login: "operador@mzone.com", password: "senha123" },
  },

  // ─── MProfiler — Esmeralda ──────────────────────────────────────────────
  {
    id: "mprofiler",
    name: "MProfiler",
    description: "Gerenciamento de servidores e infraestrutura",
    url: "https://live.scopemp.net/Scope.MProfilerIa.WPI/viewNoticeBoard.aspx",
    icon: Server,

    gradient: "from-emerald-500/5 via-teal-400/5 to-transparent",
    barColor: "from-emerald-400 via-emerald-500 to-teal-500",
    dividerColor: "via-emerald-200/60 dark:via-emerald-700/30",
    cardBg: "bg-white dark:bg-zinc-900",
    cardBorder: "border-zinc-200 dark:border-zinc-800 hover:border-emerald-300/60 dark:hover:border-emerald-700/40",

    iconPastelBg: "bg-emerald-100 dark:bg-emerald-500/15",
    iconPastelRing: "ring-emerald-200/80 dark:ring-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",

    accessBtnBg: "bg-transparent",
    accessBtnBorder: "border-zinc-200 dark:border-zinc-700",
    accessBtnText: "text-zinc-700 dark:text-zinc-200",
    accessBtnHover: "hover:border-emerald-400/60 hover:bg-emerald-50 dark:hover:border-emerald-600/40 dark:hover:bg-emerald-950/30",

    credBtnBg: "bg-transparent",
    credBtnBorder: "border-zinc-200 dark:border-zinc-700",
    credBtnText: "text-zinc-500 dark:text-zinc-400",
    credBtnHover: "hover:bg-zinc-50 dark:hover:bg-zinc-800",
    credBtnActive: "ring-2 ring-emerald-400/30 border-emerald-300 dark:border-emerald-700",
    ringColor: "ring-emerald-400/30",

    fieldBg: "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
    iconActionBg: "hover:bg-zinc-200 dark:hover:bg-zinc-700",
    labelText: "text-emerald-600 dark:text-emerald-500",
    accentText: "text-emerald-600 dark:text-emerald-400",

    credential: { login: "supportBr@scopetechnology.com", password: "Gttvgv.26" },
  },

  // ─── Mzone Admin — Laranja ──────────────────────────────────────────────
  {
    id: "mzone-admin",
    name: "Mzone Admin",
    description: "Painel administrativo do sistema Mzone",
    url: "http://live.mzoneweb.net/admin/#/login",
    icon: ShieldUser,

    gradient: "from-orange-500/5 via-red-400/5 to-transparent",
    barColor: "from-orange-400 via-orange-500 to-red-500",
    dividerColor: "via-orange-200/60 dark:via-orange-700/30",
    cardBg: "bg-white dark:bg-zinc-900",
    cardBorder: "border-zinc-200 dark:border-zinc-800 hover:border-orange-300/60 dark:hover:border-orange-700/40",

    iconPastelBg: "bg-orange-100 dark:bg-orange-500/15",
    iconPastelRing: "ring-orange-200/80 dark:ring-orange-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",

    accessBtnBg: "bg-transparent",
    accessBtnBorder: "border-zinc-200 dark:border-zinc-700",
    accessBtnText: "text-zinc-700 dark:text-zinc-200",
    accessBtnHover: "hover:border-orange-400/60 hover:bg-orange-50 dark:hover:border-orange-600/40 dark:hover:bg-orange-950/30",

    credBtnBg: "bg-transparent",
    credBtnBorder: "border-zinc-200 dark:border-zinc-700",
    credBtnText: "text-zinc-500 dark:text-zinc-400",
    credBtnHover: "hover:bg-zinc-50 dark:hover:bg-zinc-800",
    credBtnActive: "ring-2 ring-orange-400/30 border-orange-300 dark:border-orange-700",
    ringColor: "ring-orange-400/30",

    fieldBg: "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/20",
    iconActionBg: "hover:bg-zinc-200 dark:hover:bg-zinc-700",
    labelText: "text-orange-600 dark:text-orange-500",
    accentText: "text-orange-600 dark:text-orange-400",

    credential: { login: "brazil-support@scopetechnology.com", password: "Scope@br2021" },
  },

  // ─── Identi. IButton — Roxo ─────────────────────────────────────────────
  {
    id: "identibutton",
    name: "Conversor IButton",
    description: "Sistema de identificação e escaneamento",
    
    url: "https://i-button-conversor.vercel.app/",
    icon: SearchCode,

    gradient: "from-purple-500/5 via-fuchsia-400/5 to-transparent",
    barColor: "from-purple-400 via-violet-500 to-fuchsia-500",
    dividerColor: "via-purple-200/60 dark:via-purple-700/30",
    cardBg: "bg-white dark:bg-zinc-900",
    cardBorder: "border-zinc-200 dark:border-zinc-800 hover:border-purple-300/60 dark:hover:border-purple-700/40",

    iconPastelBg: "bg-purple-100 dark:bg-purple-500/15",
    iconPastelRing: "ring-purple-200/80 dark:ring-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",

    accessBtnBg: "bg-transparent",
    accessBtnBorder: "border-zinc-200 dark:border-zinc-700",
    accessBtnText: "text-zinc-700 dark:text-zinc-200",
    accessBtnHover: "hover:border-purple-400/60 hover:bg-purple-50 dark:hover:border-purple-600/40 dark:hover:bg-purple-950/30",

    credBtnBg: "bg-transparent",
    credBtnBorder: "border-zinc-200 dark:border-zinc-700",
    credBtnText: "text-zinc-500 dark:text-zinc-400",
    credBtnHover: "hover:bg-zinc-50 dark:hover:bg-zinc-800",
    credBtnActive: "ring-2 ring-purple-400/30 border-purple-300 dark:border-purple-700",
    ringColor: "ring-purple-400/30",

    fieldBg: "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
    iconActionBg: "hover:bg-zinc-200 dark:hover:bg-zinc-700",
    labelText: "text-purple-600 dark:text-purple-500",
    accentText: "text-purple-600 dark:text-purple-400",

      },

  // ─── Sistema de Nota — Rosa ─────────────────────────────────────────────
  {
    id: "sistema-nota",
    name: "Sistema de Nota",
    description: "Emissão e gerenciamento de notas fiscais",
    url: "https://nf-client-self.vercel.app/",
    icon: FileText,

    gradient: "from-rose-500/5 via-pink-400/5 to-transparent",
    barColor: "from-rose-400 via-rose-500 to-pink-500",
    dividerColor: "via-rose-200/60 dark:via-rose-700/30",
    cardBg: "bg-white dark:bg-zinc-900",
    cardBorder: "border-zinc-200 dark:border-zinc-800 hover:border-rose-300/60 dark:hover:border-rose-700/40",

    iconPastelBg: "bg-rose-100 dark:bg-rose-500/15",
    iconPastelRing: "ring-rose-200/80 dark:ring-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",

    accessBtnBg: "bg-transparent",
    accessBtnBorder: "border-zinc-200 dark:border-zinc-700",
    accessBtnText: "text-zinc-700 dark:text-zinc-200",
    accessBtnHover: "hover:border-rose-400/60 hover:bg-rose-50 dark:hover:border-rose-600/40 dark:hover:bg-rose-950/30",

    credBtnBg: "bg-transparent",
    credBtnBorder: "border-zinc-200 dark:border-zinc-700",
    credBtnText: "text-zinc-500 dark:text-zinc-400",
    credBtnHover: "hover:bg-zinc-50 dark:hover:bg-zinc-800",
    credBtnActive: "ring-2 ring-rose-400/30 border-rose-300 dark:border-rose-700",
    ringColor: "ring-rose-400/30",

    fieldBg: "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:bg-rose-50/50 dark:hover:bg-rose-950/20",
    iconActionBg: "hover:bg-zinc-200 dark:hover:bg-zinc-700",
    labelText: "text-rose-600 dark:text-rose-500",
    accentText: "text-rose-600 dark:text-rose-400",

    credential: null,
  },
];