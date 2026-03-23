import { useState, useCallback, useEffect } from 'react' 
import API from '@/api/axios'

export type Mode = 'email' | 'acessos' | 'equipamento' | 'plataforma' | 'conhecimento'
export type MessageRole = 'user' | 'model'
export type ChatStatus = 'idle' | 'loading' | 'error'

export type ApiHealthStatus = 'online' | 'degraded' | 'offline' | 'checking'
export interface AiStatusResponse {
  status: ApiHealthStatus
  detail: string
}

export interface Message {
  role: MessageRole
  text: string
  timestamp: Date
}

export interface SendMessageParams {
  mode: Mode
  category: string | null
  history: Message[]
  message: string
}

export interface KnowledgePayload {
  name: string
  mode: Mode
  content: string
}

export interface Knowledge {
  _id: string
  name: string
  mode: Mode
  content: string
  createdAt?: string
}

export const aiApi = {
  sendMessage: async (params: SendMessageParams): Promise<string> => {
    const { data } = await API.post<{ reply: string }>('/ai/chat', params)
    return data.reply
  },
  //requisição para checar o status
  fetchApiStatus: async (): Promise<AiStatusResponse> => {
    const { data } = await API.get<AiStatusResponse>('/ai/status')
    return data
  },

  fetchKnowledge: async (mode: Mode): Promise<Knowledge[]> => {
    const { data } = await API.get(`/knowledge/${mode}`)
    return data
  },

  fetchAllKnowledge: async (): Promise<Knowledge[]> => {
    const { data } = await API.get('/knowledge')
    return data
  },

  saveKnowledge: async (payload: KnowledgePayload): Promise<Knowledge> => {
    const { data } = await API.post('/knowledge', payload)
    return data
  },

  updateKnowledge: async (id: string, content: string): Promise<Knowledge> => {
    const { data } = await API.put(`/knowledge/${id}`, { content })
    return data
  },

  deleteKnowledge: async (id: string): Promise<void> => {
    await API.delete(`/knowledge/${id}`)
  },
}

export function useAiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [mode, setMode] = useState<Mode>('email')
  const [category, setCategory] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [apiStatus, setApiStatus] = useState<ApiHealthStatus>('checking')
  const [apiStatusDetail, setApiStatusDetail] = useState<string>('Verificando conexão...')

  const checkApiStatus = useCallback(async () => {
    setApiStatus('checking')
    try {
      const res = await aiApi.fetchApiStatus()
      setApiStatus(res.status)
      setApiStatusDetail(res.detail)
    } catch (err) {
      setApiStatus('offline')
      setApiStatusDetail('Backend inacessível ou API fora do ar.')
    }
  }, [])

  useEffect(() => {
    checkApiStatus()
    

  }, [checkApiStatus])

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    setMessages([])
    setCategory(null)
    setError(null)
    setStatus('idle')
  }, [])

  const handleSend = useCallback(
    async (text: string) => {
      const userMessage: Message = { role: 'user', text, timestamp: new Date() }
      const updatedHistory = [...messages, userMessage]

      setMessages(updatedHistory)
      setError(null)

      if (apiStatus === 'offline' || apiStatus === 'degraded') {
        setError(`Não é possível enviar a mensagem no momento. Status: ${apiStatusDetail}`)
        setStatus('error')
        return
      }

      setStatus('loading')

      try {
        const reply = await aiApi.sendMessage({ mode, category, history: messages, message: text })
        setMessages([...updatedHistory, { role: 'model', text: reply, timestamp: new Date() }])
        setStatus('idle')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido.')
        setStatus('error')
        checkApiStatus() 
      }
    },
    [messages, mode, category, apiStatus, apiStatusDetail, checkApiStatus]
  )

  const handleRetry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    setMessages((prev) => prev.slice(0, -1))
    handleSend(lastUser.text)
  }, [messages, handleSend])

  return { 
    messages, 
    status, 
    mode, 
    category, 
    error, 
    apiStatus,        
    apiStatusDetail,  
    checkApiStatus,   
    setCategory, 
    handleModeChange, 
    handleSend, 
    handleRetry 
  }
}