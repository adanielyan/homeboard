import type { CalendarEventsResponse } from "../../shared/types";
import { ApiClient } from "./apiClient";

export class CalendarService {
  constructor(private readonly apiClient: ApiClient) {}

  getEvents(): Promise<CalendarEventsResponse> {
    return this.apiClient.getCalendarEvents();
  }
}
