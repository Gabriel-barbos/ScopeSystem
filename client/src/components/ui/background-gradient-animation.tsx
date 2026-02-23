"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * BackgroundGradientAnimation
 *
 * Versão corrigida e melhorada:
 * - Blobs se movem de forma autônoma via keyframes CSS injetadas dinamicamente
 * - Blob interativo segue o mouse com interpolação suave (rAF loop)
 * - CSS vars aplicadas no container (não no body)
 * - Suporte a Safari (blur fallback)
 */
export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(15, 23, 42)",
  gradientBackgroundEnd   = "rgb(30, 41, 59)",
  firstColor   = "59, 130, 246",
  secondColor  = "99, 102, 241",
  thirdColor   = "14, 165, 233",
  fourthColor  = "6, 182, 212",
  fifthColor   = "34, 211, 238",
  pointerColor = "79, 70, 229",
  size         = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?:   string;
  firstColor?:   string;
  secondColor?:  string;
  thirdColor?:   string;
  fourthColor?:  string;
  fifthColor?:   string;
  pointerColor?: string;
  size?:         string;
  blendingValue?: string;
  children?:     React.ReactNode;
  className?:    string;
  interactive?:  boolean;
  containerClassName?: string;
}) => {
  const containerRef   = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef<HTMLDivElement>(null);

  const curX = useRef(0);
  const curY = useRef(0);
  const tgX  = useRef(0);
  const tgY  = useRef(0);
  const rafRef = useRef<number>(0);

  const [isSafari, setIsSafari] = useState(false);

  /* ── Detect Safari ─────────────────────────────────────────── */
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  /* ── CSS vars no container ─────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const vars: Record<string, string> = {
      "--gba-start":    gradientBackgroundStart,
      "--gba-end":      gradientBackgroundEnd,
      "--c1": firstColor,
      "--c2": secondColor,
      "--c3": thirdColor,
      "--c4": fourthColor,
      "--c5": fifthColor,
      "--cp": pointerColor,
      "--sz": size,
      "--blend": blendingValue,
    };
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
  }, [
    gradientBackgroundStart, gradientBackgroundEnd,
    firstColor, secondColor, thirdColor, fourthColor, fifthColor,
    pointerColor, size, blendingValue,
  ]);

  /* ── Inject autonomous keyframes once ──────────────────────── */
  useEffect(() => {
    const id = "gba-keyframes";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      /* Blob 1 — vertical drift */
      @keyframes gba-move1 {
        0%   { transform: translateY(-40%) translateX(0%);   }
        25%  { transform: translateY(0%)   translateX(8%);   }
        50%  { transform: translateY(40%)  translateX(0%);   }
        75%  { transform: translateY(0%)   translateX(-8%);  }
        100% { transform: translateY(-40%) translateX(0%);   }
      }

      /* Blob 2 — slow circle */
      @keyframes gba-move2 {
        0%   { transform: rotate(0deg)   translateX(-18%) rotate(0deg);   }
        100% { transform: rotate(360deg) translateX(-18%) rotate(-360deg); }
      }

      /* Blob 3 — wide horizontal pendulum */
      @keyframes gba-move3 {
        0%   { transform: translateX(-45%) translateY(-10%); }
        50%  { transform: translateX(45%)  translateY(10%);  }
        100% { transform: translateX(-45%) translateY(-10%); }
      }

      /* Blob 4 — tight circle, opposite direction */
      @keyframes gba-move4 {
        0%   { transform: rotate(0deg)    translateX(12%) rotate(0deg);   }
        100% { transform: rotate(-360deg) translateX(12%) rotate(360deg); }
      }

      /* Blob 5 — diagonal float */
      @keyframes gba-move5 {
        0%   { transform: translate(-30%, -30%); }
        33%  { transform: translate(20%,  -10%); }
        66%  { transform: translate(10%,  30%);  }
        100% { transform: translate(-30%, -30%); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  /* ── Mouse tracking rAF loop ───────────────────────────────── */
  useEffect(() => {
    if (!interactive) return;

    const animate = () => {
      curX.current += (tgX.current - curX.current) / 18;
      curY.current += (tgY.current - curY.current) / 18;

      if (interactiveRef.current) {
        interactiveRef.current.style.transform =
          `translate(${Math.round(curX.current)}px, ${Math.round(curY.current)}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [interactive]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    tgX.current = e.clientX - rect.left - rect.width  / 2;
    tgY.current = e.clientY - rect.top  - rect.height / 2;
  }, []);

  /* ── Blob config ────────────────────────────────────────────── */
  const blobs = [
    { varName: "--c1", animation: "gba-move1 28s ease-in-out infinite",        opacity: 1,   origin: "center center"            },
    { varName: "--c2", animation: "gba-move2 22s linear infinite",             opacity: 1,   origin: "center center"            },
    { varName: "--c3", animation: "gba-move3 36s ease-in-out infinite",        opacity: 0.9, origin: "center center"            },
    { varName: "--c4", animation: "gba-move4 18s linear infinite",             opacity: 0.75,origin: "center center"            },
    { varName: "--c5", animation: "gba-move5 42s ease-in-out infinite",        opacity: 1,   origin: "center center"            },
  ] as const;

  const filterClass = isSafari
    ? "blur-2xl"
    : "[filter:url(#blurMe)_blur(40px)]";

  return (
    <div
      ref={containerRef}
      onMouseMove={interactive ? handleMouseMove : undefined}
      className={cn(
        "relative h-screen w-screen overflow-hidden",
        containerClassName
      )}
      style={{
        background: `linear-gradient(40deg, var(--gba-start), var(--gba-end))`,
      }}
    >
      {/* SVG filter */}
      <svg className="hidden" aria-hidden>
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* ── Animated blobs ── */}
      <div
        className={cn("absolute inset-0 h-full w-full", filterClass)}
        aria-hidden
      >
        {blobs.map(({ varName, animation, opacity }, i) => (
          <div
            key={i}
            style={{
              position:   "absolute",
              width:      "var(--sz)",
              height:     "var(--sz)",
              top:        "calc(50% - var(--sz) / 2)",
              left:       "calc(50% - var(--sz) / 2)",
              background: `radial-gradient(circle at center, rgba(var(${varName}), 0.85) 0%, rgba(var(${varName}), 0) 55%) no-repeat`,
              mixBlendMode: "var(--blend)" as React.CSSProperties["mixBlendMode"],
              animation,
              opacity,
              willChange: "transform",
            }}
          />
        ))}

        {/* Interactive pointer blob */}
        {interactive && (
          <div
            ref={interactiveRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top:  "-50%",
              left: "-50%",
              background: `radial-gradient(circle at center, rgba(var(--cp), 0.75) 0%, rgba(var(--cp), 0) 50%) no-repeat`,
              mixBlendMode: "var(--blend)" as React.CSSProperties["mixBlendMode"],
              opacity: 0.7,
              willChange: "transform",
            }}
          />
        )}
      </div>

      {/* ── Children ── */}
      <div className={cn("relative z-10", className)}>
        {children}
      </div>
    </div>
  );
};