import { useEffect, useRef } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
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

export function ChatArea({ messages, status, error, mode, onRetry }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // scroll automático para a última mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  if (messages.length === 0 && status === 'idle') {
    return <WelcomeScreen mode={mode} />
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}

      {status === 'loading' && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Digitando...
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div className="flex justify-start">
          <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-destructive underline" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}