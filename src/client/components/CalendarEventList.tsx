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

  return (
    <SectionFrame
      eyebrow="Today"
      title={title}
      icon={<CalendarDays aria-hidden="true" strokeWidth={1.8} />}
    >
      <div className="event-list">
        {error ? <div className="state-message">{error}</div> : null}
        {!error && events.length === 0 ? <div className="state-message">No events scheduled today.</div> : null}
        {!error
          ? events.map((event) => (
              <article className="event-card" key={event.id}>
                <div className="event-time">{formatEventTimeRange(event, config.locale, config.primaryTimezone)}</div>
                <div className="event-body">
                  <div className="event-dot" style={{ backgroundColor: colorFromText(event.title) }} />
                  <div className="event-copy">
                    <div className="event-title">{event.title}</div>
                    <div className="event-meta">{event.location || (event.isAllDay ? "All day" : "Scheduled")}</div>
                  </div>
                </div>
                <div className="event-icon-wrap">
                  <EventCategoryIcon title={event.title} />
                </div>
              </article>
            ))
          : null}
        {hiddenCount > 0 ? <div className="overflow-indicator">+{hiddenCount} more events today</div> : null}
      </div>
    </SectionFrame>
  );
}

function colorFromText(value: string): string {
  const palette = ["#3b82f6", "#84cc16", "#f97316", "#a855f7", "#14b8a6", "#f43f5e", "#8b5cf6"];
  const index = [...value].reduce((total, char) => total + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}
