import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { roleConfig, type RoleType } from "@/utils/badges"; 

interface NoticeCardProps {
  title: string;
  description: string;
  createdAt: string;
  roles: RoleType[];
  priority?: "low" | "medium" | "high";
  className?: string;
}

const priorityConfig = {
  low:    { label: "Baixa", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
  medium: { label: "Média", className: "bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-900/30  dark:text-amber-300  dark:border-amber-800"  },
  high:   { label: "Alta",  className: "bg-red-50    text-red-700    border-red-200    dark:bg-red-900/30    dark:text-red-300    dark:border-red-800"    },
};

const MAX_VISIBLE = 4;

export function NoticeCard({ title, description, createdAt, roles, priority, className }: NoticeCardProps) {
  const visibleRoles = roles.slice(0, MAX_VISIBLE);
  const overflowRoles = roles.slice(MAX_VISIBLE);

  return (
    <div className={cn(
      "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5",
      "shadow-sm transition-shadow duration-200 hover:shadow-md",
      className
    )}>
      {/* Linha de destaque no topo */}
      <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl bg-primary/70" />

      {/* Título + prioridade */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">{title}</h3>
        {priority && (
          <Badge variant="outline" className={cn("shrink-0 text-[11px] font-medium", priorityConfig[priority].className)}>
            {priorityConfig[priority].label}
          </Badge>
        )}
      </div>

      {/* Descrição */}
      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{description}</p>

      <div className="h-px bg-border" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{createdAt}</span>
        </div>

        {/* Avatar group — ícone e cor vindos direto do roleConfig */}
        <TooltipProvider delayDuration={150}>
          <div className="flex items-center">
            {visibleRoles.map((roleKey, i) => {
              const config = roleConfig[roleKey];
              const Icon = config.icon;

              return (
                <Tooltip key={roleKey}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border-2 border-card",
                        "cursor-default transition-transform duration-150 hover:z-10 hover:-translate-y-0.5",
                        config.className // mesmas classes do badge de cargo
                      )}
                      style={{ marginLeft: i === 0 ? 0 : "-8px" }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {config.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {overflowRoles.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex h-7 w-7 cursor-default items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground hover:z-10"
                    style={{ marginLeft: "-8px" }}
                  >
                    +{overflowRoles.length}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {overflowRoles.map((r) => roleConfig[r].label).join(", ")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}