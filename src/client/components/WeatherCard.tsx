import type { AppConfig, WeatherResponse } from "../../shared/types";
import { getHourlyTone } from "../lib/hourlyTone";
import { getTemperatureTone } from "../lib/temperatureTone";
import type { ClockSnapshot } from "../services/currentTimeService";
import { WeatherIcon } from "./WeatherIcon";

interface WeatherCardProps {
  config: AppConfig;
  clock: ClockSnapshot | null;
  weather: WeatherResponse | null;
  error: string | null;
}

export function WeatherCard({ config, clock, weather, error }: WeatherCardProps) {
  const primaryTimeLabel = clock?.primary.preciseTimeLabel || clock?.primary.timeLabel || "--:--:--";
  const heroTimeTone = weather
    ? getHourlyTone(weather.current.observedAt, weather.daily)
    : "day";
  const currentTemperature = weather
    ? Math.round(weather.current.temperature)
    : null;

  return (
    <section className="hero-card">
      <div className="hero-backdrop" />
      <div className="hero-content">
        <header className="hero-header">
          <div className="hero-title-block">
            <div className="hero-location">{weather?.locationLabel || config.weatherLocationLabel}</div>
            <div className="hero-date">{clock?.primary.dateLabel || "Loading time..."}</div>
          </div>
          <div className="hero-secondary-clock">
            <div className="hero-secondary-label">{config.secondaryTimezoneLabel}</div>
            <div className="hero-secondary-time">{clock?.secondary.timeLabel || "--:--"}</div>
            <div className="hero-secondary-date">{clock?.secondary.dateLabel || ""}</div>
          </div>
        </header>

        <div className="hero-main">
          <div className="hero-temp">
            <div className="hero-primary-time-block">
              <div className={`hero-primary-time hourly-time-${heroTimeTone}`}>
                {primaryTimeLabel}
              </div>
            </div>
            <div className="hero-temperature-block">
              <div
                className={[
                  "hero-temperature",
                  currentTemperature === null
                    ? ""
                    : `temperature-${getTemperatureTone(currentTemperature)}`,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {currentTemperature ?? "--"}
                <span className="hero-degree">°</span>
              </div>
              <div className="hero-feels-like">
                Feels like {weather ? Math.round(weather.current.apparentTemperature) : "--"}°
              </div>
            </div>
          </div>

          <div className="hero-icon-wrap">
            <WeatherIcon code={weather?.current.weatherCode || 0} isDay={weather?.current.isDay ?? true} />
          </div>

          <div className="hero-summary">
            <div className="hero-condition">{weather?.current.weatherDescription || "Waiting for weather data"}</div>
            <div className="hero-caption">
              {error
                ? error
                : weather
                  ? `${weather.current.windSpeed}${weather.units.windSpeed} wind, ${weather.current.humidity}% humidity.`
                  : "Loading current conditions."}
            </div>
            <div className="hero-range">
              <span>High {weather ? Math.round(weather.daily[0]?.temperatureMax ?? weather.current.temperature) : "--"}°</span>
              <span>Low {weather ? Math.round(weather.daily[0]?.temperatureMin ?? weather.current.temperature) : "--"}°</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
