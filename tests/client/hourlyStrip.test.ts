import type { WeatherHourlyPoint } from "../../src/shared/types";
import { selectUpcomingHours } from "../../src/client/components/WeatherHourlyStrip";

const hourly: WeatherHourlyPoint[] = [
  "2026-05-09T18:00",
  "2026-05-09T19:00",
  "2026-05-09T20:00",
  "2026-05-09T21:00",
  "2026-05-09T22:00",
  "2026-05-09T23:00",
  "2026-05-10T00:00",
  "2026-05-10T01:00",
  "2026-05-10T02:00",
  "2026-05-10T03:00",
  "2026-05-10T04:00",
].map((time, index) => ({
  time,
  temperature: 20 - index,
  apparentTemperature: 20 - index,
  precipitationProbability: 0,
  precipitation: 0,
  weatherCode: 1,
  weatherDescription: "Mostly clear",
  cloudCover: 10,
  windSpeed: 3,
  windGusts: 4,
}));

describe("selectUpcomingHours", () => {
  it("starts with the next hour after the current zoned time", () => {
    const visible = selectUpcomingHours(
      hourly,
      new Date("2026-05-09T22:28:00.000Z"),
      "America/New_York",
    );

    expect(visible[0]?.time).toBe("2026-05-09T19:00");
    expect(visible).toHaveLength(10);
  });
});
