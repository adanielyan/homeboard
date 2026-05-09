import type { AppConfig } from "../../src/shared/types";
import { buildClockSnapshot } from "../../src/client/services/currentTimeService";

const config: AppConfig = {
  locale: "en-US",
  primaryTimezone: "America/New_York",
  secondaryTimezone: "America/Los_Angeles",
  primaryTimezoneLabel: "Home",
  secondaryTimezoneLabel: "West Coast",
  weatherLocationLabel: "Gaithersburg",
  weatherPollIntervalMs: 600000,
  calendarPollIntervalMs: 300000,
  clockTickIntervalMs: 1000
};

describe("buildClockSnapshot", () => {
  it("formats the same moment for both configured time zones", () => {
    const snapshot = buildClockSnapshot(new Date("2026-05-09T18:15:00.000Z"), config);

    expect(snapshot.primary.timeLabel).toBe("2:15 PM");
    expect(snapshot.primary.preciseTimeLabel).toBe("2:15:00 PM");
    expect(snapshot.secondary.timeLabel).toBe("11:15 AM");
    expect(snapshot.secondary.preciseTimeLabel).toBe("11:15:00 AM");
    expect(snapshot.primary.dateLabel).toContain("May");
    expect(snapshot.secondary.dateLabel).toContain("May");
  });
});
