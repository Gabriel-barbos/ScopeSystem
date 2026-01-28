import { useState, useMemo, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

  // Debounce para abrir o popover apenas após parar de digitar
  useEffect(() => {
    if (searchValue.trim().length > 0) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 300); // 300ms de delay

      return () => clearTimeout(timer);
    }
  }, [searchValue]);

  // Filtrar agendamentos baseado na busca (chassi ou placa)
  const filteredSchedules = useMemo(() => {
    if (!searchValue.trim()) return [];

    const search = searchValue.toLowerCase().trim();
    return schedules.filter(
      (schedule) =>
        schedule.vin.toLowerCase().includes(search) ||
        schedule.plate?.toLowerCase().includes(search)
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

  const handleInputFocus = () => {
    if (searchValue.trim().length > 0) {
      setOpen(true);
    }
  };

  return (
    <div className="flex-1 max-w-sm">
      <Label htmlFor="search" className="text-sm text-muted-foreground mb-2 block">
        Buscar veículo
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
              placeholder="Digite o chassi ou a placa"
              className="pl-9 h-10"
              value={searchValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              disabled={isLoading}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Command shouldFilter={false}>
            <CommandList>
              <CommandEmpty>Nenhum agendamento encontrado.</CommandEmpty>
              <CommandGroup>
                {filteredSchedules.map((schedule) => (
                  <CommandItem
                    key={schedule._id}
                    value={schedule._id}
                    onSelect={() => handleSelect(schedule)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {schedule.plate || "Sem placa"} - {schedule.vin}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {schedule.client.name} • {schedule.serviceType}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}