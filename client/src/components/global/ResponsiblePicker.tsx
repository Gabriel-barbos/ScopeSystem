import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserServiceInstance, type User } from "@/services/UserService";
import { getRoleConfig } from "@/utils/badges";
import { toast } from "sonner";


type ResponsiblePickerProps = {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

type UserAvatarProps = {
  name: string;
  size?: "sm" | "md";
};


export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");


export const UserAvatar = ({ name, size = "md" }: UserAvatarProps) => {
  const sizeClass = size === "sm" ? "h-5 w-5 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <Avatar className={sizeClass}>
      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};


const RoleBadge = ({ role }: { role: string }) => {
  const config = getRoleConfig(role);
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0",
        config.className
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
};


export const ResponsiblePicker = ({
  value,
  onChange,
  disabled,
  placeholder = "Atribuir responsável",
}: ResponsiblePickerProps) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega apenas na primeira abertura
  useEffect(() => {
    if (!open || users.length > 0) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await UserServiceInstance.getAll();
        setUsers(data);
      } catch {
        toast.error("Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  const selectedUser = users.find(
    (u) => u.name.toLowerCase() === value?.toLowerCase()
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between h-auto py-1.5 px-3 font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value ? (
            <div className="flex items-center gap-2 min-w-0">
              <UserAvatar name={value} size="sm" />
              <span className="text-sm truncate">{value}</span>
            </div>
          ) : (
            <span className="text-sm">{placeholder}</span>
          )}

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {value && !disabled && (
              <span
                role="button"
                onClick={handleClear}
                className="rounded-sm p-0.5 hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
          </div>
        </Button>
      </PopoverTrigger>

      {/* 
        side="top" — abre para cima, evitando ser cortado pelo drawer bottom
        avoidCollisions — reposiciona automaticamente se não couber
        o max-h no CommandList garante scroll interno sem depender do viewport
      */}
      <PopoverContent
        side="top"
        align="start"
        avoidCollisions={true}
        collisionPadding={16}
        className="p-0 w-[300px]"
      >
        <Command>
          <CommandInput placeholder="Buscar usuário..." />
          <CommandList className="max-h-[240px] overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhum usuário encontrado</CommandEmpty>
                <CommandGroup heading="Usuários do sistema">
                  {users.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <CommandItem
                        key={u.id}
                        value={u.name}
                        onSelect={() => {
                          onChange(isSelected ? "" : u.name);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 py-2 cursor-pointer"
                      >
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Nome + email */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium leading-tight truncate">
                            {u.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </span>
                        </div>

                        {/* Role badge com ícone e cor do sistema */}
                        <RoleBadge role={u.role} />

                        {/* Check */}
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0 text-primary transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};