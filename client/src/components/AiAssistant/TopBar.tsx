import { Bot, Sparkles } from 'lucide-react'
import { KnowledgeModal } from '../AiAssistant/KnowledgeModal'

export function TopBar() {
  return (
    <div className="sticky top-0 z-10 px-4 pt-3 pb-2 pointer-events-none">
      <div className="flex items-start justify-between">

        {/* ── Esquerda: Avatar flutuante ── */}
        <div className="pointer-events-auto">
          <div className="
            flex items-center gap-2.5
            rounded-2xl
            px-3 py-2
            border border-white/10
            bg-white/5 dark:bg-white/[0.04]
            backdrop-blur-xl
            shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]
            transition-all duration-300
          ">
            {/* Avatar */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full
              bg-gradient-to-br from-accent/80 to-accent/40
              border border-white/10
              shadow-inner
            ">
              <Bot className="h-[16px] w-[16px] text-accent-foreground" />

              {/* Indicador Online */}
              <span className="
                absolute -bottom-0.5 -right-0.5
                h-2.5 w-2.5 rounded-full
                bg-green-500
                border-2 border-card
              ">
                <span className="absolute inset-0 rounded-full bg-green-400/50 animate-ping" />
              </span>
            </div>

            {/* Nome + Status */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-foreground leading-none tracking-tight">
                  Cris
                </span>
                <Sparkles className="h-2.5 w-2.5 text-primary/50" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-500 dark:text-green-400 leading-none">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                Online
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