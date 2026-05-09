import type { WeatherDailyPoint } from "../../shared/types";

export type HourlyTone = "sun-edge" | "day" | "night";

export function getHourlyTone(hourTime: string, daily: WeatherDailyPoint[]): HourlyTone {
  const day = daily.find((entry) => entry.date === hourTime.slice(0, 10));

  if (!day) {
    return "day";
  }

  const hourTs = parseLocalDateTime(hourTime);
  const sunriseTs = parseLocalDateTime(day.sunrise);
  const sunsetTs = parseLocalDateTime(day.sunset);

  if (Number.isNaN(hourTs) || Number.isNaN(sunriseTs) || Number.isNaN(sunsetTs)) {
    return "day";
  }

  const oneHourMs = 60 * 60 * 1000;
  const isAfterSunrise = hourTs >= sunriseTs && hourTs < sunriseTs + oneHourMs;
  const isBeforeSunset = hourTs >= sunsetTs - oneHourMs && hourTs < sunsetTs;

  if (isAfterSunrise || isBeforeSunset) {
    return "sun-edge";
  }

  if (hourTs >= sunriseTs && hourTs < sunsetTs) {
    return "day";
  }

  return "night";
}

function parseLocalDateTime(value: string): number {
  const normalized = value.length === 10 ? `${value}T00:00` : value;
  const [datePart, timePart] = normalized.split("T");

  if (!datePart || !timePart) {
    return Number.NaN;
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  return Date.UTC(year, month - 1, day, hour, minute || 0, 0);
}
