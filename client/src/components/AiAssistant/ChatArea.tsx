import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ServerCrash,
  Users,
  WifiOff,
  RefreshCw,
  Bot,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { WelcomeScreen } from './WelcomeScreen'
import type { Message, Mode, ChatStatus } from '../../services/aiService'

interface ChatAreaProps {
  messages: Message[]
  status: ChatStatus
  error: string | null
  mode: Mode
  onRetry: () => void
}

/* ───────────────────────── TYPING INDICATOR ───────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="flex items-end gap-2.5">
        <div
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--primary)), hsl(217 95% 65%))',
            boxShadow:
              '0 0 12px hsl(var(--primary) / 0.25), 0 2px 8px hsl(215 20% 10% / 0.15)',
          }}
        >
          <Bot className="h-4 w-4 text-white" />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid hsl(var(--primary) / 0.3)',
              animation: 'typingPulse 2s ease-out infinite',
            }}
          />
        </div>

        <div
          className="flex items-center gap-1.5 rounded-2xl rounded-bl-md"
          style={{
            background: 'hsl(var(--card) / 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid hsl(var(--border) / 0.5)',
            padding: '14px 18px',
            boxShadow: '0 2px 12px hsl(215 20% 10% / 0.06)',
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, hsl(var(--primary)), hsl(217 95% 65%))',
                animation: 'typingDot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`,
                boxShadow: '0 0 6px hsl(var(--primary) / 0.2)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── ERROR MAPPING ───────────────────────── */
type ErrorConfig = {
  icon: React.ReactNode
  title: string
  description: string
  retryLabel: string
  color: string
  bgColor: string
  borderColor: string
}

function getErrorConfig(error: string): ErrorConfig {
  const err = error.toLowerCase()

  if (
    err.includes('429') ||
    err.includes('too many') ||
    err.includes('rate limit')
  ) {
    return {
      icon: <Users className="h-5 w-5" style={{ color: '#F59E0B' }} />,
      title: 'Cris está sobrecarregada',
      description:
        'Muita gente falando com ela ao mesmo tempo. Aguarde um momento e tente novamente.',
      retryLabel: 'Tentar novamente',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.06)',
      borderColor: 'rgba(245, 158, 11, 0.15)',
    }
  }

  if (
    err.includes('500') ||
    err.includes('502') ||
    err.includes('503') ||
    err.includes('server') ||
    err.includes('servidor')
  ) {
    return {
      icon: <ServerCrash className="h-5 w-5" style={{ color: '#EF4444' }} />,
      title: 'Não consegui falar com Cris',
      description:
        'Algo deu errado lá no servidor. Tente novamente em instantes.',
      retryLabel: 'Tentar novamente',
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.06)',
      borderColor: 'rgba(239, 68, 68, 0.15)',
    }
  }

  if (
    err.includes('network') ||
    err.includes('offline') ||
    err.includes('conexão') ||
    err.includes('fetch')
  ) {
    return {
      icon: <WifiOff className="h-5 w-5" style={{ color: '#EF4444' }} />,
      title: 'Sem conexão com a internet',
      description: 'Verifique sua conexão e tente novamente.',
      retryLabel: 'Reconectar',
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.06)',
      borderColor: 'rgba(239, 68, 68, 0.15)',
    }
  }

  return {
    icon: <AlertCircle className="h-5 w-5" style={{ color: '#EF4444' }} />,
    title: 'Algo inesperado aconteceu',
    description: 'Não conseguimos processar sua mensagem. Tente novamente.',
    retryLabel: 'Tentar novamente',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
  }
}

/* ───────────────────────── ERROR CARD ───────────────────────── */
function ErrorCard({
  error,
  onRetry,
}: {
  error: string
  onRetry: () => void
}) {
  const config = getErrorConfig(error)
  const [hovered, setHovered] = useState(false)

  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div
        style={{
          display: 'flex',
          maxWidth: '400px',
          flexDirection: 'column',
          gap: '12px',
          borderRadius: '18px',
          borderBottomLeftRadius: '6px',
          border: `1px solid ${config.borderColor}`,
          background: config.bgColor,
          backdropFilter: 'blur(12px)',
          padding: '16px 18px',
          boxShadow: `0 2px 16px ${config.borderColor}`,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              width: '36px',
              height: '36px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: `${config.color}15`,
              flexShrink: 0,
              boxShadow: `0 0 12px ${config.color}15`,
            }}
          >
            {config.icon}
          </div>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'hsl(var(--foreground))',
              lineHeight: 1.3,
            }}
          >
            {config.title}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '13px',
            color: 'hsl(var(--muted-foreground))',
            lineHeight: 1.5,
            paddingLeft: '48px',
            marginTop: '-4px',
          }}
        >
          {config.description}
        </p>

        {/* Retry */}
        <div style={{ paddingLeft: '48px' }}>
          <button
            onClick={onRetry}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              border: `1px solid ${config.borderColor}`,
              background: hovered
                ? `${config.color}12`
                : 'hsl(var(--background) / 0.6)',
              backdropFilter: 'blur(8px)',
              color: config.color,
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: hovered ? `0 4px 12px ${config.color}15` : 'none',
            }}
          >
            <RefreshCw
              className="h-3.5 w-3.5"
              style={{
                transition: 'transform 0.3s ease',
                transform: hovered ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
            {config.retryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── SCROLL TO BOTTOM ───────────────────────── */
function ScrollToBottomButton({
  onClick,
  visible,
}: {
  onClick: () => void
  visible: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="group"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '60px'}) scale(${visible ? 1 : 0.8})`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '999px',
        border: '1px solid hsl(var(--border) / 0.5)',
        background: 'hsl(var(--card) / 0.85)',
        backdropFilter: 'blur(12px)',
        color: 'hsl(var(--muted-foreground))',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow:
          '0 4px 20px hsl(215 20% 10% / 0.12), 0 0 0 1px hsl(var(--border) / 0.05)',
      }}
    >
      <ChevronDown
        className="transition-transform duration-200 group-hover:translate-y-0.5"
        style={{ width: '14px', height: '14px' }}
      />
      <span>Novas mensagens</span>
    </button>
  )
}

/* ───────────────────────── MAIN CHAT AREA ───────────────────────── */
export function ChatArea({
  messages,
  status,
  error,
  mode,
  onRetry,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      setShowScrollBtn(distanceFromBottom > 200)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (messages.length === 0 && status === 'idle') {
    return (
      <div
        className="animate-in fade-in duration-500"
        style={{ display: 'flex', flex: 1 }}
      >
        <WelcomeScreen />
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      {/* Fade no topo */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 z-10"
        style={{
          height: '40px',
          background:
            'linear-gradient(to bottom, hsl(var(--page-background)), transparent)',
        }}
      />

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="chat-scroll flex flex-1 flex-col gap-5 overflow-y-auto min-h-0 px-4 py-6 pb-8"
        style={{
          scrollBehavior: 'smooth',
          maskImage:
            'linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 20px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0px, black 40px, black calc(100% - 20px), transparent 100%)',
        }}
      >
        {/* Start indicator */}
        {messages.length > 0 && (
          <div
            className="animate-in fade-in duration-500"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 0 8px',
            }}
          >
            <Sparkles
              style={{
                width: '14px',
                height: '14px',
                color: 'hsl(var(--primary) / 0.4)',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground) / 0.5)',
                fontWeight: 500,
              }}
            >
              Início da conversa
            </span>
            <Sparkles
              style={{
                width: '14px',
                height: '14px',
                color: 'hsl(var(--primary) / 0.4)',
              }}
            />
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{
              animationDelay: `${Math.min(i * 40, 300)}ms`,
              animationFillMode: 'both',
            }}
          >
            <MessageBubble message={msg} />
          </div>
        ))}

        {status === 'loading' && <TypingIndicator />}

        {status === 'error' && error && (
          <ErrorCard error={error} onRetry={onRetry} />
        )}

        <div ref={bottomRef} className="h-2 shrink-0" />
      </div>

      {/* Scroll to bottom */}
      <ScrollToBottomButton onClick={scrollToBottom} visible={showScrollBtn} />

      <style>{`
        @keyframes typingDot {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-6px) scale(1.15);
            opacity: 1;
          }
        }
        @keyframes typingPulse {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.12);
          border-radius: 6px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.25);
        }
        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.12) transparent;
        }
      `}</style>
    </div>
  )
}