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
  isWeekend: boolean;
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function MiniMonthCalendars({ config }: MiniMonthCalendarsProps) {
  const months = buildMonthModels(config, new Date());

  return (
    <div className="grid gap-[0.7rem] pt-[0.2rem] [grid-template-columns:repeat(3,minmax(0,1fr))] max-[900px]:grid-cols-1">
      {months.map((month) => (
        <section
          className="grid gap-[0.55rem] rounded-[18px] border border-[rgba(121,154,214,0.12)] bg-[rgba(7,17,31,0.22)] px-[0.9rem] py-[0.8rem]"
          key={month.key}
        >
          <header className="text-center text-[0.95rem] font-bold uppercase text-board-text [letter-spacing:0.04em]">
            {month.label}
          </header>
          <div className="grid grid-cols-7 gap-[0.2rem]">
            {WEEKDAY_LABELS.map((label, index) => (
              <span
                className={[
                  "grid min-h-[1.55rem] place-items-center text-[0.72rem] font-semibold [font-variant-numeric:tabular-nums]",
                  index >= 5 ? "text-[#ff7b7b]" : "text-[rgba(191,203,227,0.72)]",
                ].join(" ")}
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-[0.2rem]">
            {month.weeks.flat().map((cell, index) => (
              <span
                className={[
                  "grid min-h-[1.55rem] place-items-center rounded-full text-[0.86rem] [font-variant-numeric:tabular-nums]",
                  cell?.isCurrentMonth
                    ? ""
                    : "text-[rgba(191,203,227,0.38)]",
                  cell?.isWeekend
                    ? cell?.isCurrentMonth
                      ? "text-[#ff7b7b]"
                      : "text-[rgba(255,123,123,0.45)]"
                    : cell?.isCurrentMonth
                      ? "text-board-text"
                      : "",
                  cell?.isToday
                    ? "bg-[rgba(96,165,250,0.2)] shadow-[inset_0_0_0_1px_rgba(96,165,250,0.7)]"
                    : "",
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
  const monthStartWeekday = toMondayFirstWeekday(
    new Date(Date.UTC(year, month - 1, 1)).getUTCDay(),
  );
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prevMonth = shiftMonth(year, month, -1);
  const daysInPrevMonth = new Date(Date.UTC(prevMonth.year, prevMonth.month, 0)).getUTCDate();

  const cells: DayCell[] = [];

  for (let index = monthStartWeekday - 1; index >= 0; index -= 1) {
    cells.push({
      date: daysInPrevMonth - index,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: monthStartWeekday - index >= 5,
    });
  }

  for (let date = 1; date <= daysInMonth; date += 1) {
    cells.push({
      date,
      isCurrentMonth: true,
      isToday: today.year === year && today.month === month && today.day === date,
      isWeekend: toMondayFirstWeekday(
        new Date(Date.UTC(year, month - 1, date)).getUTCDay(),
      ) >= 5,
    });
  }

  const trailingDays = (7 - (cells.length % 7)) % 7;
  for (let date = 1; date <= trailingDays; date += 1) {
    cells.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: toMondayFirstWeekday(
        new Date(Date.UTC(year, month, date)).getUTCDay(),
      ) >= 5,
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

function toMondayFirstWeekday(utcDay: number): number {
  return (utcDay + 6) % 7;
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
