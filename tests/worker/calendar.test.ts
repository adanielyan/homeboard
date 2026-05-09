import { createCalendarWindow, normalizeCalendarEvent, normalizeCalendarResponse, shiftDate } from "../../src/worker/services/calendar";

describe("calendar service", () => {
  it("normalizes timed and all-day Google events", () => {
    const timed = normalizeCalendarEvent(
      {
        id: "timed",
        summary: "Team Standup",
        start: { dateTime: "2026-05-09T09:00:00-04:00" },
        end: { dateTime: "2026-05-09T09:30:00-04:00" }
      },
      "America/New_York"
    );

    const allDay = normalizeCalendarEvent(
      {
        id: "all-day",
        summary: "Vacation",
        start: { date: "2026-05-10" },
        end: { date: "2026-05-11" }
      },
      "America/New_York"
    );

    expect(timed?.isAllDay).toBe(false);
    expect(allDay?.isAllDay).toBe(true);
    expect(allDay?.end.startsWith("2026-05-10")).toBe(true);
  });

  it("groups events into today and the next seven days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T14:00:00.000Z"));

    const grouped = normalizeCalendarResponse(
      {
        items: [
          {
            id: "1",
            summary: "Morning standup",
            start: { dateTime: "2026-05-09T09:00:00-04:00" },
            end: { dateTime: "2026-05-09T09:30:00-04:00" }
          },
          {
            id: "2",
            summary: "Client presentation",
            start: { dateTime: "2026-05-12T10:00:00-04:00" },
            end: { dateTime: "2026-05-12T11:00:00-04:00" }
          }
        ]
      },
      "America/New_York",
      "en-US"
    );

    expect(grouped.today.date).toBe("2026-05-09");
    expect(grouped.today.events).toHaveLength(1);
    expect(grouped.upcomingDays).toHaveLength(7);
    expect(grouped.upcomingDays.find((day) => day.date === "2026-05-12")?.events).toHaveLength(1);

    vi.useRealTimers();
  });

  it("creates an eight-day API window starting from the configured day", () => {
    const window = createCalendarWindow("America/New_York", new Date("2026-05-09T14:00:00.000Z"));

    expect(window.timeMin).toContain("T");
    expect(window.timeMax).toContain("T");
    expect(shiftDate("2026-05-09", 7)).toBe("2026-05-16");
  });
});
