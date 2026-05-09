import type { AppConfig, CalendarDayGroup, CalendarEvent } from "../../shared/types";
import { CalendarDays } from "lucide-react";
import { formatEventTimeRange, formatLongDate } from "../lib/formatters";
import { EventCategoryIcon } from "./EventCategoryIcon";
import { SectionFrame } from "./SectionFrame";

interface CalendarEventListProps {
  config: AppConfig;
  day: CalendarDayGroup | null;
  events: CalendarEvent[];
  hiddenCount: number;
  error: string | null;
}

export function CalendarEventList({ config, day, events, hiddenCount, error }: CalendarEventListProps) {
  const title = day ? formatLongDate(day.date, config.locale, config.primaryTimezone) : "Today";
  const messageClassName =
    "px-[0.1rem] py-[0.2rem] text-[0.96rem] text-[rgba(191,203,227,0.78)]";

  return (
    <SectionFrame
      eyebrow="Today"
      title={title}
      icon={<CalendarDays aria-hidden="true" strokeWidth={1.8} />}
    >
      <div className="grid min-h-0 content-start gap-[0.6rem]">
        {error ? <div className={messageClassName}>{error}</div> : null}
        {!error && events.length === 0 ? (
          <div className={messageClassName}>No events scheduled today.</div>
        ) : null}
        {!error
          ? events.map((event) => (
              <article
                className="grid items-center gap-[0.85rem] rounded-[18px] border border-[rgba(121,154,214,0.12)] bg-[rgba(7,17,31,0.34)] px-[1rem] py-[0.85rem] [grid-template-columns:8.8rem_minmax(0,1fr)_2.8rem] max-[1500px]:px-[0.85rem] max-[1500px]:py-[0.75rem] max-[1500px]:[grid-template-columns:7.4rem_minmax(0,1fr)_2.2rem] max-[900px]:grid-cols-1 max-[900px]:gap-[0.55rem] [@media(max-height:980px)]:px-[0.85rem] [@media(max-height:980px)]:py-[0.75rem] [@media(max-height:980px)]:[grid-template-columns:7.4rem_minmax(0,1fr)_2.2rem]"
                key={event.id}
              >
                <div className="text-[1.05rem] leading-[1.35] text-[rgba(226,232,240,0.9)] max-[900px]:text-[0.95rem]">
                  {formatEventTimeRange(event, config.locale, config.primaryTimezone)}
                </div>
                <div className="flex min-w-0 items-center gap-[0.8rem]">
                  <div
                    className="size-[0.7rem] shrink-0 rounded-full"
                    style={{ backgroundColor: colorFromText(event.title) }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[1.2rem] font-medium">
                      {event.title}
                    </div>
                    <div className="text-[0.96rem] text-[rgba(191,203,227,0.78)]">
                      {event.location || (event.isAllDay ? "All day" : "Scheduled")}
                    </div>
                  </div>
                </div>
                <div className="size-[2rem] text-[rgba(186,205,238,0.88)] max-[900px]:hidden">
                  <EventCategoryIcon title={event.title} />
                </div>
              </article>
            ))
          : null}
        {hiddenCount > 0 ? (
          <div className={messageClassName}>+{hiddenCount} more events today</div>
        ) : null}
      </div>
    </SectionFrame>
  );
}

function colorFromText(value: string): string {
  const palette = ["#3b82f6", "#84cc16", "#f97316", "#a855f7", "#14b8a6", "#f43f5e", "#8b5cf6"];
  const index = [...value].reduce((total, char) => total + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}
