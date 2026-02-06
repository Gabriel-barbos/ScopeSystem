import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface JarvisButtonProps {
  href?: string;
  className?: string;
}

export function JarvisButton({ 
  href = "https://super-jarvis-red.vercel.app/", 
  className 
}: JarvisButtonProps) {
  return (
    <a
      href={href}
      target="_blank"   
      rel="noopener noreferrer"
      className={cn(
        // Container com borda gradiente
        "group relative inline-flex items-center justify-center rounded-xl p-[2px]",
        "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500",
        "bg-[length:200%_auto] animate-gradient-x",
        // Efeito glow
        "shadow-[0_0_10px_rgba(139,92,246,0.5)]",
        "hover:shadow-[0_0_25px_rgba(139,92,246,0.8)]",
        // Transição mais lenta e suave
        "transition-all duration-500 ease-in-out",
        className
      )}
    >
      {/* Fundo interno transparente/card */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-[10px]",
          "bg-background/90 dark:bg-card/90 backdrop-blur-sm",
          "h-10 px-3",
          // Transição mais lenta
          "transition-all duration-500 ease-in-out"
        )}
      >
        {/* Ícone do robô com glow - AUMENTADO e CENTRALIZADO */}
        <div className="flex items-center justify-center w-6 h-6">
          <Bot 
            className={cn(
              "w-6 h-6", 
              "text-purple-400",
              "drop-shadow-[0_0_8px_rgba(139,92,246,0.9)]",
              "group-hover:scale-110",
              // Transição mais lenta
              "transition-all duration-500 ease-in-out"
            )} 
          />
        </div>

        {/* Texto que expande no hover - transição mais lenta */}
        <div
          className={cn(
            "overflow-hidden whitespace-nowrap",
            "max-w-0 group-hover:max-w-[110px]",
            "opacity-0 group-hover:opacity-100",
            // Transição mais lenta e suave
            "transition-all duration-500 ease-in-out"
          )}
        >
          <span
            className={cn(
              "text-sm font-semibold",
              "bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400",
              "bg-[length:200%_auto] animate-gradient-x",
              "bg-clip-text text-transparent",
              "drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]"
            )}
          >
            Super Jarvis
          </span>
        </div>
      </div>
    </a>
  );
}