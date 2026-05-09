import type { CalendarEvent } from "../../shared/types";

export function formatLongDate(dateString: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone
  }).format(new Date(`${dateString}T12:00:00.000Z`));
}

export function formatCompactDate(dateString: string, locale: string, timeZone: string): string {
  const weekday = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    timeZone
  }).format(new Date(`${dateString}T12:00:00.000Z`));
  const monthDay = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone
  }).format(new Date(`${dateString}T12:00:00.000Z`));

  return `${weekday} ${monthDay}`;
}

export function formatShortWeekday(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC"
  })
    .format(new Date(`${dateString}T12:00:00.000Z`))
    .toUpperCase();
}

export function formatHourLabel(dateTime: string): string {
  const hour = Number(dateTime.slice(11, 13));
  if (Number.isNaN(hour)) {
    return "--";
  }

  const normalizedHour = hour % 12 || 12;
  const meridiem = hour >= 12 ? "PM" : "AM";
  return `${normalizedHour}${meridiem}`;
}

export function formatEventTimeLabel(dateTime: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone
  })
    .format(new Date(dateTime))
    .replace(/\s+(AM|PM)$/i, "\u00A0$1");
}

export function formatEventTimeRange(event: CalendarEvent, locale: string, timeZone: string): string {
  if (event.isAllDay) {
    return "All day";
  }

  const start = formatEventTimeLabel(event.start, locale, timeZone);
  const end = formatEventTimeLabel(event.end, locale, timeZone);
  return `${start} - ${end}`;
}
