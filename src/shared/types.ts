export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export interface AppConfig {
  locale: string;
  primaryTimezone: string;
  secondaryTimezone: string;
  primaryTimezoneLabel: string;
  secondaryTimezoneLabel: string;
  weatherLocationLabel: string;
  weatherPollIntervalMs: number;
  calendarPollIntervalMs: number;
  clockTickIntervalMs: number;
}

export interface WeatherCurrent {
  observedAt: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  weatherDescription: string;
  cloudCover: number;
  windSpeed: number;
  windGusts: number;
  isDay: boolean;
}

export interface WeatherHourlyPoint {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  cloudCover: number;
  windSpeed: number;
  windGusts: number;
}

export interface WeatherDailyPoint {
  date: string;
  sunrise: string;
  sunset: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface WeatherUnits {
  temperature: string;
  windSpeed: string;
  precipitation: string;
}

export interface WeatherResponse {
  locationLabel: string;
  current: WeatherCurrent;
  hourly: WeatherHourlyPoint[];
  daily: WeatherDailyPoint[];
  units: WeatherUnits;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
  description?: string;
  location?: string;
}

export interface CalendarDayGroup {
  date: string;
  events: CalendarEvent[];
}

export interface CalendarEventsResponse {
  today: CalendarDayGroup;
  upcomingDays: CalendarDayGroup[];
}
