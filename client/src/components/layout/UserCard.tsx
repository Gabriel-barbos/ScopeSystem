import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserCardProps {
  name: string;
  role: string;
  initials: string;
  isCollapsed: boolean;
}

export function UserCard({ name, role, initials, isCollapsed }: UserCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-border/50 ${
      isCollapsed ? 'p-2' : 'p-2'
    }`}>
    
      
      
      {/* Conteúdo */}
      <div className={`relative flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="relative">
          <Avatar className={`transition-all duration-300 ${
            isCollapsed ? 'h-9 w-9' : 'h-12 w-12'
          } ring-2 ring-primary/20 ring-offset-2 ring-offset-sidebar-background shadow-lg shadow-primary/20`}>
            <AvatarFallback className="bg-primary/40  text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Indicador de status online */}
          {!isCollapsed && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-sidebar-background shadow-sm">
              <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden flex-1 min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground truncate tracking-tight">
              {name}
            </span>
            <div className="flex items-center  mt-0.5">
              <span className="relative flex">
              </span>
              <span className="text-xs  text-muted-foreground/90 truncate font-medium">
                {role}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}