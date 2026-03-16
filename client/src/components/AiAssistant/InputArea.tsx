import { useState, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Mode, ChatStatus } from '../../services/aiService'

const MODES: { value: Mode; label: string }[] = [
  { value: 'email', label: 'Responder e-mail' },
  { value: 'acessos', label: 'Criar acessos' },
  { value: 'duvidas', label: 'Dúvidas' },
]

// Categorias fixas por ora — podem vir do backend futuramente
const CATEGORIES = ['Sistema', 'Instalação', 'Equipamento X', 'Equipamento Y']

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isLoading = status === 'loading'
  const canSend = text.trim().length > 0 && !isLoading && (mode !== 'duvidas' || !!category)

  const handleSend = useCallback(() => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
    textareaRef.current?.focus()
  }, [canSend, text, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t px-4 py-3">
      <div className="flex flex-col gap-2">
        {/* Selectors */}
        <div className="flex gap-2">
          <Select value={mode} onValueChange={(v) => onModeChange(v as Mode)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {mode === 'duvidas' && (
            <Select value={category ?? ''} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Text + Send */}
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="min-h-[40px] max-h-40 resize-none"
            rows={1}
          />
          <Button size="icon" onClick={handleSend} disabled={!canSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}