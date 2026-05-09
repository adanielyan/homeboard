import type { AppConfig, WeatherResponse } from "../../shared/types";
import { hourlyToneTextClass, temperatureToneTextClass } from "../lib/colorClasses";
import { getHourlyTone } from "../lib/hourlyTone";
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
  const heroBackdropStyle = {
    backgroundImage:
      "radial-gradient(circle at 18% 12%, rgba(72,149,255,0.18), transparent 18%), linear-gradient(180deg, rgba(6,26,54,0.85), rgba(2,8,16,0.9)), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180' viewBox='0 0 300 180'%3E%3Cg fill='white' fill-opacity='.12'%3E%3Ccircle cx='18' cy='22' r='1.2'/%3E%3Ccircle cx='60' cy='40' r='1'/%3E%3Ccircle cx='112' cy='26' r='1.2'/%3E%3Ccircle cx='174' cy='34' r='1.1'/%3E%3Ccircle cx='210' cy='18' r='1.2'/%3E%3Ccircle cx='268' cy='42' r='1'/%3E%3Ccircle cx='242' cy='78' r='1.1'/%3E%3Ccircle cx='54' cy='94' r='1.2'/%3E%3Ccircle cx='118' cy='112' r='1'/%3E%3Ccircle cx='276' cy='126' r='1.2'/%3E%3C/g%3E%3C/svg%3E\")",
  } as const;

  return (
    <section className="relative min-h-0 overflow-hidden rounded-[24px] border border-[rgba(124,158,224,0.2)] bg-[linear-gradient(180deg,rgba(11,22,40,0.92)_0%,rgba(8,16,29,0.96)_100%)] shadow-board-panel">
      <div className="absolute inset-0 opacity-[0.98]" style={heroBackdropStyle} />
      <div className="relative z-[1] grid h-full grid-rows-[auto_minmax(0,1fr)] gap-[clamp(0.18rem,0.35vw,0.4rem)] p-[clamp(14px,1.2vw,22px)] max-[1500px]:p-4 [@media(max-height:980px)]:p-4">
        <header className="grid gap-3 sm:flex sm:items-start sm:justify-between">
          <div className="grid content-start gap-[0.08rem]">
            <div className="max-w-full text-[clamp(1.45rem,1.95vw,2.15rem)] leading-[1.05] font-semibold [letter-spacing:0.012em]">
              {weather?.locationLabel || config.weatherLocationLabel}
            </div>
            <div className="text-[clamp(0.82rem,0.95vw,1rem)] text-[rgba(219,234,254,0.82)]">
              {clock?.primary.dateLabel || "Loading time..."}
            </div>
          </div>
          <div className="grid min-w-0 content-start gap-[0.08rem] text-left sm:text-right">
            <div className="text-[0.78rem] uppercase text-[#7fb4ff] [letter-spacing:0.12em]">
              {config.secondaryTimezoneLabel}
            </div>
            <div className="text-[clamp(1.05rem,1.45vw,1.6rem)] leading-none font-semibold">
              {clock?.secondary.timeLabel || "--:--"}
            </div>
            <div className="text-[clamp(0.82rem,0.95vw,1rem)] text-[rgba(219,234,254,0.82)]">
              {clock?.secondary.dateLabel || ""}
            </div>
          </div>
        </header>

        <div className="grid min-h-0 items-start gap-[clamp(0.55rem,0.8vw,0.95rem)] overflow-visible [grid-template-columns:minmax(0,0.88fr)_minmax(7rem,0.5fr)_minmax(0,0.82fr)] max-[1500px]:[grid-template-columns:minmax(0,0.9fr)_minmax(6rem,0.42fr)_minmax(0,0.75fr)] max-[1280px]:[grid-template-columns:minmax(0,1fr)_minmax(6rem,0.45fr)] max-[900px]:grid-cols-1 [@media(max-height:980px)]:[grid-template-columns:minmax(0,0.9fr)_minmax(6rem,0.42fr)_minmax(0,0.75fr)]">
          <div className="grid min-h-0 auto-rows-max content-start gap-[0.28rem] self-start">
            <div className="mb-[0.45rem] block">
              <div
                className={`block text-[clamp(2.5rem,3.8vw,3.6rem)] leading-[0.95] font-bold [letter-spacing:0.03em] ${hourlyToneTextClass(heroTimeTone)}`}
              >
                {primaryTimeLabel}
              </div>
            </div>
            <div className="grid gap-[0.2rem]">
              <div
                className={`text-[clamp(3.8rem,6vw,5.4rem)] leading-[0.82] font-semibold [letter-spacing:0.02em] max-[1500px]:text-[clamp(3.2rem,5vw,4.5rem)] [@media(max-height:980px)]:text-[clamp(3.2rem,5vw,4.5rem)] ${currentTemperature === null ? "text-board-text" : temperatureToneTextClass(currentTemperature)}`}
              >
                {currentTemperature ?? "--"}
                <span className="align-top text-[0.46em]">°</span>
              </div>
              <div className="text-[clamp(0.88rem,0.96vw,1rem)] leading-[1.2] text-[rgba(226,232,240,0.82)]">
                Feels like {weather ? Math.round(weather.current.apparentTemperature) : "--"}°
              </div>
            </div>
          </div>

          <div className="grid size-[clamp(5.5rem,8vw,8rem)] place-items-center self-center justify-self-center max-[1500px]:size-[clamp(5rem,7vw,7rem)] [@media(max-height:980px)]:size-[clamp(5rem,7vw,7rem)]">
            <WeatherIcon code={weather?.current.weatherCode || 0} isDay={weather?.current.isDay ?? true} />
          </div>

          <div className="grid min-h-0 gap-[0.28rem] self-center max-[1280px]:col-span-full">
            <div className="text-[clamp(1.15rem,1.7vw,1.75rem)] leading-[1.05] font-medium">
              {weather?.current.weatherDescription || "Waiting for weather data"}
            </div>
            <div className="text-[clamp(0.88rem,0.96vw,1rem)] leading-[1.2] text-[rgba(226,232,240,0.82)]">
              {error
                ? error
                : weather
                  ? `${weather.current.windSpeed}${weather.units.windSpeed} wind, ${weather.current.humidity}% humidity.`
                  : "Loading current conditions."}
            </div>
            <div className="flex flex-wrap gap-[0.65rem] text-[clamp(0.9rem,0.98vw,1rem)]">
              <span className="text-[#ffb74d]">
                High {weather ? Math.round(weather.daily[0]?.temperatureMax ?? weather.current.temperature) : "--"}°
              </span>
              <span className="text-[#67b1ff]">
                Low {weather ? Math.round(weather.daily[0]?.temperatureMin ?? weather.current.temperature) : "--"}°
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
