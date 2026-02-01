import { useState, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { CalendarSearch, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportsDateRangeFilterProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}


const getPresets = (today: Date) => [
  {
    label: "Hoje",
    range: { from: today, to: today },
  },
  {
    label: "Últimos 7 dias",
    range: { from: addDays(today, -6), to: today },
  },
  {
    label: "Últimos 30 dias",
    range: { from: addDays(today, -29), to: today },
  },
  {
    label: "Mês atual",
    range: {
      from: startOfMonth(today),
      to: endOfMonth(today),
    },
  },
];

export function ReportsDateRangeFilter({
  value,
  onChange,
}: ReportsDateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(value);

  const today = new Date();
  const presets = getPresets(today);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      setInternalRange(value);
    }
    setOpen(isOpen);
  }, [value]);

  // Handler para seleção no calendário
  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    setInternalRange(range);
  }, []);

  // Handler para presets - fecha o popover imediatamente
  const handlePresetSelect = useCallback((range: DateRange) => {
    onChange(range);
    setOpen(false);
  }, [onChange]);

  // Aplica o filtro e fecha o popover
  const handleApply = useCallback(() => {
    onChange(internalRange);
    setOpen(false);
  }, [internalRange, onChange]);

  // Limpa o filtro
  const handleClear = useCallback(() => {
    setInternalRange(undefined);
    onChange(undefined);
    setOpen(false);
  }, [onChange]);

  // Formata o label do botão baseado no range selecionado
  const getButtonLabel = () => {
    if (!value?.from) return null;

    if (value.to && value.from.getTime() !== value.to.getTime()) {
      return `${format(value.from, "dd/MM/yy")} - ${format(value.to, "dd/MM/yy")}`;
    }
    return format(value.from, "dd/MM/yyyy");
  };

  const buttonLabel = getButtonLabel();
  const hasSelection = internalRange?.from != null;
  const isRangeComplete = internalRange?.from != null && internalRange?.to != null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant={value?.from ? "default" : "outline"}
          className="gap-2"
        >
          <CalendarSearch className="h-4 w-4" />
          {buttonLabel && <span className="text-xs">{buttonLabel}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="p-3 w-auto">
        <div className="flex gap-4">

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground mb-2">
              Atalhos
            </span>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handlePresetSelect(preset.range)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" />

          {/* Calendar */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground mb-2">
              Selecione um intervalo
            </span>
            <Calendar
              mode="range"
              selected={internalRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              locale={ptBR}
            />

            {/* Feedback visual do range selecionado */}
            {internalRange?.from && (
              <div className="mt-2 text-xs text-muted-foreground text-center">
                {internalRange.to ? (
                  <span>
                    {format(internalRange.from, "dd/MM/yyyy")} até {format(internalRange.to, "dd/MM/yyyy")}
                  </span>
                ) : (
                  <span className="text-amber-600">
                    Selecione a data final
                  </span>
                )}
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!value?.from && !internalRange?.from}
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!hasSelection}
              >
                {isRangeComplete ? "Aplicar" : "Aplicar data única"}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}