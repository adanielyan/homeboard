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
  return (
    <SectionFrame
      eyebrow="Upcoming"
      title="Next 7 days"
      icon={<Rows3 aria-hidden="true" strokeWidth={1.8} />}
    >
      <div className="upcoming-list">
        {error ? <div className="state-message">{error}</div> : null}
        {!error &&
          groups.map((group) => {
            const visibleEvents = group.events.slice(0, maxPerDay);
            const hiddenCount = Math.max(group.events.length - visibleEvents.length, 0);

            return (
              <div className="upcoming-row" key={group.date}>
                <div className="upcoming-date">{formatCompactDate(group.date, config.locale, config.primaryTimezone)}</div>
                <div className="upcoming-events">
                  {visibleEvents.length === 0 ? <span className="upcoming-empty">No events</span> : null}
                  {visibleEvents.map((event) => (
                    <div className="upcoming-event" key={event.id}>
                      <span className="upcoming-dot" />
                      <span className="upcoming-title">{event.title}</span>
                      <span className="upcoming-time">
                        {event.isAllDay ? "All day" : formatEventTimeLabel(event.start, config.locale, config.primaryTimezone)}
                      </span>
                    </div>
                  ))}
                  {hiddenCount > 0 ? <span className="upcoming-more">+{hiddenCount} more</span> : null}
                </div>
              </div>
            );
          })}
      </div>
    </SectionFrame>
  );
}
