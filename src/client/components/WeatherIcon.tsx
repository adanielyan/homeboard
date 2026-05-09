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
  type LucideIcon,
  Moon,
  Sun
} from "lucide-react";

interface WeatherIconProps {
  code: number;
  isDay: boolean;
}

export function WeatherIcon({ code, isDay }: WeatherIconProps) {
  const IconComponent = resolveWeatherIcon(code, isDay);
  const iconClassName =
    "block size-full fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round]";

  if (isDay && (code === 1 || code === 2)) {
    return (
      <span className="relative block size-full" aria-hidden="true">
        <IconComponent
          className={`${iconClassName} absolute inset-0 text-weather-cloud`}
          strokeWidth={1.75}
        />
        <IconComponent
          className={`${iconClassName} absolute inset-0 text-weather-sun [-webkit-mask-image:linear-gradient(to_bottom,var(--color-mask-on)_0%,var(--color-mask-on)_24%,var(--color-mask-mid)_48%,var(--color-mask-off)_78%)] [mask-image:linear-gradient(to_bottom,var(--color-mask-on)_0%,var(--color-mask-on)_24%,var(--color-mask-mid)_48%,var(--color-mask-off)_78%)]`}
          strokeWidth={1.75}
        />
      </span>
    );
  }

  const toneClassName = resolveWeatherToneClass(code, isDay);

  return (
    <IconComponent
      className={`${iconClassName} ${toneClassName}`}
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
    return CloudRain;
  }

  if (code >= 71) {
    return CloudSnow;
  }

  if (code >= 61) {
    return CloudRain;
  }

  if (code >= 51) {
    return isDay ? CloudDrizzle : CloudMoonRain;
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

  return isDay ? Sun : Moon;
}

function resolveWeatherToneClass(code: number, isDay: boolean): string {
  if (code >= 71) {
    return "text-weather-snow";
  }

  if (code >= 51) {
    return "text-weather-rain";
  }

  if (code === 45 || code === 48 || code === 3) {
    return "text-weather-cloud";
  }

  if (!isDay) {
    return "text-weather-moon";
  }

  return "text-weather-sun";
}
