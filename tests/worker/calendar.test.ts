import {
  createCalendarWindow,
  normalizeCalendarResponse,
  parseIcsEvents,
  shiftDate,
} from "../../src/worker/services/calendar";

function ics(body: string): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Test//EN",
    body.trim(),
    "END:VCALENDAR",
  ].join("\r\n");
}

describe("calendar service", () => {
  it("parses a timed VEVENT into a CalendarEvent", () => {
    const window = createCalendarWindow(
      "America/New_York",
      new Date("2026-05-09T14:00:00.000Z"),
    );
    const feed = ics(
      [
        "BEGIN:VEVENT",
        "UID:standup-1",
        "SUMMARY:Team Standup",
        "DTSTART:20260509T130000Z",
        "DTEND:20260509T133000Z",
        "END:VEVENT",
      ].join("\r\n"),
    );

    const events = parseIcsEvents(feed, window);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      title: "Team Standup",
      isAllDay: false,
      start: "2026-05-09T13:00:00.000Z",
      end: "2026-05-09T13:30:00.000Z",
    });
  });

  it("parses an all-day VEVENT and shifts the inclusive end back one day", () => {
    const window = createCalendarWindow(
      "America/New_York",
      new Date("2026-05-09T14:00:00.000Z"),
    );
    const feed = ics(
      [
        "BEGIN:VEVENT",
        "UID:vacation-1",
        "SUMMARY:Vacation",
        "DTSTART;VALUE=DATE:20260510",
        "DTEND;VALUE=DATE:20260512",
        "END:VEVENT",
      ].join("\r\n"),
    );

    const events = parseIcsEvents(feed, window);

    expect(events).toHaveLength(1);
    expect(events[0].isAllDay).toBe(true);
    expect(events[0].start).toBe("2026-05-10T00:00:00.000Z");
    expect(events[0].end.startsWith("2026-05-11")).toBe(true);
  });

  it("expands recurring events within the window", () => {
    const window = createCalendarWindow(
      "America/New_York",
      new Date("2026-05-09T14:00:00.000Z"),
    );
    const feed = ics(
      [
        "BEGIN:VEVENT",
        "UID:standup-recurring",
        "SUMMARY:Daily Standup",
        "DTSTART:20260509T130000Z",
        "DTEND:20260509T133000Z",
        "RRULE:FREQ=DAILY;COUNT=4",
        "END:VEVENT",
      ].join("\r\n"),
    );

    const events = parseIcsEvents(feed, window);
    const startDates = events.map((event) => event.start.slice(0, 10)).sort();

    expect(events).toHaveLength(4);
    expect(startDates).toEqual([
      "2026-05-09",
      "2026-05-10",
      "2026-05-11",
      "2026-05-12",
    ]);
  });

  it("groups events into today and the next seven days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T14:00:00.000Z"));

    const grouped = normalizeCalendarResponse(
      [
        {
          id: "today",
          title: "Afternoon standup",
          start: "2026-05-09T18:00:00.000Z",
          end: "2026-05-09T18:30:00.000Z",
          isAllDay: false,
        },
        {
          id: "later",
          title: "Client presentation",
          start: "2026-05-12T14:00:00.000Z",
          end: "2026-05-12T15:00:00.000Z",
          isAllDay: false,
        },
      ],
      "America/New_York",
      "en-US",
    );

    expect(grouped.today.date).toBe("2026-05-09");
    expect(grouped.today.events).toHaveLength(1);
    expect(grouped.upcomingDays).toHaveLength(7);
    expect(
      grouped.upcomingDays.find((day) => day.date === "2026-05-12")?.events,
    ).toHaveLength(1);

    vi.useRealTimers();
  });

  it("hides past events from today's group", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T18:00:00.000Z"));

    const grouped = normalizeCalendarResponse(
      [
        {
          id: "past",
          title: "Past event",
          start: "2026-05-09T13:00:00.000Z",
          end: "2026-05-09T14:00:00.000Z",
          isAllDay: false,
        },
        {
          id: "future",
          title: "Future event",
          start: "2026-05-09T20:00:00.000Z",
          end: "2026-05-09T21:00:00.000Z",
          isAllDay: false,
        },
      ],
      "America/New_York",
      "en-US",
    );

    expect(grouped.today.events.map((e) => e.id)).toEqual(["future"]);

    vi.useRealTimers();
  });

  it("creates an eight-day API window starting from the configured day", () => {
    const window = createCalendarWindow(
      "America/New_York",
      new Date("2026-05-09T14:00:00.000Z"),
    );

    expect(window.timeMin).toContain("T");
    expect(window.timeMax).toContain("T");
    expect(window.endMs - window.startMs).toBe(8 * 24 * 60 * 60 * 1000);
    expect(shiftDate("2026-05-09", 7)).toBe("2026-05-16");
  });
});
