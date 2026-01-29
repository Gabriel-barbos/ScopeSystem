import { useState, useMemo, useEffect } from "react";
import { Search, Loader2, X, Calendar, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Schedule } from "@/services/ScheduleService";
import { cn } from "@/lib/utils";

interface ScheduleAutocompleteProps {
  schedules: Schedule[];
  isLoading: boolean;
  onSelect: (schedule: Schedule | null) => void;
  selectedSchedule: Schedule | null;
}

export function ScheduleAutocomplete({
  schedules,
  isLoading,
  onSelect,
  selectedSchedule,
}: ScheduleAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Sincronizar valor do input com agendamento selecionado
  useEffect(() => {
    if (selectedSchedule) {
      setSearchValue(selectedSchedule.plate || selectedSchedule.vin);
    }
  }, [selectedSchedule]);

  // Debounce para abrir o popover apenas após parar de digitar
  useEffect(() => {
    if (searchValue.trim().length > 0 && !selectedSchedule) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [searchValue, selectedSchedule]);

const filteredSchedules = useMemo(() => {
  if (!searchValue.trim()) return [];

  const search = searchValue.toLowerCase().trim();

  return schedules
    .filter(
      (schedule) => schedule.serviceType !== "removal"
    )
    .filter(
      (schedule) =>
        schedule.vin.toLowerCase().includes(search) ||
        schedule.plate?.toLowerCase().includes(search) ||
        schedule.client.name.toLowerCase().includes(search)
    );
}, [schedules, searchValue]);

  const handleSelect = (schedule: Schedule) => {
    onSelect(schedule);
    setSearchValue(schedule.plate || schedule.vin);
    setOpen(false);
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    if (!value.trim()) {
      onSelect(null);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onSelect(null);
    setOpen(false);
  };

  const handleInputFocus = () => {
    if (searchValue.trim().length > 0 && !selectedSchedule) {
      setOpen(true);
    }
  };



  return (
    <div className="flex-1 w-full">
      <Label
        htmlFor="search"
        className="text-sm font-medium text-foreground mb-2 block"
      >
        Buscar agendamento
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            {isLoading ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              id="search"
              type="text"
              placeholder="Digite o chassi, placa ou nome do cliente"
              className={cn(
                "pl-9 pr-9 h-11 transition-all",
                selectedSchedule && "border-primary bg-primary/5"
              )}
              value={searchValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              disabled={isLoading}
            />
            {searchValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpar</span>
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              <CommandEmpty className="py-6 text-center text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum agendamento encontrado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tente buscar por chassi, placa ou nome do cliente
                  </p>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredSchedules.map((schedule) => (
                  <CommandItem
                    key={schedule._id}
                    value={schedule._id}
                    onSelect={() => handleSelect(schedule)}
                    className="cursor-pointer px-4 py-3 aria-selected:bg-accent"
                  >
                    <div className="flex flex-col gap-2 w-full">
                      {/* Linha 1: Placa/Chassi e Modelo */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {schedule.plate || "Sem placa"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-sm text-muted-foreground font-mono">
                            {schedule.vin}
                          </span>
                        </div>
                        {schedule.model && (
                          <span className="text-xs text-muted-foreground">
                            {schedule.model}
                          </span>
                        )}
                      </div>

                      {/* Cliente e Tipo de Serviço */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{schedule.client.name}</span>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Feedback de agendamento selecionado */}
      {selectedSchedule && (
        <div className="mt-2 flex items-center gap-2 text-xs text-primary">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-medium">Agendamento selecionado</span>
        </div>
      )}
    </div>
  );
}