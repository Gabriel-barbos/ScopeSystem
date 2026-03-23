import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/context/Authcontext'
import {
  Bot,
  Mail,
  KeyRound,
  HelpCircle,
  Wrench,
  Building2,
  Headphones,
} from 'lucide-react'

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
      className="inline-block font-semibold transition-all duration-400 ease-out"
      style={{
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(12px) scale(0.95)' : 'translateY(0) scale(1)',
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

/* ───────────────────────── AVATAR PULSE ───────────────────────── */
function AvatarPulse() {
  return (
    <div className="relative flex items-center justify-center" style={{ marginBottom: '28px' }}>
      <div
        className="absolute rounded-full"
        style={{
          width: '88px',
          height: '88px',
          border: '2px solid hsl(var(--primary) / 0.15)',
          animation: 'pulseRing 3s ease-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '88px',
          height: '88px',
          border: '2px solid hsl(var(--primary) / 0.1)',
          animation: 'pulseRing 3s ease-out infinite 0.8s',
        }}
      />

      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(217 95% 65%))',
          boxShadow: `
            0 0 24px hsl(var(--primary) / 0.3),
            0 0 48px hsl(var(--primary) / 0.15),
            0 4px 16px hsl(215 20% 10% / 0.2)
          `,
        }}
      >
        <Bot className="h-7 w-7 text-white" />
      </div>

      <div
        className="absolute rounded-full"
        style={{
          width: '16px',
          height: '16px',
          background: '#22C55E',
          border: '3px solid hsl(var(--background))',
          bottom: '0px',
          right: 'calc(50% - 32px)',
          boxShadow: '0 0 8px rgba(34,197,94,0.4)',
        }}
      />
    </div>
  )
}

/* ───────────────────────── FLOATING ORBS ───────────────────────── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute rounded-full"
        style={{
          width: '350px',
          height: '350px',
          background: 'hsl(var(--primary) / 0.06)',
          filter: 'blur(80px)',
          top: '-80px',
          right: '-60px',
          animation: 'floatOrb 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '280px',
          height: '280px',
          background: 'hsl(217 95% 65% / 0.05)',
          filter: 'blur(70px)',
          bottom: '-40px',
          left: '-40px',
          animation: 'floatOrb 25s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: 'hsl(280 80% 60% / 0.04)',
          filter: 'blur(60px)',
          top: '30%',
          left: '60%',
          animation: 'floatOrb 18s ease-in-out infinite 3s',
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
      transform: entered ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.5s ease ${baseDelay + i * stagger}ms, transform 0.5s ease ${baseDelay + i * stagger}ms`,
    }),
    [entered, baseDelay, stagger]
  )
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export function WelcomeScreen() {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const { pos, visible } = useCursorSpotlight(containerRef)
  const getStagger = useStaggerEntrance(100, 100)

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 flex-col items-center justify-center"
      style={{
        padding: '0 1.5rem',
        textAlign: 'center',
        minHeight: '60vh',
        overflow: 'hidden',
      }}
    >
      <FloatingOrbs />

      <div
        className="pointer-events-none absolute"
        style={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, transparent 70%)',
          left: pos.x - 200,
          top: pos.y - 200,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 flex flex-col items-center" style={{ gap: 0 }}>
        <div style={getStagger(0)}>
          <AvatarPulse />
        </div>

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
              marginBottom: '24px',
              border: '1px solid hsl(var(--border) / 0.5)',
              overflow: 'hidden',
            }}
          >
            <span
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.08), transparent)',
                animation: 'shinePass 4s ease-in-out infinite',
              }}
            />
            <Headphones className="relative" style={{ width: '12px', height: '12px' }} />
            <span className="relative">Suporte Interno</span>
          </div>
        </div>

        <div style={getStagger(2)}>
          <h1
            style={{
              fontSize: 'clamp(2.6rem, 6vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: '8px',
              background: `linear-gradient(
                135deg,
                hsl(var(--foreground)) 0%,
                hsl(var(--primary)) 40%,
                hsl(217 95% 65%) 60%,
                hsl(280 80% 65%) 80%,
                hsl(var(--foreground)) 100%
              )`,
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 6s ease-in-out infinite',
            }}
          >
            Olá, {user.name}.
          </h1>
        </div>

        <div style={getStagger(3)}>
          <p
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              color: 'hsl(var(--muted-foreground))',
              fontWeight: 400,
              marginBottom: '32px',
              lineHeight: 1.5,
              maxWidth: '440px',
            }}
          >
            Cris, Capitão das Respostas Inteligentes de Suporte
          </p>
        </div>

        <div style={getStagger(4)}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'hsl(var(--muted-foreground))',
              marginBottom: '48px',
              minHeight: '32px',
            }}
          >
            <span>Posso te ajudar com</span>
            <TextFlip />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            maxWidth: '620px',
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
                  gap: '10px',
                  padding: '10px 18px 10px 14px',
                  borderRadius: '14px',
                  border: '1px solid hsl(var(--border) / 0.6)',
                  background: 'hsl(var(--card) / 0.6)',
                  backdropFilter: 'blur(8px)',
                  color: 'hsl(var(--foreground))',
                  fontSize: '13px',
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
                    width: '32px',
                    height: '32px',
                    background: `${item.color}15`,
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    className="transition-transform duration-200 group-hover:scale-110"
                    style={{ width: '16px', height: '16px', color: item.color }}
                  />
                </div>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
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
      `}</style>
    </div>
  )
}