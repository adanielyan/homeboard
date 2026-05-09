import type { WeatherResponse } from "../../shared/types";
import { CalendarRange } from "lucide-react";
import { formatShortWeekday } from "../lib/formatters";
import { SectionFrame } from "./SectionFrame";
import { WeatherIcon } from "./WeatherIcon";

interface WeatherForecastProps {
  weather: WeatherResponse | null;
  error: string | null;
}

export function WeatherForecast({ weather, error }: WeatherForecastProps) {
  return (
    <SectionFrame
      eyebrow="Weather"
      title="7-day forecast"
      icon={<CalendarRange aria-hidden="true" strokeWidth={1.8} />}
    >
      <div className="grid min-h-0 content-start gap-[0.6rem] [grid-template-columns:repeat(7,minmax(0,1fr))] max-[1280px]:grid-cols-4 max-[900px]:grid-cols-3">
        {error ? (
          <div className="px-[0.1rem] py-[0.2rem] text-[0.96rem] text-text-muted">
            {error}
          </div>
        ) : null}
        {!error &&
          weather?.daily.slice(1, 8).map((day) => (
            <div
              className="grid min-w-0 content-start justify-items-center gap-[0.3rem] px-[0.15rem] py-[0.35rem] max-[1500px]:gap-[0.24rem] max-[900px]:gap-[0.22rem] [@media(max-height:980px)]:gap-[0.24rem]"
              key={day.date}
            >
              <div
                className={[
                  "text-[1rem] font-semibold",
                  isWeekendDay(day.date) ? "text-text-weekend" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {formatShortWeekday(day.date)}
              </div>
              <div className="size-[2rem]">
                <WeatherIcon code={day.weatherCode} isDay />
              </div>
              <div className="min-h-[2.3em] max-w-[11ch] text-center text-[0.82rem] leading-[1.15] text-text-frost">
                {day.weatherDescription}
              </div>
              <div className="w-auto text-center text-[0.82rem] [font-variant-numeric:tabular-nums] text-text-frost">
                {day.precipitationProbabilityMax}%
              </div>
              <div className="grid [grid-template-columns:2.4ch_2.4ch] justify-center gap-x-[0.45rem] text-right text-[0.98rem] font-semibold [font-variant-numeric:tabular-nums]">
                <span className="text-temp-warm">{Math.round(day.temperatureMax)}°</span>
                <span className="text-temp-min">{Math.round(day.temperatureMin)}°</span>
              </div>
            </div>
          ))}
      </div>
    </SectionFrame>
  );
}

function isWeekendDay(date: string): boolean {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return weekday === 0 || weekday === 6;
}
