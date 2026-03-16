import { useEffect, useRef } from 'react'
import { AlertCircle, ServerCrash, Users, WifiOff, RefreshCw, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

/* ─────────────────────────────────────────
   Typing Indicator — três bolinhas animadas
───────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-end gap-2">
        {/* Avatar da Cris */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent border border-accent-foreground/10 shadow-sm">
          <Bot/>
        </div>

        {/* Bolha de digitando */}
        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-card border border-border/60 px-4 py-3 shadow-sm">
          {/* Bolinha 1 */}
          <span
            className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '900ms' }}
          />
          {/* Bolinha 2 */}
          <span
            className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: '180ms', animationDuration: '900ms' }}
          />
          {/* Bolinha 3 */}
          <span
            className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: '360ms', animationDuration: '900ms' }}
          />
        </div>
      </div>
    </div>
  )
}

//error mapping
type ErrorConfig = {
  icon: React.ReactNode
  title: string
  description: string
  retryLabel: string
}

function getErrorConfig(error: string): ErrorConfig {
  const err = error.toLowerCase()

  // 429 — Too Many Requests
  if (err.includes('429') || err.includes('too many') || err.includes('rate limit')) {
    return {
      icon: <Users className="h-5 w-5 text-amber-500" />,
      title: 'Cris está sobrecarregada 😮‍💨',
      description: 'Muita gente falando com ela ao mesmo tempo. Aguarde um momento e tente novamente.',
      retryLabel: 'Tentar novamente',
    }
  }

  // 500 / 502 / 503 — Server Errors
  if (
    err.includes('500') ||
    err.includes('502') ||
    err.includes('503') ||
    err.includes('server') ||
    err.includes('servidor')
  ) {
    return {
      icon: <ServerCrash className="h-5 w-5 text-destructive" />,
      title: 'Não consegui falar com Cris ',
      description: 'Algo deu errado lá no servidor. tente novamente em instantes.',
      retryLabel: 'Tentar novamente',
    }
  }

  // Sem conexão / Network Error
  if (
    err.includes('network') ||
    err.includes('offline') ||
    err.includes('conexão') ||
    err.includes('fetch')
  ) {
    return {
      icon: <WifiOff className="h-5 w-5 text-destructive" />,
      title: 'Sem conexão com a internet',
      description: 'Verifique sua conexão e tente novamente.',
      retryLabel: 'Reconectar',
    }
  }

  // Fallback genérico
  return {
    icon: <AlertCircle className="h-5 w-5 text-destructive" />,
    title: 'Algo inesperado aconteceu',
    description: 'Não conseguimos processar sua mensagem. Tente novamente.',
    retryLabel: 'Tentar novamente',
  }
}

//error card
function ErrorCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  const config = getErrorConfig(error)

  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex max-w-sm flex-col gap-3 rounded-2xl rounded-bl-sm border border-destructive/20 bg-destructive/5 px-4 py-3.5 shadow-sm">
        {/* Header do erro */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            {config.icon}
          </div>
          <span className="text-sm font-semibold text-foreground leading-tight">
            {config.title}
          </span>
        </div>

        {/* Descrição */}
        <p className="text-xs text-muted-foreground leading-relaxed pl-[42px] -mt-1">
          {config.description}
        </p>

        {/* Botão de retry */}
        <div className="pl-[42px]">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="
              h-7 gap-1.5 rounded-lg border-destructive/30
              bg-background text-xs text-destructive
              hover:bg-destructive/10 hover:text-destructive
              transition-all duration-200
            "
          >
            <RefreshCw className="h-3 w-3" />
            {config.retryLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
//chat area
export function ChatArea({ messages, status, error, mode, onRetry }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  if (messages.length === 0 && status === 'idle') {
    return <WelcomeScreen />
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto min-h-0 px-4 py-5 pb-6">
      {messages.map((msg, i) => (
        <div
          key={i}
          className="animate-in fade-in slide-in-from-bottom-1 duration-200"
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <MessageBubble message={msg} />
        </div>
      ))}

      {status === 'loading' && <TypingIndicator />}

      {status === 'error' && error && (
        <ErrorCard error={error} onRetry={onRetry} />
      )}

      {/* Espaço extra para a última mensagem não ficar colada no input */}
      <div ref={bottomRef} className="h-2" />
    </div>
  )
}