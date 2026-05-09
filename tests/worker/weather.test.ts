import { buildWeatherUrl, normalizeWeatherResponse } from "../../src/worker/services/weather";

describe("weather service", () => {
  it("builds the Open-Meteo request with the configured location and units", () => {
    const url = new URL(
      buildWeatherUrl({
        WEATHER_LATITUDE: "39.0840",
        WEATHER_LONGITUDE: "-77.1528",
        WEATHER_TEMPERATURE_UNIT: "fahrenheit",
        WEATHER_WIND_SPEED_UNIT: "mph",
        WEATHER_PRECIPITATION_UNIT: "inch"
      } as Env)
    );

    expect(url.searchParams.get("latitude")).toBe("39.0840");
    expect(url.searchParams.get("longitude")).toBe("-77.1528");
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(url.searchParams.get("forecast_days")).toBe("8");
  });

  it("normalizes the weather payload into the app contract", () => {
    const normalized = normalizeWeatherResponse(
      {
        current: {
          time: "2026-05-09T10:00",
          temperature_2m: 72,
          apparent_temperature: 74,
          relative_humidity_2m: 48,
          precipitation: 0,
          rain: 0,
          showers: 0,
          snowfall: 0,
          weather_code: 2,
          cloud_cover: 32,
          wind_speed_10m: 6,
          wind_gusts_10m: 9,
          is_day: 1
        },
        hourly: {
          time: [
            "2026-05-09T11:00",
            "2026-05-09T12:00",
            "2026-05-09T13:00",
            "2026-05-09T14:00",
            "2026-05-09T15:00",
            "2026-05-09T16:00",
            "2026-05-09T17:00",
            "2026-05-09T18:00",
            "2026-05-09T19:00",
            "2026-05-09T20:00"
          ],
          temperature_2m: [72, 74, 75, 76, 77, 77, 76, 74, 71, 67],
          apparent_temperature: [72, 74, 76, 77, 78, 78, 76, 74, 71, 67],
          precipitation_probability: [0, 0, 0, 0, 0, 0, 10, 10, 10, 10],
          precipitation: [0, 0, 0, 0, 0, 0, 0.01, 0.01, 0.01, 0.01],
          weather_code: [2, 2, 1, 1, 1, 1, 2, 2, 2, 1],
          cloud_cover: [32, 30, 28, 28, 30, 32, 35, 38, 40, 18],
          wind_speed_10m: [6, 6, 7, 7, 8, 8, 8, 7, 6, 5],
          wind_gusts_10m: [9, 9, 10, 10, 11, 12, 11, 10, 9, 8]
        },
        daily: {
          time: [
            "2026-05-09",
            "2026-05-10",
            "2026-05-11",
            "2026-05-12",
            "2026-05-13",
            "2026-05-14",
            "2026-05-15",
            "2026-05-16"
          ],
          sunrise: [
            "2026-05-09T06:05",
            "2026-05-10T06:04",
            "2026-05-11T06:03",
            "2026-05-12T06:02",
            "2026-05-13T06:01",
            "2026-05-14T06:00",
            "2026-05-15T05:59",
            "2026-05-16T05:58"
          ],
          sunset: [
            "2026-05-09T19:58",
            "2026-05-10T19:59",
            "2026-05-11T20:00",
            "2026-05-12T20:01",
            "2026-05-13T20:02",
            "2026-05-14T20:03",
            "2026-05-15T20:04",
            "2026-05-16T20:05"
          ],
          temperature_2m_max: [78, 81, 83, 76, 73, 75, 79, 80],
          temperature_2m_min: [59, 61, 64, 60, 58, 57, 60, 62],
          precipitation_sum: [0, 0, 0.1, 0.6, 0.2, 0.1, 0, 0],
          precipitation_probability_max: [10, 0, 10, 40, 20, 10, 0, 5],
          weather_code: [2, 0, 1, 63, 3, 2, 0, 1]
        },
        current_units: {
          temperature_2m: "°F",
          precipitation: "in",
          wind_speed_10m: "mph"
        }
      },
      "Gaithersburg, Maryland"
    );

    expect(normalized.locationLabel).toBe("Gaithersburg, Maryland");
    expect(normalized.current.weatherDescription).toBe("Partly cloudy");
    expect(normalized.daily[0].sunrise).toBe("2026-05-09T06:05");
    expect(normalized.daily[0].sunset).toBe("2026-05-09T19:58");
    expect(normalized.hourly).toHaveLength(10);
    expect(normalized.daily).toHaveLength(8);
  });
});
