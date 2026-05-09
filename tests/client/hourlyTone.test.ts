import type { WeatherDailyPoint } from "../../src/shared/types";
import { getHourlyTone } from "../../src/client/lib/hourlyTone";

const daily: WeatherDailyPoint[] = [
  {
    date: "2026-05-09",
    sunrise: "2026-05-09T06:00",
    sunset: "2026-05-09T20:00",
    temperatureMax: 78,
    temperatureMin: 59,
    precipitationSum: 0,
    precipitationProbabilityMax: 10,
    weatherCode: 2,
    weatherDescription: "Partly cloudy"
  }
];

describe("getHourlyTone", () => {
  it("marks the post-sunrise and pre-sunset hours as sun-edge", () => {
    expect(getHourlyTone("2026-05-09T06:00", daily)).toBe("sun-edge");
    expect(getHourlyTone("2026-05-09T19:00", daily)).toBe("sun-edge");
  });

  it("marks daytime hours as day", () => {
    expect(getHourlyTone("2026-05-09T12:00", daily)).toBe("day");
  });

  it("marks overnight hours as night", () => {
    expect(getHourlyTone("2026-05-09T03:00", daily)).toBe("night");
    expect(getHourlyTone("2026-05-09T21:00", daily)).toBe("night");
  });
});
