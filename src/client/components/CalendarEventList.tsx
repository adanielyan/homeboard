import { useEffect, useState } from "preact/hooks";
import type {
  AppConfig,
  CalendarDayGroup,
  CalendarEvent,
} from "../../shared/types";
import { CalendarDays } from "lucide-react";
import { eventDotClass } from "../lib/colorClasses";
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

const SOON_WINDOW_MS = 15 * 60 * 1000;
const TICK_INTERVAL_MS = 5 * 1000;

type EventState = "idle" | "soon" | "ongoing";

function getEventState(event: CalendarEvent, nowMs: number): EventState {
  if (event.isAllDay) {
    return "idle";
  }
  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();
  if (nowMs >= start && nowMs < end) {
    return "ongoing";
  }
  if (start - nowMs > 0 && start - nowMs <= SOON_WINDOW_MS) {
    return "soon";
  }
  return "idle";
}

export function CalendarEventList({
  config,
  day,
  events,
  hiddenCount,
  error,
}: CalendarEventListProps) {
  const title = day
    ? formatLongDate(day.date, config.locale, config.primaryTimezone)
    : "Today";
  const messageClassName =
    "px-[0.1rem] py-[0.2rem] text-[0.96rem] text-text-muted";

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), TICK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

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
          ? events.map((event) => {
              const state = getEventState(event, nowMs);
              const stateClassName =
                state === "ongoing"
                  ? "animate-event-ongoing bg-card-bg-ongoing"
                  : state === "soon"
                    ? "animate-event-soon bg-card-bg-strong"
                    : "bg-card-bg-strong";
              return (
                <article
                  className={`relative overflow-hidden grid items-center gap-[1rem] rounded-[18px] border border-card-border px-[1.15rem] py-[1.1rem] [grid-template-columns:14rem_minmax(0,1fr)_2.6rem] max-[1500px]:px-[1rem] max-[1500px]:py-[0.95rem] max-[1500px]:[grid-template-columns:12.5rem_minmax(0,1fr)_2.4rem] max-[900px]:grid-cols-1 max-[900px]:gap-[0.7rem] [@media(max-height:980px)]:px-[1rem] [@media(max-height:980px)]:py-[0.95rem] [@media(max-height:980px)]:[grid-template-columns:12.5rem_minmax(0,1fr)_2.4rem] ${stateClassName}`}
                  key={event.id}
                >
                  {state === "ongoing" ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-1/2 animate-event-shine bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.015)_25%,rgba(255,255,255,0.055)_50%,rgba(255,255,255,0.015)_75%,transparent_100%)] blur-2xl"
                    />
                  ) : null}
                  <div className="whitespace-nowrap text-right text-[1.5rem] leading-[1.3] text-text-strong max-[900px]:text-[1.1rem] max-[900px]:text-left">
                    {formatEventTimeRange(
                      event,
                      config.locale,
                      config.primaryTimezone,
                    )}
                  </div>
                  <div className="flex min-w-0 items-center gap-[0.9rem]">
                    <div
                      className={`size-[0.8rem] shrink-0 rounded-full ${eventDotClass(event.title)}`}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[2rem] font-bold leading-[1.25]">
                        {event.title}
                      </div>
                      {event.location ? (
                        <div className="text-[1.1rem] text-text-muted">
                          {event.location}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="size-[2.4rem] text-text-info max-[900px]:hidden">
                    <EventCategoryIcon title={event.title} />
                  </div>
                </article>
              );
            })
          : null}
        {hiddenCount > 0 ? (
          <div className={messageClassName}>
            +{hiddenCount} more events today
          </div>
        ) : null}
      </div>
    </SectionFrame>
  );
}
