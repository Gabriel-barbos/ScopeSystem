import { useId } from "react";
import { cn } from "@/lib/utils";

interface ScopeLogoProps {
  isCollapsed: boolean;
  className?: string;
}

export function ScopeLogo({ isCollapsed, className }: ScopeLogoProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center group/logo select-none",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-0">
        {/* ── Linha principal: SC + Orb + PE ── */}
        <div className="flex items-center">
          {/* SC */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-in-out",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-[4rem] opacity-100"
            )}
          >
            <span className="text-[1.55rem] font-extrabold tracking-[0.1em] text-sidebar-foreground whitespace-nowrap pr-[1px]">
              SC
            </span>
          </div>

          {/* Orb (o "O" do logo) */}
          <ScopeOrb
            size={isCollapsed ? 42 : 30}
            isCollapsed={isCollapsed}
          />

          {/* PE */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-in-out",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-[4rem] opacity-100"
            )}
          >
            <span className="text-[1.55rem] font-extrabold tracking-[0.1em] text-sidebar-foreground whitespace-nowrap pl-[1px]">
              PE
            </span>
          </div>
        </div>

        {/* ── Subtítulo TECHNOLOGY ── */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            isCollapsed
              ? "max-h-0 opacity-0 mt-0"
              : "max-h-8 opacity-100 mt-[2px]"
          )}
        >
          <span className="text-[0.5rem] font-semibold tracking-[0.42em] text-sidebar-foreground/40">
            TECHNOLOGY
          </span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────
   Orb colorido — o coração visual do logo
   ──────────────────────────────────────────────────── */

interface ScopeOrbProps {
  size: number;
  isCollapsed: boolean;
}

function ScopeOrb({ size, isCollapsed }: ScopeOrbProps) {
  // IDs únicos para SVG defs (SSR-safe)
  const raw = useId();
  const uid = raw.replace(/:/g, "");

  return (
    <div
      className="relative flex-shrink-0 transition-all duration-500 ease-in-out"
      style={{ width: size, height: size }}
    >
      {/* ── Glow ambiente (pulsa quando colapsado) ── */}
      <div
        className={cn(
          "absolute inset-[-30%] rounded-full blur-xl transition-all duration-700 pointer-events-none",
          isCollapsed
            ? "opacity-40 group-hover/logo:opacity-70 animate-[pulse_4s_ease-in-out_infinite]"
            : "opacity-0 group-hover/logo:opacity-50"
        )}
        style={{
          background:
            "conic-gradient(from 0deg, #E6394666, #2EC4B666, #4361EE66, #9B5DE566, #E6394666)",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="relative z-10 transition-all duration-500"
        aria-hidden="true"
      >
        <defs>
          {/* Recorte circular */}
          <clipPath id={`clip-${uid}`}>
            <circle cx="50" cy="50" r="43" />
          </clipPath>

          {/* Brilho suave nas pétalas */}
          <filter id={`glow-${uid}`}>
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Highlight central */}
          <radialGradient id={`center-${uid}`} cx="50%" cy="42%" r="38%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          {/* Gradiente do anel externo */}
          <linearGradient
            id={`ring-${uid}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#E63946" />
            <stop offset="25%" stopColor="#2EC4B6" />
            <stop offset="50%" stopColor="#4361EE" />
            <stop offset="75%" stopColor="#9B5DE5" />
            <stop offset="100%" stopColor="#E63946" />
          </linearGradient>
        </defs>

        {/* ── Anel externo rotativo ── */}
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke={`url(#ring-${uid})`}
          strokeWidth="1.2"
          opacity="0.5"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>

        {/* ── Corpo do orb ── */}
        <g clipPath={`url(#clip-${uid})`}>
          {/* Fundo escuro (garante cores vibrantes em qualquer tema) */}
          <circle cx="50" cy="50" r="43" fill="#0a1929" />

          {/* Pétalas animadas */}
          <g filter={`url(#glow-${uid})`}>
            {/* Grupo 1 — rotação horária */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="35s"
                repeatCount="indefinite"
              />
              <ellipse
                cx="50"
                cy="28"
                rx="15"
                ry="25"
                fill="#E63946"
                opacity="0.88"
              />
              <ellipse
                cx="72"
                cy="50"
                rx="25"
                ry="15"
                fill="#2EC4B6"
                opacity="0.82"
              />
            </g>

            {/* Grupo 2 — rotação anti-horária */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="-360 50 50"
                dur="30s"
                repeatCount="indefinite"
              />
              <ellipse
                cx="50"
                cy="72"
                rx="15"
                ry="25"
                fill="#4361EE"
                opacity="0.82"
              />
              <ellipse
                cx="28"
                cy="50"
                rx="25"
                ry="15"
                fill="#9B5DE5"
                opacity="0.82"
              />
            </g>
          </g>

          {/* Ponto de luz central */}
          <circle cx="50" cy="46" r="14" fill={`url(#center-${uid})`} />
        </g>
      </svg>
    </div>
  );
}

export default ScopeLogo;