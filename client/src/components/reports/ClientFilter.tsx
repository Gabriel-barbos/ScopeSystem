import { useState } from "react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, Check, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { clientApi, type Client } from "@/services/ClientService";

interface ClientFilterProps {
  value: string | null;
  onChange: (clientId: string | null) => void;
}

export function ClientFilter({ value, onChange }: ClientFilterProps) {
  const [open, setOpen] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: clientApi.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const mainClients = clients.filter((c) => !c.parent);
  const subClients = clients.filter((c) => !!c.parent);

  const selected = clients.find((c) => c._id === value);

  function getLabel() {
    if (!selected) return null;
    if (selected.parent) {
      const parent = mainClients.find((c) => c._id === selected.parent?._id);
      return parent ? `${parent.name} › ${selected.name}` : selected.name;
    }
    return selected.name;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="w-[220px] justify-between">
          <span className="truncate">{getLabel() ?? "Todos os clientes"}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[280px]">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>

            {/* Todos */}
            <CommandGroup>
              <CommandItem onSelect={() => { onChange(null); setOpen(false); }}>
                <Users className="mr-2 h-4 w-4" />
                Todos os clientes
                <Check className={cn("ml-auto h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Clientes principais */}
            <CommandGroup heading="Clientes">
              {mainClients.map((client) => {
                const subs = subClients.filter((s) => s.parent?._id === client._id);
                return (
                  <div key={client._id}>
                    <CommandItem onSelect={() => { onChange(client._id); setOpen(false); }}>
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={client.image?.[0]} />
                        <AvatarFallback>{client.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{client.name}</span>
                      <Check className={cn("h-4 w-4", value === client._id ? "opacity-100" : "opacity-0")} />
                    </CommandItem>

                    {/* Sub-clientes indentados */}
                    {subs.map((sub) => (
                      <CommandItem
                        key={sub._id}
                        onSelect={() => { onChange(sub._id); setOpen(false); }}
                        className="pl-8"
                      >
                        <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage src={sub.image?.[0]} />
                          <AvatarFallback>{sub.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-sm">{sub.name}</span>
                        <Check className={cn("h-4 w-4", value === sub._id ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </div>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}