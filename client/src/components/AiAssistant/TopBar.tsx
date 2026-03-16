import { Bot, Sparkles } from 'lucide-react'
import { KnowledgeModal } from '../AiAssistant/KnowledgeModal'

export function TopBar() {
  return (
    <div className="sticky top-0 z-10 px-3 pt-3 bg-page-background">
      {/* Card flutuante com bordas arredondadas */}
      <div className="
        flex items-center justify-between
        rounded-xl
        border border-border/60
        bg-card
        px-4 py-3
        shadow-sm
        ring-1 ring-border/30
        transition-all duration-300
      ">
        {/* Lado esquerdo — Avatar + Info */}
        <div className="flex items-center gap-3">

          {/* Avatar com gradiente sutil no fundo */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent border border-accent-foreground/10 shadow-inner">
            <Bot className="h-[18px] w-[18px] text-accent-foreground transition-transform duration-300 hover:scale-110" />

            {/* Indicador Online */}
            <span className="
              absolute -bottom-0.5 -right-0.5
              h-2.5 w-2.5 rounded-full
              bg-green-500
              border-2 border-card
              shadow-sm
            ">
              {/* Pulso externo mais suave */}
              <span className="absolute inset-0 rounded-full bg-green-500/40 animate-ping" />
            </span>
          </div>

          {/* Texto */}
          <div className="flex flex-col gap-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-foreground leading-none">
                Cris
              </span>
              <Sparkles className="h-3 w-3 text-primary/60" />
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Pílula de status */}
              <span className="
                inline-flex items-center gap-1
                rounded-full
                bg-green-500/10
                px-1.5 py-0.5
                text-[10px] font-medium
                text-green-600 dark:text-green-400
                border border-green-500/20
                leading-none
              ">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                Online
              </span>

              <span className="text-[11px] text-muted-foreground font-medium leading-none">
                Mini Kadu
              </span>
            </div>
          </div>
        </div>

        {/* Divisor vertical sutil */}
        <div className="hidden sm:block h-6 w-px bg-border/60 mx-1" />

        {/* Lado direito — Ações */}
        <div className="flex items-center gap-2">
          <KnowledgeModal />
        </div>
      </div>
    </div>
  )
}