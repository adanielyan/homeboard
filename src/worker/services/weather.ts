import type {
  WeatherCurrent,
  WeatherDailyPoint,
  WeatherHourlyPoint,
  WeatherResponse,
  WeatherUnits
} from "../../shared/types";
import { MemoryCache } from "../utils/cache";
import { HttpError } from "../utils/http";

const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;
const weatherCache = new MemoryCache();

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
  current_units: {
    temperature_2m: string;
    precipitation: string;
    wind_speed_10m: string;
  };
}

export async function getWeather(env: Env): Promise<WeatherResponse> {
  const cacheKey = [
    env.WEATHER_LATITUDE,
    env.WEATHER_LONGITUDE,
    env.WEATHER_TEMPERATURE_UNIT,
    env.WEATHER_WIND_SPEED_UNIT,
    env.WEATHER_PRECIPITATION_UNIT
  ].join(":");
  const cached = weatherCache.get<WeatherResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(buildWeatherUrl(env));
  if (!response.ok) {
    throw new HttpError(502, "weather_upstream_error", "Unable to load weather data.");
  }

  const payload = (await response.json()) as OpenMeteoResponse;
  const normalized = normalizeWeatherResponse(payload, env.WEATHER_LOCATION_LABEL || "Configured location");
  weatherCache.set(cacheKey, normalized, WEATHER_CACHE_TTL_MS);
  return normalized;
}

export function buildWeatherUrl(env: Env): string {
  if (!env.WEATHER_LATITUDE || !env.WEATHER_LONGITUDE) {
    throw new HttpError(500, "configuration_error", "Weather coordinates are not configured.");
  }

  const url = new URL("https://api.open-meteo.com/v1/gfs");
  url.search = new URLSearchParams({
    latitude: env.WEATHER_LATITUDE,
    longitude: env.WEATHER_LONGITUDE,
    forecast_days: "8",
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
      "is_day"
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m"
    ].join(","),
    daily: [
      "sunrise",
      "sunset",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "weather_code"
    ].join(","),
    temperature_unit: env.WEATHER_TEMPERATURE_UNIT || "fahrenheit",
    wind_speed_unit: env.WEATHER_WIND_SPEED_UNIT || "mph",
    precipitation_unit: env.WEATHER_PRECIPITATION_UNIT || "inch",
    timezone: "auto"
  }).toString();

  return url.toString();
}

export function normalizeWeatherResponse(payload: OpenMeteoResponse, locationLabel: string): WeatherResponse {
  const current: WeatherCurrent = {
    observedAt: payload.current.time,
    temperature: payload.current.temperature_2m,
    apparentTemperature: payload.current.apparent_temperature,
    humidity: payload.current.relative_humidity_2m,
    precipitation: payload.current.precipitation,
    rain: payload.current.rain,
    showers: payload.current.showers,
    snowfall: payload.current.snowfall,
    weatherCode: payload.current.weather_code,
    weatherDescription: describeWeatherCode(payload.current.weather_code),
    cloudCover: payload.current.cloud_cover,
    windSpeed: payload.current.wind_speed_10m,
    windGusts: payload.current.wind_gusts_10m,
    isDay: payload.current.is_day === 1
  };

  const hourly: WeatherHourlyPoint[] = payload.hourly.time.slice(0, 10).map((time, index) => ({
    time,
    temperature: payload.hourly.temperature_2m[index],
    apparentTemperature: payload.hourly.apparent_temperature[index],
    precipitationProbability: payload.hourly.precipitation_probability[index],
    precipitation: payload.hourly.precipitation[index],
    weatherCode: payload.hourly.weather_code[index],
    weatherDescription: describeWeatherCode(payload.hourly.weather_code[index]),
    cloudCover: payload.hourly.cloud_cover[index],
    windSpeed: payload.hourly.wind_speed_10m[index],
    windGusts: payload.hourly.wind_gusts_10m[index]
  }));

  const daily: WeatherDailyPoint[] = payload.daily.time.slice(0, 8).map((date, index) => ({
    date,
    sunrise: payload.daily.sunrise[index],
    sunset: payload.daily.sunset[index],
    temperatureMax: payload.daily.temperature_2m_max[index],
    temperatureMin: payload.daily.temperature_2m_min[index],
    precipitationSum: payload.daily.precipitation_sum[index],
    precipitationProbabilityMax: payload.daily.precipitation_probability_max[index],
    weatherCode: payload.daily.weather_code[index],
    weatherDescription: describeWeatherCode(payload.daily.weather_code[index])
  }));

  const units: WeatherUnits = {
    temperature: payload.current_units.temperature_2m,
    windSpeed: payload.current_units.wind_speed_10m,
    precipitation: payload.current_units.precipitation
  };

  return {
    locationLabel,
    current,
    hourly,
    daily,
    units
  };
}

export function describeWeatherCode(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm"
  };

  return descriptions[code] || "Conditions unavailable";
}
