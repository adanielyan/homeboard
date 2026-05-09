import type { AppConfig, CalendarEventsResponse, WeatherResponse } from "../../shared/types";

export class ApiClient {
  private readonly headers: HeadersInit;

  constructor(headers: HeadersInit) {
    this.headers = headers;
  }

  getConfig(): Promise<AppConfig> {
    return this.fetchJson<AppConfig>("/api/config");
  }

  getWeather(): Promise<WeatherResponse> {
    return this.fetchJson<WeatherResponse>("/api/weather");
  }

  getCalendarEvents(): Promise<CalendarEventsResponse> {
    return this.fetchJson<CalendarEventsResponse>("/api/calendar/events");
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const response = await fetch(path, {
      headers: this.headers
    });

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const payload = (await response.json()) as { message?: string };
        if (payload.message) {
          message = payload.message;
        }
      } catch {
        // Ignore response parsing failures and keep the default message.
      }
      throw new Error(message);
    }

    return (await response.json()) as T;
  }
}
