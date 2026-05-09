import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  type LucideIcon,
  MoonStar,
  Sun
} from "lucide-react";

interface WeatherIconProps {
  code: number;
  isDay: boolean;
}

export function WeatherIcon({ code, isDay }: WeatherIconProps) {
  const IconComponent = resolveWeatherIcon(code, isDay);

  if (isDay && (code === 1 || code === 2)) {
    return (
      <span className="weather-icon-duotone" aria-hidden="true">
        <IconComponent
          className="weather-icon weather-icon-cloud"
          strokeWidth={1.75}
        />
        <IconComponent
          className="weather-icon weather-icon-partly-sun"
          strokeWidth={1.75}
        />
      </span>
    );
  }

  const toneClassName = resolveWeatherToneClass(code);

  return (
    <IconComponent
      className={`weather-icon ${toneClassName}`}
      aria-hidden="true"
      strokeWidth={1.75}
    />
  );
}

function resolveWeatherIcon(code: number, isDay: boolean): LucideIcon {
  if (code >= 95) {
    return CloudLightning;
  }

  if (code >= 80) {
    return isDay ? CloudSunRain : CloudMoonRain;
  }

  if (code >= 71) {
    return CloudSnow;
  }

  if (code >= 61) {
    return CloudRain;
  }

  if (code >= 51) {
    return CloudDrizzle;
  }

  if (code === 45 || code === 48) {
    return CloudFog;
  }

  if (code === 3) {
    return Cloud;
  }

  if (code === 1 || code === 2) {
    return isDay ? CloudSun : CloudMoon;
  }

  return isDay ? Sun : MoonStar;
}

function resolveWeatherToneClass(code: number): string {
  if (code >= 71) {
    return "weather-icon-snow";
  }

  if (code >= 51) {
    return "weather-icon-rain";
  }

  if (code === 45 || code === 48 || code === 3) {
    return "weather-icon-cloud";
  }

  return "weather-icon-sun";
}
