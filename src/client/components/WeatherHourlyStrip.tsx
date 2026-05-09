import type { AppConfig, WeatherHourlyPoint, WeatherResponse } from "../../shared/types";
import { Clock3 } from "lucide-react";
import { hourlyToneTextClass, temperatureToneTextClass } from "../lib/colorClasses";
import { formatHourLabel } from "../lib/formatters";
import { getHourlyTone } from "../lib/hourlyTone";
import { SectionFrame } from "./SectionFrame";
import { WeatherIcon } from "./WeatherIcon";

interface WeatherHourlyStripProps {
  config: AppConfig;
  clockTick: unknown;
  weather: WeatherResponse | null;
  error: string | null;
}

export function WeatherHourlyStrip({
  config,
  clockTick,
  weather,
  error,
}: WeatherHourlyStripProps) {
  void clockTick;
  const visibleHours = weather
    ? selectUpcomingHours(weather.hourly, new Date(), config.primaryTimezone)
    : [];

  return (
    <SectionFrame
      eyebrow="Weather"
      title="Hourly forecast"
      icon={<Clock3 aria-hidden="true" strokeWidth={1.8} />}
    >
      <div className="grid h-auto content-start items-start gap-[0.35rem] pt-[0.2rem] [grid-template-columns:repeat(10,minmax(0,1fr))] max-[1280px]:grid-cols-5 max-[900px]:gap-[0.45rem] max-[900px]:grid-cols-5">
        {error ? (
          <div className="px-[0.1rem] py-[0.2rem] text-[0.96rem] text-text-muted">
            {error}
          </div>
        ) : null}
        {!error &&
          visibleHours.map((hour) => {
            const tone = getHourlyTone(hour.time, weather?.daily || []);
            return (
              <div
                className="grid min-w-0 content-center justify-items-center gap-[0.3rem] px-[0.12rem] py-[0.2rem]"
                key={hour.time}
              >
                <div
                  className={`text-[1rem] leading-[1.05] ${hourlyToneTextClass(tone)}`}
                >
                  {formatHourLabel(hour.time)}
                </div>
                <div className="size-[1.85rem]">
                  <WeatherIcon code={hour.weatherCode} isDay={tone !== "night"} />
                </div>
                <div
                  className={`text-[1.02rem] leading-none font-semibold ${temperatureToneTextClass(Math.round(hour.temperature))}`}
                >
                  {Math.round(hour.temperature)}°
                </div>
                <div className="text-[1rem] leading-[1.05] text-text-frost-soft">
                  {hour.precipitationProbability}%
                </div>
              </div>
            );
          })}
      </div>
    </SectionFrame>
  );
}

export function selectUpcomingHours(
  hourly: WeatherHourlyPoint[],
  now: Date,
  timeZone: string,
): WeatherHourlyPoint[] {
  const currentZonedMinute = formatZonedMinute(now, timeZone);
  const nextIndex = hourly.findIndex((hour) => hour.time > currentZonedMinute);

  if (nextIndex < 0) {
    return hourly.slice(0, 10);
  }

  return hourly.slice(nextIndex, nextIndex + 10);
}

function formatZonedMinute(value: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(value);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${year}-${month}-${day}T${hour}:${minute}`;
}
