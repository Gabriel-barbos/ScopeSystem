import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Mode, ChatStatus } from '../../services/aiService'
import { aiApi } from '../../services/aiService'
import {
  Send,
  ChevronDown,
  Loader2,
  Sparkles,
  Mail,
  KeyRound,
  HelpCircle,
} from 'lucide-react'

const MODES: { value: Mode; label: string; icon: React.ElementType }[] = [
  { value: 'email', label: 'E-mail', icon: Mail },
  { value: 'acessos', label: 'Acessos', icon: KeyRound },
  { value: 'conhecimento', label: 'Dúvidas', icon: HelpCircle },
]

interface InputAreaProps {
  mode: Mode
  category: string | null
  status: ChatStatus
  onModeChange: (mode: Mode) => void
  onCategoryChange: (category: string) => void
  onSend: (text: string) => void
}

function GlowBorder({
  focused,
  children,
}: {
  focused: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '20px',
        padding: '1.5px',
        backgroundImage: focused
          ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(217 95% 65%), hsl(280 80% 65%), hsl(var(--primary)))'
          : 'none',
        backgroundColor: focused ? 'transparent' : 'hsl(var(--border))',
        backgroundSize: '300% 300%',
        animation: focused ? 'borderRotate 4s ease infinite' : 'none',
        transition: 'box-shadow 0.3s ease',
        boxShadow: focused
          ? '0 0 20px hsl(var(--primary) / 0.15), 0 0 40px hsl(var(--primary) / 0.08), 0 8px 32px hsl(215 20% 10% / 0.12)'
          : '0 2px 4px hsl(215 20% 10% / 0.04), 0 8px 24px hsl(215 20% 10% / 0.08)',
      }}
    >
      <div
        style={{
          borderRadius: '18.5px',
          background: 'hsl(var(--card))',
          overflow: 'visible',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function SendButton({
  canSend,
  isLoading,
  onClick,
}: {
  canSend: boolean
  isLoading: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!canSend}
      className="send-btn group"
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '12px',
        border: 'none',
        background: canSend
          ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(217 95% 65%))'
          : 'hsl(var(--muted))',
        color: canSend ? 'white' : 'hsl(var(--muted-foreground))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: canSend ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        boxShadow: canSend ? '0 2px 12px hsl(var(--primary) / 0.3)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (canSend) {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 4px 20px hsl(var(--primary) / 0.4)'
        }
      }}
      onMouseLeave={(e) => {
        if (canSend) {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 2px 12px hsl(var(--primary) / 0.3)'
        }
      }}
      onMouseDown={(e) => {
        if (canSend) e.currentTarget.style.transform = 'scale(0.92)'
      }}
      onMouseUp={(e) => {
        if (canSend) e.currentTarget.style.transform = 'scale(1.05)'
      }}
    >
      {canSend && (
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
          }}
        />
      )}
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin relative z-10" />
      ) : (
        <Send
          className="relative z-10"
          style={{ width: '15px', height: '15px' }}
        />
      )}
    </button>
  )
}

function ModePill({
  m,
  active,
  onClick,
}: {
  m: (typeof MODES)[number]
  active: boolean
  onClick: () => void
}) {
  const Icon = m.icon
  return (
    <button
      onClick={onClick}
      className="transition-all duration-200"
      style={{
        padding: '5px 14px',
        borderRadius: '999px',
        border: 'none',
        background: active ? 'hsl(var(--card))' : 'transparent',
        color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        fontSize: '12.5px',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        boxShadow: active
          ? '0 1px 4px hsl(215 20% 10% / 0.12), 0 0 0 1px hsl(var(--primary) / 0.1)'
          : 'none',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}
    >
      <Icon style={{ width: '13px', height: '13px' }} />
      <span>{m.label}</span>
    </button>
  )
}

function KnowledgePicker({
  category,
  onCategoryChange,
  mode,
}: {
  category: string | null
  onCategoryChange: (name: string) => void
  mode: Mode
}) {
  const [catOpen, setCatOpen] = useState(false)
  const [knowledgeNames, setKnowledgeNames] = useState<string[]>([])
  const [loadingCats, setLoadingCats] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mode !== 'conhecimento') return
    setLoadingCats(true)
    aiApi
      .fetchAllKnowledge()
      .then((data) => setKnowledgeNames(data.map((d) => d.name)))
      .catch(() => setKnowledgeNames([]))
      .finally(() => setLoadingCats(false))
  }, [mode])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        catRef.current &&
        !catRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleToggle = () => {
    if (!catOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.top - 8,
        left: rect.left,
      })
    }
    setCatOpen((v) => !v)
  }

  if (mode !== 'conhecimento') return null

  return (
    <div ref={catRef} style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={loadingCats}
        className="transition-all duration-200"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 10px 5px 12px',
          borderRadius: '999px',
          border: '1px solid',
          borderColor: category
            ? 'hsl(var(--primary) / 0.2)'
            : 'hsl(var(--border) / 0.6)',
          background: category
            ? 'hsl(var(--primary) / 0.08)'
            : 'hsl(var(--card) / 0.6)',
          backdropFilter: 'blur(8px)',
          color: category
            ? 'hsl(var(--primary))'
            : 'hsl(var(--muted-foreground))',
          fontSize: '12.5px',
          fontWeight: 500,
          cursor: loadingCats ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
          opacity: loadingCats ? 0.6 : 1,
        }}
      >
        {loadingCats ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles style={{ width: '12px', height: '12px', flexShrink: 0 }} />
        )}
        <span>{loadingCats ? 'Carregando…' : category ?? 'Conhecimento'}</span>
        <ChevronDown
          style={{
            width: '12px',
            height: '12px',
            transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {catOpen &&
        dropdownPos &&
        createPortal(
          <div
            ref={dropdownRef}
            className="animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              transform: 'translateY(-100%)',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border) / 0.6)',
              borderRadius: '14px',
              boxShadow:
                '0 8px 32px hsl(215 20% 10% / 0.16), 0 0 0 1px hsl(var(--border) / 0.05)',
              padding: '4px',
              minWidth: '220px',
              width: 'max-content',
              maxWidth: '320px',
              zIndex: 9999,
              backdropFilter: 'blur(16px)',
              maxHeight: '280px',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <div
              style={{
                padding: '8px 12px 6px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'hsl(var(--muted-foreground))',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Base de Conhecimento
            </div>

            {knowledgeNames.length === 0 ? (
              <div
                style={{
                  padding: '14px 12px',
                  fontSize: '13px',
                  color: 'hsl(var(--muted-foreground))',
                  textAlign: 'center',
                }}
              >
                Nenhum conhecimento cadastrado
              </div>
            ) : (
              knowledgeNames.map((name) => (
                <div
                  key={name}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onCategoryChange(name)
                    setCatOpen(false)
                  }}
                  className="transition-all duration-150"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color:
                      category === name
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--foreground))',
                    background:
                      category === name
                        ? 'hsl(var(--primary) / 0.08)'
                        : 'transparent',
                    fontWeight: category === name ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  onMouseEnter={(e) => {
                    if (category !== name)
                      (e.currentTarget as HTMLDivElement).style.background =
                        'hsl(var(--accent))'
                  }}
                  onMouseLeave={(e) => {
                    if (category !== name)
                      (e.currentTarget as HTMLDivElement).style.background =
                        'transparent'
                  }}
                >
                  {category === name && (
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'hsl(var(--primary))',
                        flexShrink: 0,
                        boxShadow: '0 0 6px hsl(var(--primary) / 0.4)',
                      }}
                    />
                  )}
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                  </span>
                </div>
              ))
            )}
          </div>,
          document.body
        )}
    </div>
  )
}

export function InputArea({
  mode,
  category,
  status,
  onModeChange,
  onCategoryChange,
  onSend,
}: InputAreaProps) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isLoading = status === 'loading'
  const canSend =
    text.trim().length > 0 && !isLoading && (mode !== 'conhecimento' || !!category)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [text])

  const handleSend = useCallback(() => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.focus()
      }
    }, 0)
  }, [canSend, text, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        padding: '12px 16px 20px',
        background:
          'linear-gradient(to top, hsl(var(--page-background)) 70%, transparent)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          pointerEvents: 'all',
        }}
      >
        <GlowBorder focused={focused}>
          <div style={{ padding: '14px 16px 10px' }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Digite sua mensagem…"
              disabled={isLoading}
              rows={1}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '15px',
                lineHeight: '1.6',
                color: 'hsl(var(--foreground))',
                background: 'transparent',
                fontFamily: 'inherit',
                minHeight: '26px',
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'block',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px 10px',
              borderTop: '1px solid hsl(var(--border) / 0.4)',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'hsl(var(--muted) / 0.5)',
                  borderRadius: '999px',
                  padding: '3px',
                  gap: '2px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {MODES.map((m) => (
                  <ModePill
                    key={m.value}
                    m={m}
                    active={mode === m.value}
                    onClick={() => onModeChange(m.value)}
                  />
                ))}
              </div>

              <KnowledgePicker
                category={category}
                onCategoryChange={onCategoryChange}
                mode={mode}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              {text.length > 80 && (
                <span
                  className="transition-all duration-300"
                  style={{
                    fontSize: '11px',
                    color:
                      text.length > 500
                        ? 'hsl(var(--destructive))'
                        : 'hsl(var(--muted-foreground))',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: text.length > 500 ? 600 : 400,
                  }}
                >
                  {text.length}
                </span>
              )}

              <SendButton
                canSend={canSend}
                isLoading={isLoading}
                onClick={handleSend}
              />
            </div>
          </div>
        </GlowBorder>

        <p
          style={{
            textAlign: 'center',
            fontSize: '11.5px',
            color: 'hsl(var(--muted-foreground) / 0.6)',
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <kbd
            style={{
              fontFamily: 'inherit',
              background: 'hsl(var(--muted) / 0.5)',
              borderRadius: '5px',
              padding: '2px 6px',
              fontSize: '10.5px',
              border: '1px solid hsl(var(--border) / 0.3)',
              boxShadow: '0 1px 2px hsl(215 20% 10% / 0.05)',
            }}
          >
            Enter
          </kbd>
          <span>para enviar</span>
          <span style={{ margin: '0 2px', opacity: 0.4 }}>·</span>
          <kbd
            style={{
              fontFamily: 'inherit',
              background: 'hsl(var(--muted) / 0.5)',
              borderRadius: '5px',
              padding: '2px 6px',
              fontSize: '10.5px',
              border: '1px solid hsl(var(--border) / 0.3)',
              boxShadow: '0 1px 2px hsl(215 20% 10% / 0.05)',
            }}
          >
            Shift + Enter
          </kbd>
          <span>para nova linha</span>
        </p>
      </div>

      <style>{`
        @keyframes borderRotate {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .send-btn:active {
          transform: scale(0.92) !important;
        }
        textarea::-webkit-scrollbar {
          width: 4px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.2);
          border-radius: 4px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.3);
        }
      `}</style>
    </div>
  )
}