import { useEffect, useState } from 'react'
import { useAuth } from "@/context/Authcontext";

const FLIP_WORDS = [
  'dúvidas técnicas',
  'ajudas no MZone',
  'responder e-mails',
  'criar acessos',
  'ajudas em geral',
]

function TextFlip() {
  const [index, setIndex] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % FLIP_WORDS.length)
        setAnimating(false)
      }, 350)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      style={{
        display: 'inline-block',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        color: 'hsl(var(--primary))',
        fontWeight: 500,
      }}
    >
      {FLIP_WORDS[index]}
    </span>
  )
}

export function WelcomeScreen() {

    const { user } = useAuth();
  

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: '0 1.5rem',
        textAlign: 'center',
        minHeight: '60vh',
      }}
    >
      {/* Greeting badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '999px',
          background: 'hsl(var(--accent))',
          color: 'hsl(var(--accent-foreground))',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '28px',
          border: '1px solid hsl(var(--border))',
        }}
      >
        Suporte Interno
      </div>

      {/* Name with animated gradient */}
      <h1
        style={{
          fontSize: 'clamp(2.8rem, 6vw, 4.2rem)',
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          marginBottom: '6px',
          background: `linear-gradient(
            135deg,
            hsl(var(--foreground)) 0%,
            hsl(var(--primary)) 45%,
            hsl(217, 95%, 65%) 70%,
            hsl(var(--foreground)) 100%
          )`,
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmer 5s linear infinite',
        }}
      >
        Olá, {user.name}.
      </h1>

      {/* Sub-headline */}
      <p
        style={{
          fontSize: 'clamp(1rem, 2.2vw, 1.0rem)',
          color: 'hsl(var(--muted-foreground))',
          fontWeight: 400,
          marginBottom: '36px',
          lineHeight: 1.5,
          maxWidth: '440px',
        }}
      >
      Cris, Capitão das Respostas Inteligentes de Suporte
      </p>

      {/* Text flip block */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          color: 'hsl(var(--muted-foreground))',
          marginBottom: '52px',
          minHeight: '32px',
        }}
      >
        <span>Posso te ajudar com</span>
        <TextFlip />
      </div>

      {/* Suggestion chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          maxWidth: '560px',
        }}
      >
        {[
          'Responder um e-mail',
          'Criar um acesso',
          'Dúvida no MZone',
          'Diagnóstico de problema',
          'Duvidas sobre instalações',
        ].map((label) => (
          <button
            key={label}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              fontSize: '13px',
              fontWeight: 450,
              cursor: 'pointer',
              transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = 'hsl(var(--accent))'
              el.style.borderColor = 'hsl(var(--primary) / 0.35)'
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = 'hsl(var(--card))'
              el.style.borderColor = 'hsl(var(--border))'
              el.style.transform = 'translateY(0)'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Shimmer keyframe via a style tag inlined */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </div>
  )
}