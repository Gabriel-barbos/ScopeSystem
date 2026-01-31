import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { CalendarSearch } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, startOfMonth, endOfMonth } from "date-fns";

interface ReportsDateRangeFilterProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}

export function ReportsDateRangeFilter({
  value,
  onChange,
}: ReportsDateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const today = new Date();

  const presets = [
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <CalendarSearch className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="p-3 w-auto">
        <div className="flex gap-4">
          {/* Presets */}
          <div className="flex flex-col gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange(preset.range);
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" />

          {/* Calendar */}
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange(range);
            }}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
