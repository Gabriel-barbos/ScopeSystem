import { Bot, Sparkles } from 'lucide-react'
import { KnowledgeModal } from '../AiAssistant/KnowledgeModal'

export function TopBar() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Container do Ícone com indicador de status */}
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-inner">
          <Bot className="h-5 w-5 text-primary transition-transform duration-300 hover:scale-110" />
          
          {/* Bolinha de "Online" com pulso suave */}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-500/30 animate-pulse" />
        </div>

        {/* Informações de Texto com Hierarquia */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Cris
            </span>
            {/* Ícone sutil para reforçar que é IA */}
            <Sparkles className="h-3 w-3 text-primary/70" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
Mini Kadu          </span>
        </div>
      </div>

      {/* Ações da direita */}
      <div className="flex items-center gap-2">
        <KnowledgeModal />
      </div>
    </div>
  )
}