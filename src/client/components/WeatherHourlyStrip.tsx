import type { WeatherResponse } from "../../shared/types";
import { Clock3 } from "lucide-react";
import { formatHourLabel } from "../lib/formatters";
import { getHourlyTone } from "../lib/hourlyTone";
import { getTemperatureTone } from "../lib/temperatureTone";
import { SectionFrame } from "./SectionFrame";
import { WeatherIcon } from "./WeatherIcon";

interface WeatherHourlyStripProps {
  weather: WeatherResponse | null;
  error: string | null;
}

export function WeatherHourlyStrip({ weather, error }: WeatherHourlyStripProps) {
  const visibleHours = weather?.hourly.slice(0, 10) || [];

  return (
    <SectionFrame
      eyebrow="Weather"
      title="Hourly forecast"
      icon={<Clock3 aria-hidden="true" strokeWidth={1.8} />}
    >
      <div className="hourly-strip">
        {error ? <div className="state-message">{error}</div> : null}
        {!error &&
          visibleHours.map((hour) => (
            <div className="hourly-card" key={hour.time}>
              <div className={`hourly-time hourly-time-${getHourlyTone(hour.time, weather?.daily || [])}`}>
                {formatHourLabel(hour.time)}
              </div>
              <div className="hourly-icon">
                <WeatherIcon code={hour.weatherCode} isDay />
              </div>
              <div
                className={`hourly-temp temperature-${getTemperatureTone(
                  Math.round(hour.temperature),
                )}`}
              >
                {Math.round(hour.temperature)}°
              </div>
              <div className="hourly-precip">{hour.precipitationProbability}%</div>
            </div>
          ))}
      </div>
    </SectionFrame>
  );
}
