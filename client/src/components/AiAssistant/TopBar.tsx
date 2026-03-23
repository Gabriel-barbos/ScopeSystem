import { Bot, Sparkles } from 'lucide-react'
import { KnowledgeModal } from '../AiAssistant/KnowledgeModal'



interface TopBarProps {
  apiStatus?: 'online' | 'degraded' | 'offline' | 'checking'
  apiStatusDetail?: string
}

export function TopBar({ apiStatus = 'checking', apiStatusDetail = 'Verificando conexão...' }: TopBarProps) {
  
  const statusStyles = {
    online: {
      bg: 'bg-green-500',
      ping: 'bg-green-400/50 animate-ping',
      text: 'text-green-500 dark:text-green-400',
      label: 'Online'
    },
    degraded: {
      bg: 'bg-yellow-500',
      ping: 'bg-yellow-400/50 animate-ping',
      text: 'text-yellow-500 dark:text-yellow-400',
      label: 'Instável'
    },
    offline: {
      bg: 'bg-red-500',
      ping: 'hidden', // Remove a animação de "pulsar" se estiver offline
      text: 'text-red-500 dark:text-red-400',
      label: 'Offline'
    },
    checking: {
      bg: 'bg-blue-500',
      ping: 'bg-blue-400/50 animate-pulse', // Usa um pulso suave enquanto verifica
      text: 'text-blue-500 dark:text-blue-400',
      label: 'Conectando...'
    }
  }

  // Pega o estilo atual baseado na prop, ou cai no 'checking' por padrão
  const currentStyle = statusStyles[apiStatus] || statusStyles.checking

  return (
    <div className="sticky top-0 z-10 px-4 pt-3 pb-2 pointer-events-none">
      <div className="flex items-start justify-between">

        {/* ── Esquerda: Avatar flutuante ── */}
        <div className="pointer-events-auto">
          <div 
            className="
              flex items-center gap-2.5
              rounded-2xl
              px-3 py-2
              border border-white/10
              bg-white/5 dark:bg-white/[0.04]
              backdrop-blur-xl
              shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]
              transition-all duration-300
            "
            title={apiStatusDetail} // Adicionado: mostra o detalhe do erro se o usuário passar o mouse por cima
          >
            {/* Avatar */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full
              bg-gradient-to-br from-accent/80 to-accent/40
              border border-white/10
              shadow-inner
            ">
              <Bot className="h-[16px] w-[16px] text-accent-foreground" />

              {/* Indicador de Status dinâmico */}
              <span className={`
                absolute -bottom-0.5 -right-0.5
                h-2.5 w-2.5 rounded-full
                ${currentStyle.bg}
                border-2 border-card
                transition-colors duration-300
              `}>
                <span className={`absolute inset-0 rounded-full ${currentStyle.ping}`} />
              </span>
            </div>

            {/* Nome + Status dinâmico */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-foreground leading-none tracking-tight">
                  Cris
                </span>
                <Sparkles className="h-2.5 w-2.5 text-primary/50" />
              </div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${currentStyle.text} leading-none transition-colors duration-300`}>
                <span className={`h-1.5 w-1.5 rounded-full ${currentStyle.bg} inline-block transition-colors duration-300`} />
                {currentStyle.label}
              </span>
            </div>
          </div>
        </div>

        {/* ── Direita: KnowledgeModal flutuante ── */}
        <div className="pointer-events-auto">
          <div className="
            rounded-2xl
            border border-white/10
            bg-white/5 dark:bg-white/[0.04]
            backdrop-blur-xl
            shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]
            transition-all duration-300
            hover:bg-white/10 hover:border-white/20
            p-1.5
          ">
            <KnowledgeModal />
          </div>
        </div>

      </div>
    </div>
  )
}