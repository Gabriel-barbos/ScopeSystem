import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import type { Message } from '../../services/aiService'
import { WelcomeEmailCards, type EmailData } from './Welcomeemailcards'

function extractEmailsJson(text: string): EmailData[] | null {
  try {
    const match = text.match(/\{[\s\S]*"emails"[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    return Array.isArray(parsed.emails) ? parsed.emails : null
  } catch {
    return null
  }
}

function IconCopy({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


function CopyButton({
  text,
  size = 'sm',
}: {
  text: string
  size?: 'sm' | 'xs'
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
    }
  }, [text])

  const isXs = size === 'xs'

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copiado!' : 'Copiar'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isXs ? '3px 7px' : '4px 9px',
        borderRadius: '6px',
        border: '1px solid hsl(var(--border))',
        background: copied ? 'hsl(var(--accent))' : 'hsl(var(--card))',
        color: copied ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        fontSize: isXs ? '11px' : '12px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s, opacity 0.15s',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? <IconCheck size={isXs ? 12 : 13} /> : <IconCopy size={isXs ? 12 : 13} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}


function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div
      style={{
        borderRadius: '10px',
        border: '1px solid hsl(var(--border))',
        overflow: 'hidden',
        margin: '10px 0',
        fontSize: '13px',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'hsl(var(--muted))',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 500,
            color: 'hsl(var(--muted-foreground))',
            textTransform: 'lowercase',
            fontFamily: 'inherit',
          }}
        >
          {language || 'código'}
        </span>
        <CopyButton text={code} size="xs" />
      </div>

      {/* code body */}
      <pre
        style={{
          margin: 0,
          padding: '14px 16px',
          overflowX: 'auto',
          background: 'hsl(var(--card))',
          lineHeight: 1.65,
        }}
      >
        <code
          style={{
            fontFamily: '"Geist Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace',
            fontSize: '12.5px',
            color: 'hsl(var(--foreground))',
          }}
        >
          {code}
        </code>
      </pre>
    </div>
  )
}


const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  // Parágrafos
  p: ({ children }) => (
    <p style={{ margin: '0 0 10px', lineHeight: 1.7, lastChild: { marginBottom: 0 } } as React.CSSProperties}>
      {children}
    </p>
  ),

  // Headings
  h1: ({ children }) => (
    <h1 style={{ fontSize: '17px', fontWeight: 600, margin: '16px 0 8px', lineHeight: 1.3 }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '14px 0 6px', lineHeight: 1.3 }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '12px 0 4px', lineHeight: 1.3 }}>
      {children}
    </h3>
  ),

  // Listas
  ul: ({ children }) => (
    <ul style={{ margin: '6px 0 10px', paddingLeft: '20px', lineHeight: 1.7 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '6px 0 10px', paddingLeft: '20px', lineHeight: 1.7 }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '3px' }}>{children}</li>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: '8px 0',
        padding: '8px 14px',
        borderLeft: '3px solid hsl(var(--primary) / 0.4)',
        background: 'hsl(var(--accent))',
        borderRadius: '0 6px 6px 0',
        color: 'hsl(var(--muted-foreground))',
        fontSize: '13.5px',
      }}
    >
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const isBlock = node?.position?.start?.line !== node?.position?.end?.line || match

    if (isBlock) {
      const code = String(children).replace(/\n$/, '')
      return <CodeBlock language={match?.[1] ?? ''} code={code} />
    }

    return (
      <code
        style={{
          fontFamily: '"Geist Mono", "Fira Code", ui-monospace, monospace',
          fontSize: '12px',
          background: 'hsl(var(--muted))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '4px',
          padding: '1px 5px',
          color: 'hsl(var(--foreground))',
        }}
        {...props}
      >
        {children}
      </code>
    )
  },

  // Remove o pre wrapper pois o code já cuida disso
  pre: ({ children }) => <>{children}</>,

  // Tabela
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '10px 0', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px' }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: 'hsl(var(--muted))' }}>{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>{children}</tr>
  ),
  th: ({ children }) => (
    <th
      style={{
        padding: '8px 12px',
        textAlign: 'left',
        fontWeight: 600,
        fontSize: '12px',
        color: 'hsl(var(--muted-foreground))',
        whiteSpace: 'nowrap',
        borderRight: '1px solid hsl(var(--border))',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      style={{
        padding: '8px 12px',
        verticalAlign: 'top',
        borderRight: '1px solid hsl(var(--border))',
        lineHeight: 1.5,
      }}
    >
      {children}
    </td>
  ),

  // HR
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid hsl(var(--border))', margin: '14px 0' }} />
  ),

  // Strong / Em
  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  em: ({ children }) => <em style={{ fontStyle: 'italic', color: 'hsl(var(--muted-foreground))' }}>{children}</em>,

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: 'hsl(var(--primary))',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
      }}
    >
      {children}
    </a>
  ),
}


function AIAvatar() {
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'hsl(var(--primary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: '2px',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
        {/* anteninha */}
        <rect x="15" y="0" width="6" height="8" rx="3" fill="white" fillOpacity="0.9"/>
        <circle cx="18" cy="0" r="3.5" fill="white" fillOpacity="0.9"/>
        {/* cabeça */}
        <rect x="2" y="7" width="32" height="26" rx="8" fill="white" fillOpacity="0.15"/>
        {/* olhos */}
        <rect x="7" y="13" width="8" height="8" rx="2.5" fill="white" fillOpacity="0.92"/>
        <rect x="21" y="13" width="8" height="8" rx="2.5" fill="white" fillOpacity="0.92"/>
        <circle cx="11" cy="17" r="2.5" fill="hsl(var(--primary))"/>
        <circle cx="25" cy="17" r="2.5" fill="hsl(var(--primary))"/>
        {/* sorriso */}
        <path
          d="M10 24 Q18 30 26 24"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        {/* parafusinho */}
        <circle cx="18" cy="16" r="0" fill="none"/>
      </svg>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar da IA */}
      {!isUser && <AIAvatar />}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          maxWidth: isUser ? '72%' : '85%',
        }}
      >
        {/* Bubble */}
        <div
          style={{
            padding: isUser ? '9px 14px' : '11px 15px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser ? 'hsl(var(--primary))' : 'hsl(var(--card))',
            border: isUser ? 'none' : '1px solid hsl(var(--border))',
            color: isUser ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
            fontSize: '14px',
            lineHeight: 1.6,
            wordBreak: 'break-word',
          }}
        >
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.text}</p>
       ) : (
     <div style={{ minWidth: 0 }}>
       {(() => {
         const emails = extractEmailsJson(message.text)
         if (emails) return <WelcomeEmailCards emails={emails} />
         return (
           <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
             {message.text}
           </ReactMarkdown>
         )
       })()}
     </div>
   )}
        </div>

        {/* Actions row — aparece no hover */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: hovered ? 'all' : 'none',
          }}
        >
          <CopyButton text={message.text} size="xs" />

          {message.timestamp && (
            <span
              style={{
                fontSize: '11px',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}