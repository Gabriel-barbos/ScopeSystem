import { useCallback, useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { addDays, endOfMonth, format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2PeriodProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

const PRESETS = (today: Date) => [
  { label: "Hoje", range: { from: today, to: today } },
  { label: "Últimos 7d", range: { from: addDays(today, -6), to: today } },
  { label: "Últimos 30d", range: { from: addDays(today, -29), to: today } },
  { label: "Mês atual", range: { from: startOfMonth(today), to: endOfMonth(today) } },
];

export function Step2Period({ value, onChange }: Step2PeriodProps) {
  const today = new Date();
  const presets = PRESETS(today);
  const [internal, setInternal] = useState<DateRange | undefined>(value);

  const handleCalendar = useCallback((range: DateRange | undefined) => {
    setInternal(range);
    onChange(range);
  }, [onChange]);

  const handlePreset = useCallback((range: DateRange) => {
    setInternal(range);
    onChange(range);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setInternal(undefined);
    onChange(undefined);
  }, [onChange]);

  const activePreset = presets.findIndex(
    (p) =>
      p.range.from.toDateString() === internal?.from?.toDateString() &&
      p.range.to.toDateString() === internal?.to?.toDateString()
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Período</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Selecione um intervalo ou use os atalhos (opcional)
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-xl border bg-card p-3">
          <div className="mb-3 flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Atalhos</p>
              <p className="text-xs text-muted-foreground">Escolha rápido</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {presets.map((p, i) => (
              <Button
                key={p.label}
                variant={activePreset === i ? "default" : "outline"}
                size="sm"
                className={cn("h-9 justify-start text-xs", activePreset === i && "shadow-sm")}
                onClick={() => handlePreset(p.range)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className="mt-3 rounded-lg border bg-background/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Seleção atual
            </p>
            <div className="mt-2 min-h-10 text-sm">
              {internal?.from ? (
                internal.to ? (
                  <p className="font-medium text-primary">
                    {format(internal.from, "dd/MM/yyyy")} até {format(internal.to, "dd/MM/yyyy")}
                  </p>
                ) : (
                  <p className="font-medium text-amber-500">Selecione a data final</p>
                )
              ) : (
                <p className="text-muted-foreground">Todos os dados disponíveis</p>
              )}
            </div>
            {internal?.from && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-8 w-full justify-start gap-2 px-2 text-xs text-muted-foreground"
                onClick={handleClear}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar período
              </Button>
            )}
          </div>
        </aside>

        <div className="min-w-0 rounded-xl border bg-card p-3">
          <div className="overflow-x-auto">
            <div className="flex min-w-[610px] justify-center">
              <Calendar
                mode="range"
                selected={internal}
                onSelect={handleCalendar}
                numberOfMonths={2}
                locale={ptBR}
                compact
                className="p-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
