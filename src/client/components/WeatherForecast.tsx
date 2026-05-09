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
      <div className="forecast-table">
        {error ? <div className="state-message">{error}</div> : null}
        {!error &&
          weather?.daily.slice(1, 8).map((day) => (
            <div className="forecast-row" key={day.date}>
              <div
                className={[
                  "forecast-day",
                  isWeekendDay(day.date) ? "forecast-day-weekend" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {formatShortWeekday(day.date)}
              </div>
              <div className="forecast-icon">
                <WeatherIcon code={day.weatherCode} isDay />
              </div>
              <div className="forecast-description">{day.weatherDescription}</div>
              <div className="forecast-precip">
                {day.precipitationProbabilityMax}%
              </div>
              <div className="forecast-range">
                <span>{Math.round(day.temperatureMax)}°</span>
                <span>{Math.round(day.temperatureMin)}°</span>
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
