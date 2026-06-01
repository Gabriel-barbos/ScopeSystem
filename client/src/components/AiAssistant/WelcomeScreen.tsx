import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/context/Authcontext'
import {
  Mail,
  KeyRound,
  HelpCircle,
  Wrench,
  Building2,
  Headphones,
  Sparkles,
} from 'lucide-react'
import crisFinal from '../../assets/cris_final.png'

/* ───────────────────────── FLIP WORDS ───────────────────────── */
const FLIP_WORDS = [
  'dúvidas técnicas',
  'ajudas no MZone',
  'responder e-mails',
  'criar acessos',
  'ajudas em geral',
]

/* ───────────────────────── SUGGESTION CARDS ───────────────────────── */
const SUGGESTIONS = [
  { label: 'Responder um e-mail', icon: Mail, color: '#3B82F6' },
  { label: 'Criar um acesso', icon: KeyRound, color: '#8B5CF6' },
  { label: 'Dúvida no MZone', icon: HelpCircle, color: '#06B6D4' },
  { label: 'Diagnóstico de problema', icon: Wrench, color: '#F59E0B' },
  { label: 'Dúvidas sobre instalações', icon: Building2, color: '#10B981' },
]

/* ───────────────────────── TEXT FLIP ───────────────────────── */
function TextFlip() {
  const [index, setIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % FLIP_WORDS.length)
        setAnimating(false)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className="inline-block font-semibold"
      style={{
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(10px) scale(0.95)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(217 95% 65%))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {FLIP_WORDS[index]}
    </span>
  )
}

/* ───────────────────────── FLOATING ORBS ───────────────────────── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Primary blue orb — top right */}
      <div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          background: 'hsl(var(--primary) / 0.07)',
          filter: 'blur(100px)',
          top: '-120px',
          right: '-80px',
          animation: 'floatOrb 22s ease-in-out infinite',
        }}
      />
      {/* Light blue — bottom left */}
      <div
        className="absolute rounded-full"
        style={{
          width: '380px',
          height: '380px',
          background: 'hsl(217 95% 65% / 0.05)',
          filter: 'blur(80px)',
          bottom: '-60px',
          left: '-60px',
          animation: 'floatOrb 28s ease-in-out infinite reverse',
        }}
      />
      {/* Purple accent — center */}
      <div
        className="absolute rounded-full"
        style={{
          width: '260px',
          height: '260px',
          background: 'hsl(280 80% 60% / 0.04)',
          filter: 'blur(70px)',
          top: '35%',
          left: '50%',
          animation: 'floatOrb 18s ease-in-out infinite 4s',
        }}
      />
    </div>
  )
}

/* ───────────────────────── CURSOR SPOTLIGHT ───────────────────────── */
function useCursorSpotlight(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setVisible(true)
    }
    const handleLeave = () => setVisible(false)
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [containerRef])

  return { pos, visible }
}

/* ───────────────────────── STAGGER ENTRANCE ───────────────────────── */
function useStaggerEntrance(baseDelay = 0, stagger = 80) {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50)
    return () => clearTimeout(t)
  }, [])

  return useCallback(
    (i: number) => ({
      opacity: entered ? 1 : 0,
      transform: entered ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.55s ease ${baseDelay + i * stagger}ms, transform 0.55s ease ${baseDelay + i * stagger}ms`,
    }),
    [entered, baseDelay, stagger]
  )
}

/* ───────────────────────── CRIS IMAGE PANEL ───────────────────────── */
function CrisImagePanel({ staggerStyle }: { staggerStyle: React.CSSProperties }) {
  return (
    <div
      style={{
        ...staggerStyle,
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Glow blob behind image */}
      <div
        style={{
          position: 'absolute',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.22) 0%, transparent 70%)',
          filter: 'blur(40px)',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Secondary glow — purple */}
      <div
        style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(280 80% 60% / 0.14) 0%, transparent 70%)',
          filter: 'blur(50px)',
          top: '20px',
          right: '-20px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Spinning orbit ring */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          border: '1px solid hsl(var(--primary) / 0.12)',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'spinSlow 20s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          border: '1px dashed hsl(var(--primary) / 0.08)',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'spinSlow 14s linear infinite reverse',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* The actual image */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '260px',
          // tall enough to show full character
        }}
      >
        {/* Subtle frame glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '24px',
            boxShadow: `
              0 0 60px hsl(var(--primary) / 0.25),
              0 0 120px hsl(var(--primary) / 0.10),
              inset 0 0 40px hsl(var(--primary) / 0.05)
            `,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <img
          src={crisFinal}
          alt="Cris — Assistente de Suporte"
          style={{
            width: '100%',
            display: 'block',
            borderRadius: '20px',
            objectFit: 'cover',
            objectPosition: 'center top',
            filter: 'drop-shadow(0 20px 60px hsl(var(--primary) / 0.3))',
            animation: 'floatImage 6s ease-in-out infinite',
          }}
        />

        {/* Online badge */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '999px',
            background: 'hsl(var(--card) / 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid hsl(var(--border) / 0.4)',
            fontSize: '11px',
            fontWeight: 600,
            color: '#22C55E',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 3,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 8px rgba(34,197,94,0.7)',
              animation: 'blink 2s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          Online
        </div>

      
      </div>
    </div>
  )
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export function WelcomeScreen() {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const { pos, visible } = useCursorSpotlight(containerRef)
  const getStagger = useStaggerEntrance(80, 110)

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 items-center justify-center"
      style={{
        padding: '1.5rem 2rem',
        overflow: 'hidden',
        minHeight: '60vh',
      }}
    >
      <FloatingOrbs />

      {/* Cursor spotlight */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          left: pos.x - 250,
          top: pos.y - 250,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 1,
        }}
      />

      {/* ── Hero layout: two columns ── */}
      <div
        className="relative z-10 flex w-full items-center justify-center gap-10 flex-wrap"
        style={{ maxWidth: '900px' }}
      >

        {/* LEFT — Cris image */}
        <CrisImagePanel staggerStyle={getStagger(0)} />

        {/* RIGHT — Content */}
        <div
          className="flex flex-col"
          style={{
            flex: '1 1 320px',
            minWidth: '280px',
            maxWidth: '460px',
            alignItems: 'flex-start',
            gap: 0,
          }}
        >
          {/* Badge */}
          <div style={getStagger(1)}>
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 16px',
                borderRadius: '999px',
                background: 'hsl(var(--accent) / 0.6)',
                backdropFilter: 'blur(12px)',
                color: 'hsl(var(--accent-foreground))',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '20px',
                border: '1px solid hsl(var(--border) / 0.5)',
                overflow: 'hidden',
              }}
            >
              <span
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.1), transparent)',
                  animation: 'shinePass 4s ease-in-out infinite',
                }}
              />
              <Headphones className="relative" style={{ width: '12px', height: '12px' }} />
              <span className="relative">Suporte Interno</span>
            </div>
          </div>

          {/* Greeting — "Olá, [user]" with glow */}
          <div style={getStagger(2)}>
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  fontWeight: 600,
                }}
              >
                Olá,{' '}
              </span>
              <span
                style={{
                  background: `linear-gradient(
                    135deg,
                    hsl(var(--foreground)) 0%,
                    hsl(var(--primary)) 40%,
                    hsl(217 95% 65%) 65%,
                    hsl(280 80% 65%) 85%,
                    hsl(var(--foreground)) 100%
                  )`,
                  backgroundSize: '300% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 6s ease-in-out infinite',
                  // text-shadow via filter since WebkitTextFillColor blocks it
                  filter: 'drop-shadow(0 0 24px hsl(var(--primary) / 0.35))',
                }}
              >
                {user.name}
              </span>
              <span
                style={{
                  background: `linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--primary)))`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                .
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div style={getStagger(3)}>
            <p
              style={{
                fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
                color: 'hsl(var(--muted-foreground))',
                fontWeight: 400,
                marginBottom: '28px',
                lineHeight: 1.6,
              }}
            >
              Capitã das Respostas Inteligentes de Suporte — pronta pra te ajudar.
            </p>
          </div>

          {/* Flip text */}
          <div style={getStagger(4)}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                fontSize: 'clamp(0.9rem, 1.8vw, 1rem)',
                color: 'hsl(var(--muted-foreground))',
                marginBottom: '32px',
                minHeight: '28px',
              }}
            >
              <span>Posso te ajudar com</span>
              <TextFlip />
            </div>
          </div>

          {/* Suggestion cards */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {SUGGESTIONS.map((item, i) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className="group"
                  style={{
                    ...getStagger(5 + i),
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px 9px 12px',
                    borderRadius: '14px',
                    border: '1px solid hsl(var(--border) / 0.6)',
                    background: 'hsl(var(--card) / 0.6)',
                    backdropFilter: 'blur(8px)',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12.5px',
                    fontWeight: 475,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    letterSpacing: '0.01em',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = `${item.color}44`
                    el.style.background = `${item.color}0D`
                    el.style.transform = 'translateY(-2px)'
                    el.style.boxShadow = `0 4px 20px ${item.color}18, 0 0 0 1px ${item.color}12`
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'hsl(var(--border) / 0.6)'
                    el.style.background = 'hsl(var(--card) / 0.6)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-lg transition-all duration-200"
                    style={{
                      width: '28px',
                      height: '28px',
                      background: `${item.color}15`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      className="transition-transform duration-200 group-hover:scale-110"
                      style={{ width: '14px', height: '14px', color: item.color }}
                    />
                  </div>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(30px, -20px) scale(1.05); }
          66%      { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes shinePass {
          0%, 100% { transform: translateX(-100%); }
          50%      { transform: translateX(100%); }
        }
        @keyframes spinSlow {
          from { transform: translateX(-50%) rotate(0deg); }
          to   { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes floatImage {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}