import {
  DEFAULT_CALENDAR_POLL_INTERVAL_MS,
  DEFAULT_CLOCK_TICK_INTERVAL_MS,
  DEFAULT_LOCALE,
  DEFAULT_WEATHER_POLL_INTERVAL_MS
} from "../../shared/constants";
import type { AppConfig } from "../../shared/types";
import { HttpError } from "../utils/http";

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new HttpError(500, "configuration_error", `Missing required environment variable ${name}.`);
  }

  return value;
}

export function getAppConfig(env: Env): AppConfig {
  const primaryTimezone = requireEnv(env.PRIMARY_TIMEZONE, "PRIMARY_TIMEZONE");
  const secondaryTimezone = requireEnv(env.SECONDARY_TIMEZONE, "SECONDARY_TIMEZONE");

  return {
    locale: env.DISPLAY_LOCALE || DEFAULT_LOCALE,
    primaryTimezone,
    secondaryTimezone,
    primaryTimezoneLabel: env.PRIMARY_TIMEZONE_LABEL || primaryTimezone,
    secondaryTimezoneLabel: env.SECONDARY_TIMEZONE_LABEL || secondaryTimezone,
    weatherLocationLabel: env.WEATHER_LOCATION_LABEL || "Configured location",
    weatherPollIntervalMs: DEFAULT_WEATHER_POLL_INTERVAL_MS,
    calendarPollIntervalMs: DEFAULT_CALENDAR_POLL_INTERVAL_MS,
    clockTickIntervalMs: DEFAULT_CLOCK_TICK_INTERVAL_MS
  };
}
