import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { Message } from '../../services/aiService'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm dark:prose-invert max-w-none"
            components={{
              // evita que o prose quebre o layout interno da bolha
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            }}
          >
            {message.text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}