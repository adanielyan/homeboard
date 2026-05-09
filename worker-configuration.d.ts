interface Env {
  APP_AUTH_TOKEN: string;
  WEATHER_LATITUDE: string;
  WEATHER_LONGITUDE: string;
  WEATHER_LOCATION_LABEL?: string;
  WEATHER_TEMPERATURE_UNIT?: "fahrenheit" | "celsius";
  WEATHER_WIND_SPEED_UNIT?: "mph" | "kmh" | "kn";
  WEATHER_PRECIPITATION_UNIT?: "inch" | "mm";
  PRIMARY_TIMEZONE: string;
  SECONDARY_TIMEZONE: string;
  PRIMARY_TIMEZONE_LABEL?: string;
  SECONDARY_TIMEZONE_LABEL?: string;
  DISPLAY_LOCALE?: string;
  CALENDAR_ICAL_URL: string;
  ASSETS: Fetcher;
}
