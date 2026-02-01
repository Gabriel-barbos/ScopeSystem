import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";

export type PeriodType = "today" | "yesterday" | "week" | "month" | "year";

export function getDateRangeFromPeriod(period: PeriodType): { startDate: Date; endDate: Date } {
  const now = new Date();

  const periodMap: Record<PeriodType, () => { startDate: Date; endDate: Date }> = {
    today: () => ({
      startDate: startOfDay(now),
      endDate: endOfDay(now),
    }),
    yesterday: () => {
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
      };
    },
    week: () => ({
      startDate: startOfWeek(now, { weekStartsOn: 0 }),
      endDate: endOfWeek(now, { weekStartsOn: 0 }),
    }),
    month: () => ({
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
    }),
    year: () => ({
      startDate: startOfYear(now),
      endDate: endOfYear(now),
    }),
  };

  return periodMap[period]?.() ?? periodMap.today();
}