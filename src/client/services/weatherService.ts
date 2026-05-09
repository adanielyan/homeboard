import type { WeatherResponse } from "../../shared/types";
import { ApiClient } from "./apiClient";

export class WeatherService {
  constructor(private readonly apiClient: ApiClient) {}

  getWeather(): Promise<WeatherResponse> {
    return this.apiClient.getWeather();
  }
}
