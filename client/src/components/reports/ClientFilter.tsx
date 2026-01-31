import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientApi } from "@/services/ClientService";

interface Client {
  _id: string;
  name: string;
  image?: string;
}

interface ClientFilterProps {
  value: string | null;
  onChange: (clientId: string | null) => void;
}

export function ClientFilter({ value, onChange }: ClientFilterProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const selectedClient = clients.find((c) => c._id === value);

  useEffect(() => {
    async function loadClients() {
      const res = await clientApi.getAll();
      setClients(res.data ?? res);
    }
    loadClients();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="w-[200px] justify-between"
        >
          {selectedClient ? selectedClient.name : "Todos os clientes"}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[260px]">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado</CommandEmpty>

            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Todos os clientes
              </CommandItem>

              {clients.map((client) => (
                <CommandItem
                  key={client._id}
                  onSelect={() => {
                    onChange(client._id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client._id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={client.image} />
                    <AvatarFallback>
                      {client.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
