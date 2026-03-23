import { useState, useRef, useCallback, useEffect } from 'react'
import type { Mode, ChatStatus } from '../../services/aiService'
import { aiApi } from '../../services/aiService'

const MODES: { value: Mode; label: string }[] = [
  { value: 'email', label: 'E-mail' },
  { value: 'acessos', label: 'Acessos' },
  { value: 'duvidas', label: 'Dúvidas' },
]

interface InputAreaProps {
  mode: Mode
  category: string | null
  status: ChatStatus
  onModeChange: (mode: Mode) => void
  onCategoryChange: (category: string) => void
  onSend: (text: string) => void
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
  const [catOpen, setCatOpen] = useState(false)
  const [knowledgeNames, setKnowledgeNames] = useState<string[]>([])
  const [loadingCats, setLoadingCats] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const catRef = useRef<HTMLDivElement>(null)

  const isLoading = status === 'loading'
  const canSend = text.trim().length > 0 && !isLoading && (mode !== 'duvidas' || !!category)

  // Busca todos os conhecimentos cadastrados ao entrar no modo dúvidas
  useEffect(() => {
    if (mode !== 'duvidas') return
    setLoadingCats(true)
    aiApi
      .fetchAllKnowledge()
      .then((data) => setKnowledgeNames(data.map((d) => d.name)))
      .catch(() => setKnowledgeNames([]))
      .finally(() => setLoadingCats(false))
  }, [mode])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [text])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
        background: 'linear-gradient(to top, hsl(var(--page-background)) 70%, transparent)',
        pointerEvents: 'none',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto', pointerEvents: 'all' }}>
        <div
          style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '18px',
            boxShadow: '0 2px 4px hsl(215 20% 10% / 0.04), 0 8px 24px hsl(215 20% 10% / 0.08)',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          }}
          onFocusCapture={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'hsl(var(--ring) / 0.4)'
            el.style.boxShadow =
              '0 2px 4px hsl(215 20% 10% / 0.04), 0 8px 32px hsl(215 20% 10% / 0.12), 0 0 0 3px hsl(var(--ring) / 0.08)'
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderColor = 'hsl(var(--border))'
              el.style.boxShadow =
                '0 2px 4px hsl(215 20% 10% / 0.04), 0 8px 24px hsl(215 20% 10% / 0.08)'
            }
          }}
        >
          {/* Textarea */}
          <div style={{ padding: '14px 16px 10px', borderRadius: '18px 18px 0 0', overflow: 'hidden' }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
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

          {/* Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px 10px',
              borderTop: '1px solid hsl(var(--border))',
              borderRadius: '0 0 18px 18px',
              gap: '8px',
              background: 'hsl(var(--card))',
            }}
          >
            {/* Left: mode pills + knowledge picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>

              {/* Mode pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'hsl(var(--muted))',
                  borderRadius: '999px',
                  padding: '3px',
                  gap: '2px',
                }}
              >
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => onModeChange(m.value)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      border: 'none',
                      background: mode === m.value ? 'hsl(var(--card))' : 'transparent',
                      color: mode === m.value ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      boxShadow: mode === m.value ? '0 1px 3px hsl(215 20% 10% / 0.10)' : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Knowledge picker — só aparece no modo dúvidas */}
              {mode === 'duvidas' && (
                <div ref={catRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setCatOpen((v) => !v)}
                    disabled={loadingCats}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px 4px 12px',
                      borderRadius: '999px',
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--card))',
                      color: category ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      cursor: loadingCats ? 'wait' : 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      whiteSpace: 'nowrap',
                      opacity: loadingCats ? 0.6 : 1,
                    }}
                  >
                    <span>{loadingCats ? 'Carregando…' : (category ?? 'Conhecimento')}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{
                        transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s',
                        flexShrink: 0,
                      }}
                    >
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {catOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 6px)',
                        left: 0,
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px hsl(215 20% 10% / 0.12)',
                        padding: '4px',
                        minWidth: '180px',
                        zIndex: 9999,
                      }}
                    >
                      {knowledgeNames.length === 0 ? (
                        <div
                          style={{
                            padding: '10px 12px',
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
                            onClick={() => { onCategoryChange(name); setCatOpen(false) }}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              color: category === name ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                              background: category === name ? 'hsl(var(--accent))' : 'transparent',
                              fontWeight: category === name ? 500 : 400,
                              cursor: 'pointer',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={(e) => {
                              if (category !== name)
                                (e.currentTarget as HTMLDivElement).style.background = 'hsl(var(--accent))'
                            }}
                            onMouseLeave={(e) => {
                              if (category !== name)
                                (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                            }}
                          >
                            {name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: char count + send */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {text.length > 80 && (
                <span style={{ fontSize: '11.5px', color: 'hsl(var(--muted-foreground))' }}>
                  {text.length} car.
                </span>
              )}

              <button
                onClick={handleSend}
                disabled={!canSend}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: 'none',
                  background: canSend ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  color: canSend ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canSend ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s, transform 0.1s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (canSend) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--primary) / 0.85)'
                }}
                onMouseLeave={(e) => {
                  if (canSend) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--primary))'
                }}
                onMouseDown={(e) => {
                  if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.93)'
                }}
                onMouseUp={(e) => {
                  if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 8L3 13.5L5 8L3 2.5L13.5 8Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <p style={{ textAlign: 'center', fontSize: '11.5px', color: 'hsl(var(--muted-foreground))', marginTop: '8px' }}>
          <kbd style={{ fontFamily: 'inherit', background: 'hsl(var(--muted))', borderRadius: '4px', padding: '1px 5px', fontSize: '11px' }}>Enter</kbd>{' '}
          para enviar &nbsp;·&nbsp;{' '}
          <kbd style={{ fontFamily: 'inherit', background: 'hsl(var(--muted))', borderRadius: '4px', padding: '1px 5px', fontSize: '11px' }}>Shift + Enter</kbd>{' '}
          para nova linha
        </p>
      </div>
    </div>
  )
}