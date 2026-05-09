import type { AppConfig, CalendarDayGroup } from "../../shared/types";
import { Rows3 } from "lucide-react";
import { eventDotClass } from "../lib/colorClasses";
import { formatCompactDate, formatEventTimeLabel } from "../lib/formatters";
import { isUsFederalHoliday, isWeekendDay } from "../lib/usHolidays";
import { SectionFrame } from "./SectionFrame";

interface UpcomingCalendarProps {
  config: AppConfig;
  groups: CalendarDayGroup[];
  maxPerDay: number;
  error: string | null;
}

export function UpcomingCalendar({
  config,
  groups,
  maxPerDay,
  error,
}: UpcomingCalendarProps) {
  const messageClassName =
    "px-[0.1rem] py-[0.2rem] text-[0.96rem] text-text-muted";

  return (
    <SectionFrame
      eyebrow="Upcoming"
      title="Next 7 days"
      icon={<Rows3 aria-hidden="true" strokeWidth={1.8} />}
    >
      <div className="grid min-h-0 content-start gap-[0.5rem]">
        {error ? <div className={messageClassName}>{error}</div> : null}
        {!error &&
          groups.map((group) => {
            const visibleEvents = group.events.slice(0, maxPerDay);
            const hiddenCount = Math.max(
              group.events.length - visibleEvents.length,
              0,
            );

            return (
              <div
                className="grid items-start gap-[0.8rem] rounded-[14px] border border-card-border-soft bg-card-bg px-[0.85rem] py-[0.55rem] [grid-template-columns:6rem_minmax(0,1fr)] max-[900px]:grid-cols-1 max-[900px]:gap-[0.4rem]"
                key={group.date}
              >
                <div
                  className={`text-[0.95rem] font-semibold ${
                    isWeekendDay(group.date) || isUsFederalHoliday(group.date)
                      ? "text-text-weekend"
                      : "text-text-date"
                  }`}
                >
                  {formatCompactDate(
                    group.date,
                    config.locale,
                    config.primaryTimezone,
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-[2.5rem] gap-y-[0.4rem] max-[900px]:grid-cols-1">
                  {visibleEvents.length === 0 ? (
                    <span className="col-span-full text-[0.9rem] text-text-muted">
                      No events
                    </span>
                  ) : null}
                  {visibleEvents.map((event) => (
                    <div
                      className="grid min-w-0 items-center gap-[0.5rem] [grid-template-columns:auto_4.5rem_minmax(0,1fr)]"
                      key={event.id}
                    >
                      <span className={`size-[0.55rem] rounded-full ${eventDotClass(event.title)}`} />
                      <span className="text-[0.85rem] text-text-muted [font-variant-numeric:tabular-nums]">
                        {event.isAllDay
                          ? "All day"
                          : formatEventTimeLabel(
                              event.start,
                              config.locale,
                              config.primaryTimezone,
                            )}
                      </span>
                      <span className="truncate text-[0.95rem]">
                        {event.title}
                      </span>
                    </div>
                  ))}
                  {hiddenCount > 0 ? (
                    <span className="col-span-full text-[0.88rem] text-text-link">
                      +{hiddenCount} more
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
      </div>
    </SectionFrame>
  );
}
