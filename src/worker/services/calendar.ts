import ICAL from "ical.js";
import type {
  CalendarDayGroup,
  CalendarEvent,
  CalendarEventsResponse,
} from "../../shared/types";
import { HttpError } from "../utils/http";

const RECURRENCE_LIMIT = 365;

export interface CalendarWindow {
  startMs: number;
  endMs: number;
  timeMin: string;
  timeMax: string;
}

export async function getCalendarEvents(env: Env): Promise<CalendarEventsResponse> {
  const url = env.CALENDAR_ICAL_URL;
  if (!url) {
    throw new HttpError(
      500,
      "calendar_misconfigured",
      "CALENDAR_ICAL_URL is not set.",
    );
  }

  const timeZone = env.PRIMARY_TIMEZONE;
  const locale = env.DISPLAY_LOCALE || "en-US";

  const response = await fetch(url, { cache: "no-store" } as RequestInit);
  if (!response.ok) {
    throw new HttpError(
      502,
      "calendar_upstream_error",
      "Unable to load calendar feed.",
    );
  }

  const ics = await response.text();
  const window = createCalendarWindow(timeZone);
  const events = parseIcsEvents(ics, window);
  return normalizeCalendarResponse(events, timeZone, locale);
}

export function createCalendarWindow(timeZone: string, now = new Date()): CalendarWindow {
  const startOfDay = zonedDayToUtc(timeZone, formatZonedDate(now, timeZone));
  const endOfWindow = new Date(startOfDay.getTime() + 8 * 24 * 60 * 60 * 1000);
  return {
    startMs: startOfDay.getTime(),
    endMs: endOfWindow.getTime(),
    timeMin: startOfDay.toISOString(),
    timeMax: endOfWindow.toISOString(),
  };
}

export function parseIcsEvents(
  ics: string,
  window: { startMs: number; endMs: number },
): CalendarEvent[] {
  const jcal = ICAL.parse(ics);
  const vcalendar = new ICAL.Component(jcal);

  for (const vtimezone of vcalendar.getAllSubcomponents("vtimezone")) {
    const tzid = vtimezone.getFirstPropertyValue("tzid");
    if (typeof tzid === "string" && !ICAL.TimezoneService.has(tzid)) {
      ICAL.TimezoneService.register(vtimezone);
    }
  }

  const grouped = new Map<
    string,
    { master: ICAL.Component | null; exceptions: ICAL.Component[] }
  >();

  for (const vevent of vcalendar.getAllSubcomponents("vevent")) {
    const event = new ICAL.Event(vevent);
    const uid = event.uid;
    if (!grouped.has(uid)) {
      grouped.set(uid, { master: null, exceptions: [] });
    }
    const entry = grouped.get(uid)!;
    if (event.isRecurrenceException()) {
      entry.exceptions.push(vevent);
    } else {
      entry.master = vevent;
    }
  }

  const out: CalendarEvent[] = [];
  for (const { master, exceptions } of grouped.values()) {
    if (!master) {
      continue;
    }
    const event = new ICAL.Event(master);
    for (const ex of exceptions) {
      event.relateException(ex);
    }

    if (event.isRecurring()) {
      const iter = event.iterator();
      let count = 0;
      let next = iter.next();
      while (next && count < RECURRENCE_LIMIT) {
        count += 1;
        if (next.toJSDate().getTime() >= window.endMs) {
          break;
        }
        const details = event.getOccurrenceDetails(next);
        const occEnd = details.endDate.toJSDate().getTime();
        if (occEnd > window.startMs) {
          out.push(
            buildCalendarEvent(
              details.item.uid,
              details.startDate,
              details.endDate,
              details.item,
            ),
          );
        }
        next = iter.next();
      }
    } else {
      const occStart = event.startDate.toJSDate().getTime();
      const occEnd = event.endDate.toJSDate().getTime();
      if (occEnd > window.startMs && occStart < window.endMs) {
        out.push(
          buildCalendarEvent(event.uid, event.startDate, event.endDate, event),
        );
      }
    }
  }

  return out;
}

function buildCalendarEvent(
  uid: string,
  start: ICAL.Time,
  end: ICAL.Time,
  source: ICAL.Event,
): CalendarEvent {
  const isAllDay = start.isDate;
  const title = (source.summary || "").trim() || "Untitled event";
  const description = source.description || undefined;
  const location = source.location || undefined;

  if (isAllDay) {
    const startDateString = formatIcalDateOnly(start);
    const exclusiveEnd = formatIcalDateOnly(end);
    const inclusiveEnd = shiftDate(exclusiveEnd, -1) || startDateString;
    return {
      id: `${uid}@${startDateString}`,
      title,
      start: `${startDateString}T00:00:00.000Z`,
      end: `${inclusiveEnd}T23:59:59.999Z`,
      isAllDay: true,
      description,
      location,
    };
  }

  const startIso = start.toJSDate().toISOString();
  return {
    id: `${uid}@${startIso}`,
    title,
    start: startIso,
    end: end.toJSDate().toISOString(),
    isAllDay: false,
    description,
    location,
  };
}

function formatIcalDateOnly(time: ICAL.Time): string {
  return `${String(time.year).padStart(4, "0")}-${String(time.month).padStart(2, "0")}-${String(time.day).padStart(2, "0")}`;
}

export function normalizeCalendarResponse(
  events: CalendarEvent[],
  timeZone: string,
  locale: string,
): CalendarEventsResponse {
  const todayDate = formatZonedDate(new Date(), timeZone);
  const groups = new Map<string, CalendarEvent[]>();
  for (let offset = 0; offset <= 7; offset += 1) {
    groups.set(shiftDate(todayDate, offset), []);
  }

  const nowMs = Date.now();
  for (const event of events) {
    const key = event.isAllDay
      ? event.start.slice(0, 10)
      : formatZonedDate(new Date(event.start), timeZone);
    if (!groups.has(key)) {
      continue;
    }
    if (key === todayDate && !event.isAllDay && new Date(event.end).getTime() < nowMs) {
      continue;
    }
    groups.get(key)!.push(event);
  }

  const orderedDates = [...groups.keys()].sort();
  const dayGroups: CalendarDayGroup[] = orderedDates.map((date) => ({
    date,
    events: (groups.get(date) || []).sort(compareEvents(locale, timeZone)),
  }));

  return {
    today: dayGroups[0] || { date: todayDate, events: [] },
    upcomingDays: dayGroups.slice(1),
  };
}

function compareEvents(locale: string, timeZone: string) {
  return (left: CalendarEvent, right: CalendarEvent): number => {
    if (left.isAllDay !== right.isAllDay) {
      return left.isAllDay ? -1 : 1;
    }
    const leftKey = left.isAllDay
      ? left.start
      : formatEventSortKey(left.start, locale, timeZone);
    const rightKey = right.isAllDay
      ? right.start
      : formatEventSortKey(right.start, locale, timeZone);
    return leftKey.localeCompare(rightKey);
  };
}

function formatEventSortKey(value: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  }).format(new Date(value));
}

export function formatZonedDate(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new HttpError(500, "date_format_error", "Unable to format date.");
  }

  return `${year}-${month}-${day}`;
}

export function shiftDate(dateString: string, days: number): string {
  if (!dateString) {
    return dateString;
  }
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function zonedDayToUtc(timeZone: string, dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const utcCandidate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  for (let hour = -14; hour <= 14; hour += 1) {
    const candidate = new Date(utcCandidate.getTime() - hour * 60 * 60 * 1000);
    if (formatZonedDate(candidate, timeZone) === dateString) {
      const hourInZone = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        hour12: false,
        timeZone,
      }).format(candidate);

      if (hourInZone === "00" || hourInZone === "24") {
        return candidate;
      }
    }
  }

  return utcCandidate;
}
