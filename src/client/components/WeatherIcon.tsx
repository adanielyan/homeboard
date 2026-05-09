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
  const iconClassName =
    "block size-full fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round]";

  if (isDay && (code === 1 || code === 2)) {
    return (
      <span className="relative block size-full" aria-hidden="true">
        <IconComponent
          className={`${iconClassName} absolute inset-0 text-[#9fb4cc]`}
          strokeWidth={1.75}
        />
        <IconComponent
          className={`${iconClassName} absolute inset-0 text-[#f6d86b] [-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_24%,rgba(0,0,0,0.35)_48%,rgba(0,0,0,0)_78%)] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_24%,rgba(0,0,0,0.35)_48%,rgba(0,0,0,0)_78%)]`}
          strokeWidth={1.75}
        />
      </span>
    );
  }

  const toneClassName = resolveWeatherToneClass(code);

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
    return "text-[#f8fbff]";
  }

  if (code >= 51) {
    return "text-[#67b1ff]";
  }

  if (code === 45 || code === 48 || code === 3) {
    return "text-[#9fb4cc]";
  }

  return "text-[#f6d86b]";
}
