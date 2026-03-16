
import { useState, useCallback } from 'react'


export type Mode = 'email' | 'acessos' | 'duvidas'
export type MessageRole = 'user' | 'model'
export type ChatStatus = 'idle' | 'loading' | 'error'

export interface Message {
  role: MessageRole
  text: string,
  timestamp: Date
}

interface SendMessageParams {
  mode: Mode
  category: string | null
  history: Message[]
  message: string
}


const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error('Erro na requisição.')
  return res.json()
}

export async function sendMessage(params: SendMessageParams): Promise<string> {
  const data = await request<{ text: string }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(params),
  })
  return data.text
}

export async function fetchKnowledge(mode: string, category?: string) {
  const path = category ? `/knowledge/${mode}/${category}` : `/knowledge/${mode}`
  return request(path)
}

export async function saveKnowledge(payload: {
  mode: string
  category?: string
  content: string
}) {
  return request('/knowledge', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateKnowledge(id: string, content: string) {
  return request(`/knowledge/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export async function deleteKnowledge(id: string) {
  return request(`/knowledge/${id}`, { method: 'DELETE' })
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [mode, setMode] = useState<Mode>('email')
  const [category, setCategory] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    setMessages([])
    setCategory(null)
    setError(null)
    setStatus('idle')
  }, [])

  const handleSend = useCallback(
    async (text: string) => {
      const userMessage: Message = { role: 'user', text }
      const updatedHistory = [...messages, userMessage]

      setMessages(updatedHistory)
      setStatus('loading')
      setError(null)

      try {
        const reply = await sendMessage({
          mode,
          category,
          history: messages,
          message: text,
        })
        setMessages([...updatedHistory, { role: 'model', text: reply }])
        setStatus('idle')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido.')
        setStatus('error')
      }
    },
    [messages, mode, category]
  )

  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) return
    setMessages(prev => prev.slice(0, -1))
    handleSend(lastUserMessage.text)
  }, [messages, handleSend])

  return {
    messages,
    status,
    mode,
    category,
    error,
    setCategory,
    handleModeChange,
    handleSend,
    handleRetry,
  }
}