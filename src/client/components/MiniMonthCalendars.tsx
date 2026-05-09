import type { AppConfig } from "../../shared/types";

interface MiniMonthCalendarsProps {
  config: AppConfig;
}

interface MonthModel {
  key: string;
  label: string;
  weeks: Array<Array<DayCell | null>>;
}

interface DayCell {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function MiniMonthCalendars({ config }: MiniMonthCalendarsProps) {
  const months = buildMonthModels(config, new Date());

  return (
    <div className="month-strip">
      {months.map((month) => (
        <section className="month-card" key={month.key}>
          <header className="month-header">{month.label}</header>
          <div className="month-weekdays">
            {WEEKDAY_LABELS.map((label) => (
              <span className="month-weekday" key={label}>
                {label}
              </span>
            ))}
          </div>
          <div className="month-grid">
            {month.weeks.flat().map((cell, index) => (
              <span
                className={[
                  "month-day",
                  cell?.isCurrentMonth ? "" : "month-day-muted",
                  cell?.isToday ? "month-day-today" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={`${month.key}-${index}`}
              >
                {cell?.date ?? ""}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function buildMonthModels(config: AppConfig, now: Date): MonthModel[] {
  const today = getZonedDateParts(now, config.primaryTimezone);

  return [0, 1, 2].map((offset) => {
    const monthYear = shiftMonth(today.year, today.month, offset);
    return buildMonthModel(monthYear.year, monthYear.month, today, config.locale);
  });
}

function buildMonthModel(
  year: number,
  month: number,
  today: { year: number; month: number; day: number },
  locale: string
): MonthModel {
  const monthStartWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prevMonth = shiftMonth(year, month, -1);
  const daysInPrevMonth = new Date(Date.UTC(prevMonth.year, prevMonth.month, 0)).getUTCDate();

  const cells: DayCell[] = [];

  for (let index = monthStartWeekday - 1; index >= 0; index -= 1) {
    cells.push({
      date: daysInPrevMonth - index,
      isCurrentMonth: false,
      isToday: false
    });
  }

  for (let date = 1; date <= daysInMonth; date += 1) {
    cells.push({
      date,
      isCurrentMonth: true,
      isToday: today.year === year && today.month === month && today.day === date
    });
  }

  const trailingDays = (7 - (cells.length % 7)) % 7;
  for (let date = 1; date <= trailingDays; date += 1) {
    cells.push({
      date,
      isCurrentMonth: false,
      isToday: false
    });
  }

  const weeks: Array<Array<DayCell | null>> = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return {
    key: `${year}-${month}`,
    label: new Intl.DateTimeFormat(locale, {
      month: "long",
      timeZone: "UTC"
    }).format(new Date(Date.UTC(year, month - 1, 1, 12))),
    weeks
  };
}

function shiftMonth(year: number, month: number, offset: number): { year: number; month: number } {
  const normalized = new Date(Date.UTC(year, month - 1 + offset, 1));
  return {
    year: normalized.getUTCFullYear(),
    month: normalized.getUTCMonth() + 1
  };
}

function getZonedDateParts(value: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone
  }).formatToParts(value);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value)
  };
}
