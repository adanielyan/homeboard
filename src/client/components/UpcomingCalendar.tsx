import type { AppConfig, CalendarDayGroup } from "../../shared/types";
import { Rows3 } from "lucide-react";
import { formatCompactDate, formatEventTimeLabel } from "../lib/formatters";
import { SectionFrame } from "./SectionFrame";

interface UpcomingCalendarProps {
  config: AppConfig;
  groups: CalendarDayGroup[];
  maxPerDay: number;
  error: string | null;
}

export function UpcomingCalendar({ config, groups, maxPerDay, error }: UpcomingCalendarProps) {
  const messageClassName =
    "px-[0.1rem] py-[0.2rem] text-[0.96rem] text-[rgba(191,203,227,0.78)]";

  return (
    <SectionFrame
      eyebrow="Upcoming"
      title="Next 7 days"
      icon={<Rows3 aria-hidden="true" strokeWidth={1.8} />}
    >
      <div className="grid min-h-0 content-start gap-[0.6rem]">
        {error ? <div className={messageClassName}>{error}</div> : null}
        {!error &&
          groups.map((group) => {
            const visibleEvents = group.events.slice(0, maxPerDay);
            const hiddenCount = Math.max(group.events.length - visibleEvents.length, 0);

            return (
              <div
                className="grid gap-[0.9rem] rounded-[16px] border border-[rgba(121,154,214,0.1)] bg-[rgba(7,17,31,0.28)] px-[0.9rem] py-[0.8rem] [grid-template-columns:7rem_minmax(0,1fr)] max-[900px]:grid-cols-1 max-[900px]:gap-[0.55rem]"
                key={group.date}
              >
                <div className="font-semibold text-[#dbeafe]">
                  {formatCompactDate(group.date, config.locale, config.primaryTimezone)}
                </div>
                <div className="grid gap-[0.45rem]">
                  {visibleEvents.length === 0 ? (
                    <span className="text-[0.96rem] text-[rgba(191,203,227,0.78)]">
                      No events
                    </span>
                  ) : null}
                  {visibleEvents.map((event) => (
                    <div
                      className="grid items-center gap-[0.65rem] [grid-template-columns:auto_minmax(0,1fr)_auto] max-[900px]:[grid-template-columns:auto_minmax(0,1fr)]"
                      key={event.id}
                    >
                      <span className="size-[0.7rem] rounded-full bg-[#60a5fa]" />
                      <span className="truncate">{event.title}</span>
                      <span className="text-[0.96rem] text-[rgba(191,203,227,0.78)] max-[900px]:col-start-2">
                        {event.isAllDay ? "All day" : formatEventTimeLabel(event.start, config.locale, config.primaryTimezone)}
                      </span>
                    </div>
                  ))}
                  {hiddenCount > 0 ? (
                    <span className="text-[0.96rem] text-[#60a5fa]">
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
