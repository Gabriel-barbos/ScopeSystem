import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userName: string;
  userInitials: string;
  className?: string;
}

export function Header({ userName, userInitials, className }: HeaderProps) {
  return (
    <header className={cn("flex h-16 items-center border-b border-border bg-card px-6", className)}>
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/30  text-primary text-sm font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">
          Olá, <span className="font-bold">{userName}</span>
        </span>
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
