import type { WeatherResponse } from "../../shared/types";
import { Clock3 } from "lucide-react";
import { hourlyToneTextClass, temperatureToneTextClass } from "../lib/colorClasses";
import { formatHourLabel } from "../lib/formatters";
import { getHourlyTone } from "../lib/hourlyTone";
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
      <div className="grid h-auto content-start items-start gap-[0.35rem] pt-[0.2rem] [grid-template-columns:repeat(10,minmax(0,1fr))] max-[1280px]:grid-cols-5 max-[900px]:gap-[0.45rem] max-[900px]:grid-cols-5">
        {error ? (
          <div className="px-[0.1rem] py-[0.2rem] text-[0.96rem] text-[rgba(191,203,227,0.78)]">
            {error}
          </div>
        ) : null}
        {!error &&
          visibleHours.map((hour) => (
            <div
              className="grid min-w-0 content-center justify-items-center gap-[0.3rem] px-[0.12rem] py-[0.2rem]"
              key={hour.time}
            >
              <div
                className={`text-[1rem] leading-[1.05] ${hourlyToneTextClass(getHourlyTone(hour.time, weather?.daily || []))}`}
              >
                {formatHourLabel(hour.time)}
              </div>
              <div className="size-[1.85rem]">
                <WeatherIcon code={hour.weatherCode} isDay />
              </div>
              <div
                className={`text-[1.02rem] leading-none font-semibold ${temperatureToneTextClass(Math.round(hour.temperature))}`}
              >
                {Math.round(hour.temperature)}°
              </div>
              <div className="text-[1rem] leading-[1.05] text-[rgba(219,234,254,0.74)]">
                {hour.precipitationProbability}%
              </div>
            </div>
          ))}
      </div>
    </SectionFrame>
  );
}
